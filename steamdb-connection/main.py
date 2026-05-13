import time
from collections import defaultdict

from steam_api import get_games, get_details, get_rating, get_player_count
from parser import parse_req, parse_date
from selector import match_tags
from media import extract_media
from db import insert_game, insert_req, insert_game_tag, insert_media
from config import TARGET_PER_TAG, MAX_GAMES, DELAY, TAGS

def run():
    print("STARTING...\n")

    games = get_games()

    tag_count = defaultdict(int)
    total = 0

    for appid, g in games.items():

        if total >= MAX_GAMES:
            break

        try:
            details = get_details(appid)
            data = details[str(appid)]

            if not data["success"]:
                continue

            d = data["data"]

            if d.get("type") != "game":
                continue

            players = get_player_count(appid)
            if players is not None and players < 500:
                continue

            genres = [x["description"] for x in d.get("genres", [])]
            categories = [x["description"] for x in d.get("categories", [])]

            matched = match_tags(genres, categories)

            if not matched:
                continue

            if not any(tag_count[t] < TARGET_PER_TAG for t in matched):
                continue

            rating = get_rating(g["positive"], g["negative"])

            min_req = parse_req(d.get("pc_requirements", {}).get("minimum", ""))
            opt_req = parse_req(d.get("pc_requirements", {}).get("recommended", ""))

            name = (d.get("name") or "")[:100]
            dev = ", ".join(d.get("developers", []))[:100]
            pub = ", ".join(d.get("publishers", []))[:100]
            date = parse_date(d.get("release_date", {}).get("date"))

            print("➡", name)

            game_id = insert_game((
                name, dev, pub,
                d.get("short_description"),
                rating,
                date,
                d.get("header_image"),
                d.get("capsule_image")
            ))

            insert_req("min_req", game_id, min_req)
            insert_req("opt_req", game_id, opt_req)

            insert_media(game_id, extract_media(d))

            for t in matched:
                if tag_count[t] < TARGET_PER_TAG:
                    insert_game_tag(game_id, TAGS[t])
                    tag_count[t] += 1

            total += 1

            print("✔ added\n")

            time.sleep(DELAY)

        except Exception as e:
            print("❌ ERROR:", appid, e)

    print("DONE:", dict(tag_count))


if __name__ == "__main__":
    run()