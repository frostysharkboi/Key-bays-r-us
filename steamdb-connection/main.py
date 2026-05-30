"""
Główny moduł wykonawczy aplikacji (Punkt Wejścia).
Koordynuje przepływ pracy importu: pobiera pule najpopularniejszych aplikacji,
filtruje je dynamicznie pod kątem brakujących tagów, odpytuje o szczegóły techniczne,
zleca ich parsowanie, a na koniec inicjuje operacje zapisu w bazie danych.
"""

import time

from config import DELAY, TAGS
from steam_api import get_global_top_apps, get_details, get_steamspy_tags, convert_rating
from parser import parse_req, parse_date
from selector import match_tags
from db import execute_sql_file, save_full_game_transaction, get_total_games_count, get_current_tag_counts
from media import extract_media


def get_missing_tags(tag_count):
    """
    Dokonuje ewaluacji aktualnego stanu liczników bazy danych.
    Zwraca listę nazw tych kategorii, które nie osiągnęły jeszcze zdefiniowanego limitu docelowego.
    """
    from config import TARGET_PER_TAG
    missing = []
    for tag_name in TAGS.keys():
        if tag_count[tag_name] < TARGET_PER_TAG:
            missing.append(tag_name)
    return missing


def run():
    """
    Uruchamia główną pętlę algorytmu zbierania danych.
    Kontroluje pobieranie zasobów, typów produktów, blokowanie franczyzy Half-Life oraz opóźnienia.
    Wdraża strategię agresywnego filtrowania w momencie, gdy w bazie pozostaną ostatnie dwie kategorie.
    """
    print("=== ROZPOCZĘCIE GLOBALNEGO IMPORTU Z CZARNĄ/BIAŁĄ LISTĄ ===")
    
    print("\n[Krok 1] Sprawdzanie struktury tabel bazy danych...")
    execute_sql_file()
    print("-" * 50)

    # Inicjalne sprawdzenie zapotrzebowania na kategorie
    live_tag_counts = get_current_tag_counts()
    current_missing = get_missing_tags(live_tag_counts)
    
    if not current_missing:
        print("\n✅ Wszystkie kategorie mają już wymagane minimum gier. Koniec.")
        return

    # Pobieranie globalnego zestawu danych z API
    global_apps = get_global_top_apps()
    
    if not global_apps:
        print("❌ Nie udało się załadować listy hitów. Przerywam.")
        return

    print(f"Rozpoczynam proces filtrowania... Cel: uzupełnić kategorie: {current_missing}")
    print("-" * 50)

    # Przetwarzanie sekwencyjne pobranych aplikacji ze Steam
    for game in global_apps:
        # Dynamiczne odświeżanie stanu liczników bazy przy każdej iteracji pętli
        live_tag_counts = get_current_tag_counts()
        current_missing = get_missing_tags(live_tag_counts)
        
        if not current_missing:
            print("\n✅ SUKCES! Wszystkie kategorie osiągnęły wymagane minimum gier.")
            break

        appid = game["appid"]
        
        # Identyfikacja, czy aplikacja znajduje się na liście pozycji wymuszonych (biała lista)
        is_forced_game = appid in [
            287700, 1659040, 3768760, 433340, 988630, 220200, 391540, 1671210,
            1262540, 1262560, 1458140, 2483190, 648350, 1443810, 2958130,
            2131630, 2131640, 2131650, 2417610, 311340, 753640, 352400, 2215200
        ]
        
        try:
            # Pobieranie i selekcja tagów społecznościowych z API SteamSpy
            spy_tags = get_steamspy_tags(appid)
            matched = match_tags(spy_tags)

            if not matched and not is_forced_game:
                continue

            # Walidacja celowości przetwarzania gry na podstawie zapotrzebowania na jej tagi
            if not is_forced_game:
                potrzebny_tag_w_grze = False
                for tag in matched:
                    if tag in current_missing:
                        potrzebny_tag_w_grze = True
                        break

                # Implementacja algorytmu preselekcji dla ostatnich dwóch brakujących kategorii (Racing i Stealth)
                if len(current_missing) <= 2:
                    # Sprawdzanie, czy przetwarzana gra pasuje bezpośrednio do kończących się kategorii
                    specjalne_trafienie = any(t in ["Racing", "Stealth"] for t in matched)
                    if not specjalne_trafienie and not potrzebny_tag_w_grze:
                        # Pomijanie aplikacji bez wyświetlania komunikatów w celu optymalizacji logów konsoli
                        continue
                    elif specjalne_trafienie:
                        print(f"🎯 [TRYB PRECYZYJNY] Wykryto grę dla ostatnich kategorii ({current_missing}): AppID {appid} -> Tagi: {matched}")

                if not potrzebny_tag_w_grze:
                    continue

            # Pobieranie pełnej specyfikacji technicznej ze sklepu Steam
            details = get_details(appid)
            if not details or str(appid) not in details or not details[str(appid)]["success"]:
                continue

            d = details[str(appid)]["data"]
            game_name = d.get("name", "")
            product_type = d.get("type", "game")

            if not game_name:
                continue

            # Bezwzględne pomijanie dodatków (DLC), modów, ścieżek dźwiękowych i zestawów
            if product_type != "game":
                continue

            # Rewanż na ignasia za brak pośpiechu w pracy przez co się z wszystkim spóżniliśmy: pomijanie serii
            # Hurtowe pomijanie wszystkich produktów powiązanych z marką Half-Life
            if "half-life" in game_name.lower():
                print(f"  skip ⛔ [BLOKADA FRANCZYZY] Hurtowe pomijanie serii Half-Life: {game_name} (AppID: {appid})")
                continue

            # Hurtowe pomijanie wszystkich produktów powiązanych z marką Payday
            if "payday" in game_name.lower():
                print(f"  skip ⛔ [BLOKADA FRANCZYZY] Hurtowe pomijanie serii Payday: {game_name} (AppID: {appid})")
                continue

            # Hurtowe pomijanie wszystkich produktów powiązanych z marką Dying Light
            if "dying light" in game_name.lower():
                print(f"  skip ⛔ [BLOKADA FRANCZYZY] Hurtowe pomijanie serii Dying Light: {game_name} (AppID: {appid})")
                continue

            # Odrzucanie aplikacji dystrybuowanych w modelu Free to Play
            if d.get("is_free") is True:
                continue

            print(f"➡ Przetwarzanie i zapis: {game_name} (AppID: {appid})")

            # Wyodrębnianie, czyszczenie i parsowanie wymagań oraz metadanych
            min_req = parse_req(d.get("pc_requirements", {}).get("minimum", ""))
            opt_req = parse_req(d.get("pc_requirements", {}).get("recommended", ""))
            
            rating_percent = d.get("metacritic", {}).get("score", 75)
            rating = convert_rating(rating_percent)

            dev_raw = ", ".join(d.get("developers", [])) if d.get("developers") else "Unknown"
            pub_raw = ", ".join(d.get("publishers", [])) if d.get("publishers") else "Unknown"
            
            # Bezpieczne formatowanie i ucinanie stringów chroniące przed błędami struktur SQL
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
            
            # Realizacja zapisu transakcyjnego do bazy danych
            success = save_full_game_transaction(appid, game_data, min_req, opt_req, media, matched)

            if success:
                updated_counts = get_current_tag_counts()
                print(f"  ✔ [ZAPISANO] Całkowita liczba gier w bazie: {get_total_games_count()}")
                print(f"  📊 STAN KATEGORII: {dict(updated_counts)}")
            
            # Wstrzymanie wątku w celu ochrony przed blokadą anty-floodową API
            time.sleep(DELAY)

        except Exception as e:
            print(f"  ❌ Błąd przetwarzania AppID {appid}: {e}")
            continue

    print("\n=== IMPORT GLOBALNY ZAKOŃCZONY ===")
    print(f"Końcowy rozkład rekordów w bazie danych: {dict(get_current_tag_counts())}")


if __name__ == "__main__":
    run()