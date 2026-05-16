def extract_media(data):

    media = []

    if data.get("header_image"):
        media.append(data["header_image"])

    for s in data.get("screenshots", []):
        media.append(s.get("path_full"))

    for m in data.get("movies", []):

        if "mp4" in m:
            media.append(m["mp4"].get("max"))

    return media[:12]