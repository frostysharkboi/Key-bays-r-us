import requests
from config import STEAM_API_KEY

def get_games():
    urls = [
        "https://steamspy.com/api.php?request=top100in2weeks",
        "https://steamspy.com/api.php?request=top100forever"
    ]

    result = {}

    for url in urls:
        data = requests.get(url).json()
        result.update(data)

    return result

def get_details(appid):
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}&l=english"
    return requests.get(url).json()

def get_rating(positive, negative):
    total = positive + negative
    if total == 0:
        return "3"

    ratio = positive / total

    if ratio > 0.9:
        return "5"
    elif ratio > 0.75:
        return "4"
    elif ratio > 0.6:
        return "3"
    elif ratio > 0.4:
        return "2"
    else:
        return "1"

def get_player_count(appid):
    if not STEAM_API_KEY:
        return None

    try:
        url = f"https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid={appid}&key={STEAM_API_KEY}"
        return requests.get(url).json()["response"]["player_count"]
    except:
        return None