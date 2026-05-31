"""
Moduł konfiguracyjny systemu globalnego importu gier.
Definiuje parametry połączenia z bazą danych, klucze autoryzacyjne API,
limity algorytmu pobierania oraz mapowanie kategorii systemowych.
"""

# Konfiguracja parametrów połączenia z bazą danych MariaDB
DB_CONFIG = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",
    "database": "keybay",
    "port": 3306
}

# Oficjalny klucz uwierzytelniający do Steam Web API
STEAM_API_KEY = "5AAF1249B3CFFE0B579ADF2514BB3BF0"

# Ustawienia sterujące zachowaniem skryptu zbierającego dane
TARGET_PER_TAG = 25      # Docelowa minimalna liczba gier przypisana do jednej kategorii
DELAY = 1.2              # Bezpieczny interwał czasowy między zapytaniami zapobiegający blokadzie IP (Rate-Limit)

# Słownik mapujący oficjalne nazwy kategorii na unikalne identyfikatory (ID) w bazie danych
TAGS = {
    "RPG": 1,
    "Action": 2,
    "Open World": 3,
    "FPS": 4,
    "Adventure": 5,
    "Multiplayer": 6,
    "Singleplayer": 7,
    "Strategy": 8,
    "Simulation": 9,
    "Horror": 10,
    "Indie": 11,
    "Survival": 12,
    "Sandbox": 13,
    "Stealth": 14,
    "Driving": 15
}