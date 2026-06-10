"""
Moduł integracji z zewnętrznymi interfejsami API platformy Steam oraz SteamSpy.
Odpowiada za pobieranie zestawień najpopularniejszych gier, zarządzanie listami
wykluczeń (czarna lista) oraz wymuszeń (biała lista), konwersję ocen i pobieranie metadanych aplikacji.
"""

import requests
from config import STEAM_API_KEY

def get_global_top_apps():
    """
    Agreguje wieloźródłową pulę unikalnych identyfikatorów gier do analizy.
    Łączy wstrzykiwane rekordy wymuszone (biała lista) z wynikami transmisji live
    ze Steam Charts API oraz zestawieniem TOP 1000 z platformy SteamSpy,
    odfiltrowując pozycje zdefiniowane jako zablokowane (czarna lista).
    """
    apps_pool = []
    seen_appids = set()
    
    # ==================== JAWNE REJESTRY ZASOBÓW MODYFIKACYJNYCH ====================
    # Identyfikatory gier, których obecność w końcowym procesie przetwarzania jest obligatoryjna (Biała lista)
    forced_hits = [
        # --- Oryginalna biała lista ---
        287700,   # Metal Gear Solid V: The Phantom Pain
        1659040,  # HITMAN World of Assassination
        3768760,  # 007 First Light (James Bond)
        433340,   # Slime Rancher
        1657630,   # Slime Rancher 2
        220200,   # Kerbal Space Program
        391540,   # Undertale
        1671210,  # DELTARUNE
        1262540,  # Need for Speed (2016)
        1262560,  # Need for Speed: Most Wanted (2012)
        1458140,  # Pacific Drive
        2483190,  # Forza Horizon 6
        648350,   # Jurassic World Evolution 1
        1443810,  # Jurassic World Evolution 2
        2958130,  # Jurassic World Evolution 3
        2131630,  # Metal Gear Solid (1) - Master Collection Vol. 1
        2131640,  # Metal Gear Solid 2: Sons of Liberty - Master Collection Vol. 1
        2131650,  # Metal Gear Solid 3: Snake Eater - Master Collection Vol. 1
        2417610,  # Metal Gear Solid Δ: Snake Eater (Remake)
        753640,   # Outer Wilds
        352400,   # LEGO Jurassic World
        21000,    # LEGO Batman: The Videogame
        2215200,  # LEGO Batman: Legacy of the Dark Knight
        3784760,  # Elfie: A Sand Plan
        632470    # Disco Elysium
    ]
    
    # Identyfikatory gier podlegające bezwzględnemu odrzuceniu na etapie selekcji (Czarna lista)
    # UWAGA: Tytuły z serii Half-Life zostały usunięte z tej listy, ponieważ system filtruje je automatycznie po nazwie.
    banned_hits = [
    ]
    # ================================================================================

    # Sekcja 1: Wstrzykiwanie priorytetowych pozycji z białej listy na początek kolejki
    print("   [Biała lista] Wstrzykiwanie wymuszonych tytułów na start...")
    for appid in forced_hits:
        if appid not in banned_hits:
            apps_pool.append({"appid": appid})
            seen_appids.add(appid)

    # Sekcja 2: Pobieranie danych z oficjalnego serwisu ISteamChartsService (Najpopularniejsze pod kątem graczy Online)
    url_steam = f"https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/?key={STEAM_API_KEY}"
    try:
        print("   [Steam API] Pobieranie listy TOP gier według graczy online...")
        res = requests.get(url_steam, timeout=15)
        if res.status_code == 200:
            data = res.json()
            ranks = data.get("response", {}).get("ranks", [])
            for item in ranks:
                appid = item.get("appid")
                if appid and appid not in seen_appids and appid not in banned_hits:
                    apps_pool.append({"appid": int(appid)})
                    seen_appids.add(int(appid))
    except Exception as e:
        print(f"⚠ Błąd pobierania ze Steam API: {e}")

    # Sekcja 3: Pobieranie uzupełniającego rejestru TOP 1000 z API SteamSpy
    url_spy = "https://steamspy.com/api.php?request=all"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        print("   [SteamSpy API] Pobieranie uzupełniającej listy TOP 1000...")
        res = requests.get(url_spy, headers=headers, timeout=20)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, dict):
                for appid_str in data.keys():
                    appid = int(appid_str)
                    if appid not in seen_appids and appid not in banned_hits:
                        apps_pool.append({"appid": appid})
                        seen_appids.add(appid)
    except Exception as e:
        print(f"⚠ Błąd pobierania listy ze SteamSpy: {e}")
            
    print(f"🚀 [FINAŁ] Przygotowano łącznie {len(apps_pool)} unikalnych gier do analizy.")
    return apps_pool


def get_details(appid):
    """
    Wysyła zapytanie HTTP GET do oficjalnego punktu końcowego sklepu Steam (appdetails).
    Zwraca surowy słownik danych zawierający kompletny profil informacyjny określonej gry.
    """
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}&l=english"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        print(f"❌ Błąd pobierania szczegółów gry {appid}: {e}")
    return {}


def get_steamspy_tags(appid):
    """
    Odpytuje interfejs SteamSpy o szczegółowy zestaw tagów przypisanych do gry przez społeczność.
    Konwertuje nazwy kluczy słownika na małe litery i zwraca je w postaci znormalizowanej listy.
    """
    url = f"https://steamspy.com/api.php?request=appdetails&appid={appid}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            tags_dict = data.get("tags", {})
            if isinstance(tags_dict, dict):
                return [tag.lower() for tag in tags_dict.keys()]
    except Exception as e:
        print(f"⚠ Nie udało się pobrać tagów SteamSpy dla {appid}: {e}")
    return []


def convert_rating(percent):
    """
    Dokonuje mapowania procentowego wskaźnika ocen (Metacritic/Steam) na postać tekstową.
    Zwraca znormalizowaną ocenę szkolną w skali od 1 do 5 na podstawie przedziałów wartości.
    """
    if percent >= 90: return "5"
    elif percent >= 75: return "4"
    elif percent >= 60: return "3"
    elif percent >= 40: return "2"
    else: return "1"