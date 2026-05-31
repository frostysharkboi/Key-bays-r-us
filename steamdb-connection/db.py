"""
Moduł odpowiedzialny za bezpośrednią warstwę abstrakcji bazy danych (DAL).
Zarządza połączeniami, weryfikacją struktury plików SQL, pobieraniem liczników
oraz kaskadowym zapisem pełnych pakietów danych o grach w trybie Autocommit.
"""

import os
import re
import mariadb
from config import DB_CONFIG


def get_connection(include_db=True):
    """
    Inicjalizuje i zwraca bezpośrednie połączenie z bazą danych MariaDB.
    Wymusza tryb natychmiastowego zapisu (autocommit) na poziomie sterownika
    w celu eliminacji buforów transakcyjnych i uniknięcia blokad tabel.
    """
    try:
        config = DB_CONFIG.copy()
        if not include_db:
            config.pop("database", None)
            
        conn = mariadb.connect(**config)
        conn.autocommit = True 
        return conn
    except mariadb.Error as e:
        print(f"❌ Błąd połączenia z MariaDB: {e}")
        return None


def execute_sql_file():
    """
    Wczytuje strukturę bazy danych z zewnętrznego pliku *.sql.
    Czyszczą skrypt z komentarzy, a następnie sekwencyjnie wykonuje zapytania.
    Ignoruje instrukcje niszczenia lub rekreacji baz danych w celu ochrony danych.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sql_file_path = os.path.abspath(os.path.join(current_dir, "..", "keybay.sql"))

    if not os.path.exists(sql_file_path):
        print(f"⚠ Ostrzeżenie: Plik {sql_file_path} nie istnieje. Pomijam inicjalizację bazy.")
        return

    print("Weryfikacja bazy danych...")
    conn_init = get_connection(include_db=False)
    if not conn_init:
        return
    
    try:
        cursor = conn_init.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS keybay")
        cursor.close()
        conn_init.close()
    except Exception as e:
        print(f"❌ Błąd podczas sprawdzania struktury bazy danych: {e}")
        return

    conn = get_connection(include_db=True)
    if not conn:
        return

    try:
        with open(sql_file_path, "r", encoding="utf-8") as f:
            full_script = f.read()

        # Oczyszczanie skryptu z komentarzy wieloliniowych oraz jednoliniowych
        full_script = re.sub(r'/\*.*?\*/', '', full_script, flags=re.DOTALL)
        full_script = re.sub(r'--.*?\n', '\n', full_script)
        
        statements = full_script.split(";")
        cursor = conn.cursor()
        for statement in statements:
            cleaned = statement.strip()
            if not cleaned or any(cleaned.lower().startswith(x) for x in ["drop database", "create database", "use "]):
                continue
            try:
                cursor.execute(cleaned)
            except mariadb.Error:
                pass  
        cursor.close()
        print("✔ Struktura bazy danych zweryfikowana.")
    except Exception as e:
        print(f"❌ Błąd tworzenia struktury tabel: {e}")
    finally:
        conn.close()


def get_total_games_count():
    """
    Agreguje i zwraca sumaryczną liczbę wszystkich rekordów gier
    zarejestrowanych w tabeli głównej bazy danych.
    """
    conn = get_connection()
    if not conn: 
        return 0
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM games")
        result = cursor.fetchone()
        return result[0] if result else 0
    except mariadb.Error as e:
        print(f"⚠ Błąd pobierania liczby gier: {e}")
        return 0
    finally:
        conn.close()


def get_current_tag_counts():
    """
    Pobiera aktualny stan liczebności gier przypisanych do konkretnych kategorii.
    Zwraca zmapowany słownik nazw tagów wraz z ich fizyczną ilością w bazie danych.
    """
    from config import TAGS
    counts = {tag: 0 for tag in TAGS.keys()}
    conn = get_connection()
    if not conn: 
        return counts
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT tag_id, COUNT(*) FROM game_tags GROUP BY tag_id")
        for tag_id, count in cursor.fetchall():
            for name, tid in TAGS.items():
                if tid == tag_id:
                    counts[name] = count
        cursor.close()
    except mariadb.Error as e:
        print(f"⚠ Błąd pobierania liczników tagów z bazy: {e}")
    finally:
        conn.close()
    return counts


def save_full_game_transaction(appid, game_data, min_req, opt_req, media_urls, matched_tags):
    """
    Kaskadowo rejestruje pełny zestaw znormalizowanych danych o grze w bazie.
    Zapisuje informacje o metadanych, wymaganiach sprzętowych, multimediach oraz relacjach tagów.
    W przypadku duplikatu klucza głównego (kod 1062), operacja zostaje bezpiecznie zignorowana.
    """
    from config import TAGS
    conn = get_connection()
    if not conn:
        return False

    try:
        cursor = conn.cursor()
        
        # Krok 1: Wstawianie metadanych gry do tabeli głównej
        full_game_data = (appid,) + game_data
        query_game = """
            INSERT INTO games (id, title, developer, publisher, about, steam_rating, release_date, cover_img, icon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query_game, full_game_data)

        # Krok 2: Wstawianie minimalnych wymagań sprzętowych
        query_req = "INSERT INTO min_req (game_id, os, cpu, gpu, ram, size) VALUES (?, ?, ?, ?, ?, ?)"
        cursor.execute(query_req, (appid, min_req["os"], min_req["cpu"], min_req["gpu"], min_req["ram"], min_req["size"]))

        # Krok 3: Wstawianie rekomendowanych wymagań sprzętowych
        query_opt = "INSERT INTO opt_req (game_id, os, cpu, gpu, ram, size) VALUES (?, ?, ?, ?, ?, ?)"
        cursor.execute(query_opt, (appid, opt_req["os"], opt_req["cpu"], opt_req["gpu"], opt_req["ram"], opt_req["size"]))

        # Krok 4: Rejestracja powiązanych odnośników multimedialnych (zrzuty ekranu i wideo)
        query_media = "INSERT INTO media (game_id, source) VALUES (?, ?)"
        for url in media_urls:
            cursor.execute(query_media, (appid, url))

        # Krok 5: Mapowanie i zapisywanie relacji z zaimplementowanymi tagami kategorii
        query_tag = "INSERT IGNORE INTO game_tags (game_id, tag_id) VALUES (?, ?)"
        for tag_name in matched_tags:
            if tag_name in TAGS:
                cursor.execute(query_tag, (appid, TAGS[tag_name]))

        cursor.close()
        return True

    except mariadb.Error as e:
        if e.errno == 1062:
            print(f"  ℹ [DUPLIKAT] AppID {appid} już istnieje w systemie. Pomijanie wstawiania.")
        else:
            print(f"  ❌ [KRYTYCZNY BŁĄD BAZY SQL] Nie można dodać AppID {appid} ({game_data[0]}). Kod: {e.errno} -> {e}")
        return False
    finally:
        conn.close()