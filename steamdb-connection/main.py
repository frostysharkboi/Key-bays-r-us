import time
import traceback
from collections import defaultdict

from config import (
    TARGET_PER_TAG,
    MAX_GAMES,
    DELAY,
    TAGS
)

from steam_api import (
    get_most_played_games,
    get_details,
    convert_rating
)

from parser import (
    parse_req,
    parse_date
)

from selector import match_tags

from media import extract_media

from db import (
    insert_game,
    insert_req,
    insert_game_tag,
    insert_media
)


def run():

    print("STARTING IMPORT...\n")

    games = get_most_played_games()

    total = 0

    tag_count = defaultdict(int)

    for game in games:

        if total >= MAX_GAMES:
            break

        try:

            appid = game["appid"]

            details = get_details(appid)

            if str(appid) not in details:
                continue

            if not details[str(appid)]["success"]:
                continue

            d = details[str(appid)]["data"]

            if d.get("type") != "game":
                continue

            # pomiń niewydane gry
            if d.get("release_date", {}).get("coming_soon", False):
                print("⏩ SKIPPED unreleased:", d.get("name"))
                continue

            # pomiń darmowe dodatki/demo/tool
            if d.get("is_free") and not d.get("genres"):
                continue

            genres = [
                g["description"]
                for g in d.get("genres", [])
            ]

            categories = [
                c["description"]
                for c in d.get("categories", [])
            ]

            matched = match_tags(genres, categories)

            if not matched:
                continue

            if not any(
                tag_count[t] < TARGET_PER_TAG
                for t in matched
            ):
                continue

            print(f"\n➡ PROCESSING: {d.get('name')}")

            min_req = parse_req(
                d.get("pc_requirements", {}).get("minimum", "")
            )

            opt_req = parse_req(
                d.get("pc_requirements", {}).get("recommended", "")
            )

            rating_percent = d.get(
                "metacritic",
                {}
            ).get("score", 75)

            rating = convert_rating(rating_percent)

            game_id = insert_game((
                (d.get("name") or "")[:255],
                ", ".join(d.get("developers", []))[:255],
                ", ".join(d.get("publishers", []))[:255],
                d.get("short_description"),
                rating,
                parse_date(
                    d.get("release_date", {}).get("date")
                ),
                d.get("header_image"),
                d.get("capsule_image")
            ))

            print("✔ game inserted")

            insert_req("min_req", game_id, min_req)
            insert_req("opt_req", game_id, opt_req)

            print("✔ requirements inserted")

            media = extract_media(d)

            insert_media(game_id, media)

            print(f"✔ media inserted ({len(media)})")

            for t in matched:

                if tag_count[t] < TARGET_PER_TAG:

                    insert_game_tag(
                        game_id,
                        TAGS[t]
                    )

                    tag_count[t] += 1

            print(f"✔ tags inserted {matched}")

            total += 1

            print(f"✅ DONE: {d.get('name')}")

            time.sleep(DELAY)

        except Exception as e:

            print("\n========== ERROR ==========")

            try:
                print("GAME:", d.get("name"))
            except:
                pass

            print("APPID:", appid)

            print(traceback.format_exc())

    print("\nDONE")
    print(dict(tag_count))


if __name__ == "__main__":
    run()