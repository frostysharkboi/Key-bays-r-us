import time
import traceback

from steam_api import (
    get_most_played_games,
    get_details,
    convert_rating
)

from parser import (
    parse_req,
    parse_date
)

from selector import (
    match_tags
)

from media import (
    extract_media
)

from db import (
    insert_game,
    insert_req,
    insert_game_tag,
    insert_media
)

from config import (
    MAX_GAMES,
    DELAY,
    TAGS
)


def run():

    print("STARTING IMPORT...\n")

    games = get_most_played_games()

    total = 0

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

            # tylko gry
            if d.get("type") != "game":
                continue

            # pomiń niewydane
            if d.get(
                "release_date",
                {}
            ).get(
                "coming_soon",
                False
            ):
                continue

            name = (
                d.get("name") or ""
            ).lower()

            # pomiń śmieci
            bad_words = [
                "demo",
                "soundtrack",
                "server",
                "dedicated",
                "editor",
                "tool"
            ]

            if any(
                word in name
                for word in bad_words
            ):
                continue

            genres = [
                g["description"]
                for g in d.get(
                    "genres",
                    []
                )
            ]

            categories = [
                c["description"]
                for c in d.get(
                    "categories",
                    []
                )
            ]

            matched = match_tags(
                genres,
                categories
            )

            if not matched:
                continue

            print(
                f"\n➡ PROCESSING: "
                f"{d.get('name')}"
            )

            min_req = parse_req(
                d.get(
                    "pc_requirements",
                    {}
                ).get(
                    "minimum",
                    ""
                )
            )

            opt_req = parse_req(
                d.get(
                    "pc_requirements",
                    {}
                ).get(
                    "recommended",
                    ""
                )
            )

            rating_percent = d.get(
                "metacritic",
                {}
            ).get(
                "score",
                75
            )

            rating = convert_rating(
                rating_percent
            )

            game_id = insert_game((
                (d.get("name") or "")[:255],

                ", ".join(
                    d.get(
                        "developers",
                        []
                    )
                )[:255],

                ", ".join(
                    d.get(
                        "publishers",
                        []
                    )
                )[:255],

                d.get(
                    "short_description"
                ),

                rating,

                parse_date(
                    d.get(
                        "release_date",
                        {}
                    ).get(
                        "date"
                    )
                ),

                d.get(
                    "header_image"
                ),

                d.get(
                    "capsule_image"
                )
            ))

            insert_req(
                "min_req",
                game_id,
                min_req
            )

            insert_req(
                "opt_req",
                game_id,
                opt_req
            )

            media = extract_media(d)

            insert_media(
                game_id,
                media
            )

            for tag in matched:

                insert_game_tag(
                    game_id,
                    TAGS[tag]
                )

            total += 1

            print(
                f"✅ ADDED: "
                f"{d.get('name')}"
            )

            time.sleep(DELAY)

        except Exception:

            print("\n========== ERROR ==========")

            print(
                traceback.format_exc()
            )

    print("\nDONE")


if __name__ == "__main__":
    run()