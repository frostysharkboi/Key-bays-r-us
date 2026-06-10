"""
Autonomiczny moduł do chirurgicznego importu lub uzupełniania tagów dla pojedynczej gry (AppID: 1244460).
Skrypt samodzielnie odpytuje bazę danych przed operacją zapisu. Jeśli gra już istnieje,
weryfikuje przypisanie każdego tagu za pomocą zapytań SELECT i dopisuje wyłącznie te brakujące.
"""

import time
import mariadb

from config import DELAY, TAGS
from steam_api import get_details, get_steamspy_tags, convert_rating
from parser import parse_req, parse_date
from selector import match_tags
from db import get_connection, save_full_game_transaction, get_total_games_count, get_current_tag_counts
from media import extract_media

# Definicja docelowego identyfikatora AppID dla operacji
TARGET_APPID = 3784760 #632470


def import_or_supplement_tags(appid):
    """
    Sprawdza stan gry w bazie danych. Jeśli gra istnieje, skrypt przechodzi w tryb 
    weryfikacji tagów i dopisuje tylko te, których fizycznie brakuje w tabeli game_tags.
    W przeciwnym wypadku wykonuje pełny import.
    """
    print(f"=== URUCHOMIENIE SKRYPTU DEDYKOWANEGO DLA APPID: {appid} ===")

    # Krok 1: Pobranie zmapowanych tagów z API SteamSpy
    spy_tags = get_steamspy_tags(appid)
    matched = match_tags(spy_tags)
    print(f"🔎 Tagi wykryte przez aplikację dla tego AppID: {matched}")

    if not matched:
        print("⚠ Brak pasujących tagów systemowych dla tej gry. Prosze dodać ręcznie.")

    # Krok 2: Nawiązanie połączenia z bazą w celu sprawdzenia obecności gry
    conn = get_connection()
    if not conn:
        print("❌ Błąd: Nie można nawiązać połączenia z bazą danych.")
        return False

    try:
        cursor = conn.cursor()
        
        # Sprawdzanie, czy gra w ogóle figuruje w tabeli 'games'
        cursor.execute("SELECT COUNT(*) FROM games WHERE id = ?", (appid,))
        game_exists = cursor.fetchone()[0] > 0

        if game_exists:
            print(f"\nℹ [TRYB UZUPEŁNIANIA] Gra o AppID {appid} znajduje się już w bazie danych.")
            print("   Uruchamianie sprawdzania przypisanych tagów przed ich zapisem...")

            query_check_tag = "SELECT COUNT(*) FROM game_tags WHERE game_id = ? AND tag_id = ?"
            query_insert_tag = "INSERT INTO game_tags (game_id, tag_id) VALUES (?, ?)"
            
            tags_added = 0

            for tag_name in matched:
                if tag_name in TAGS:
                    tag_id = TAGS[tag_name]

                    # KROK KLUCZOWY: Sprawdzenie SELECTEM czy relacja gra-tag istnieje przed INSERTEM
                    cursor.execute(query_check_tag, (appid, tag_id))
                    has_tag = cursor.fetchone()[0] > 0

                    if not has_tag:
                        # Zapis następuje tylko wtedy, kiedy powyższy SELECT zwrócił False (0)
                        cursor.execute(query_insert_tag, (appid, tag_id))
                        tags_added += 1
                        print(f"      ➕ [DODANO] Baza nie miała tego powiązania. Dopisanio tag: {tag_name} (ID: {tag_id})")
                    else:
                        # Jeśli SELECT potwierdził obecność, skrypt czysto informuje o pominięciu
                        print(f"      ⏭ [POMINIĘTO] Gra ma już przypisany tag: {tag_name} (ID: {tag_id})")

            if tags_added == 0:
                print("\n📊 Wynik: Wszystkie tagi tej gry były już zapisane w bazie. Nic nie zmieniono.")
            else:
                print(f"\n📊 Wynik: Pomyślnie uzupełniono {tags_added} nowych tagów dla tej gry.")

            cursor.close()
            conn.close()
            return True

        else:
            # Krok 3: Gra nie istnieje – zamknięcie tymczasowego kursora i wykonanie pełnego importu
            print(f"\n✨ [TRYB PEŁNEGO IMPORTU] Brak gry o AppID {appid} w bazie. Pobieranie pełnych danych...")
            cursor.close()
            conn.close()

            # Pobranie specyfikacji ze Steam API
            details = get_details(appid)
            if not details or str(appid) not in details or not details[str(appid)]["success"]:
                print("❌ Błąd: Nie udało się pobrać danych ze Steam API.")
                return False

            d = details[str(appid)]["data"]
            game_name = d.get("name", "")
            
            if not game_name or d.get("type", "game") != "game":
                print("❌ Błąd: Produkt nie jest grą lub nie posiada nazwy.")
                return False

            # Parsowanie metadanych i wymagań sprzętowych
            min_req = parse_req(d.get("pc_requirements", {}).get("minimum", ""))
            opt_req = parse_req(d.get("pc_requirements", {}).get("recommended", ""))
            rating = convert_rating(d.get("metacritic", {}).get("score", 75))
            dev_raw = ", ".join(d.get("developers", [])) if d.get("developers") else "Unknown"
            pub_raw = ", ".join(d.get("publishers", [])) if d.get("publishers") else "Unknown"

            game_data = (
                game_name[:50].strip(),
                dev_raw[:30].strip(),
                pub_raw[:30].strip(),
                d.get("short_description") or "No description available.",
                rating,
                parse_date(d.get("release_date", {}).get("date")),
                d.get("header_image") or "",
                d.get("capsule_image") or ""
            )
            media = extract_media(d)

            # Wywołanie standardowej transakcji zapisu dla nowej encji
            success = save_full_game_transaction(appid, game_data, min_req, opt_req, media, matched)
            if success:
                print(f"✅ Gra '{game_name}' została zaimportowana po raz pierwszy.")
                return True

    except Exception as e:
        print(f"❌ Wystąpił krytyczny błąd wewnątrz skryptu importu: {e}")
        if 'conn' in locals() and conn:
            conn.close()
        return False


if __name__ == "__main__":
    start = time.time()
    import_or_supplement_tags(TARGET_APPID)
    print(f"\n⏱ Czas operacji: {round(time.time() - start, 2)} sekund.")