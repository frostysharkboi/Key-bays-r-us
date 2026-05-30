"""
Moduł selekcji i kategoryzacji danych.
Odpowiada za filtrowanie, mapowanie i translację surowych tagów społecznościowych
pochodzących ze SteamSpy na oficjalne kategorie zaimplementowane w architekturze bazy.
"""

from config import TAGS

def match_tags(steamspy_tags):
    """
    Dokonuje rygorystycznej translacji i mapowania wejściowych etykiet społecznościowych.
    Wykorzystuje wewnętrzny słownik synonimów w celu prawidłowej agregacji rozproszonych pojęć
    (w tym nowo zaimplementowanej kategorii zbiorczej Racing) do postaci unikalnej listy kategorii.
    """
    if not steamspy_tags:
        return []

    matched = set()
    
    # Słownik synonimów i wariantów pisowni mapujący pojęcia na oficjalne nazwy systemowe
    search_map = {
        # Kategoria FPS (ID 4)
        "fps": "FPS",
        "first-person shooter": "FPS",
        "shooter": "FPS",
        
        # Kategoria Open World (ID 3)
        "open world": "Open World",
        "open-world": "Open World",
        
        # Kategoria Survival (ID 12)
        "survival": "Survival",
        "survive": "Survival",
        
        # Kategoria Sandbox (ID 13)
        "sandbox": "Sandbox",
        "building": "Sandbox",
        "crafting": "Sandbox",
        
        # Kategoria Horror (ID 10)
        "horror": "Horror",
        "scary": "Horror",
        
        # Kategoria Racing - Parasol samochodowy (ID 15)
        "racing": "Driving",
        "driving": "Driving",
        "automotive": "Driving",
        "cars": "Driving",
        
        # Pozostałe zaimplementowane kategorie systemowe
        "rpg": "RPG",
        "role-playing": "RPG",
        "action": "Action",
        "adventure": "Adventure",
        "multiplayer": "Multiplayer",
        "singleplayer": "Singleplayer",
        "co-op": "Multiplayer",
        "strategy": "Strategy",
        "rts": "Strategy",
        "simulation": "Simulation",
        "simulator": "Simulation",
        "indie": "Indie",
        "stealth": "Stealth"
    }

    # Analiza pętli porównawczej - wyszukiwanie podciągów znaków (Substring Matching)
    for tag in steamspy_tags:
        tag_clean = tag.lower().strip()
        for key_word, official_name in search_map.items():
            if key_word in tag_clean:
                matched.add(official_name)
                
    return list(matched)