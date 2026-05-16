import requests
from config import STEAM_API_KEY


def get_most_played_games():

    url = (
        "https://api.steampowered.com/"
        "ISteamChartsService/GetMostPlayedGames/v1/"
        f"?key={STEAM_API_KEY}"
    )

    data = requests.get(url).json()

    return data["response"]["ranks"]


def get_details(appid):

    url = (
        "https://store.steampowered.com/api/appdetails"
        f"?appids={appid}&l=english"
    )

    return requests.get(url).json()


def convert_rating(percent):

    if percent >= 90:
        return "5"
    elif percent >= 75:
        return "4"
    elif percent >= 60:
        return "3"
    elif percent >= 40:
        return "2"
    else:
        return "1"