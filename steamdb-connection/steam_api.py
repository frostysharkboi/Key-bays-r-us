import requests
from config import STEAM_API_KEY


def get_most_played_games():

    all_games = []

    for page in range(0, 5):

        url = (
            "https://api.steampowered.com/"
            "ISteamChartsService/GetGamesByConcurrentPlayers/v1/"
            f"?key={STEAM_API_KEY}"
            f"&start={page * 100}"
            "&count=100"
        )

        data = requests.get(url).json()

        ranks = data.get(
            "response",
            {}
        ).get(
            "ranks",
            []
        )

        all_games.extend(ranks)

    return all_games


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