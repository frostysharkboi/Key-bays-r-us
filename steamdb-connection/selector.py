TAG_ALIASES = {
    "RPG": ["rpg", "role-playing"],
    "Action": ["action"],
    "Open World": ["open world"],
    "FPS": ["fps", "shooter"],
    "Adventure": ["adventure"],
    "Multiplayer": ["multiplayer", "co-op", "online"],
    "Strategy": ["strategy"],
    "Simulation": ["simulation"],
    "Horror": ["horror"],
    "Indie": ["indie"],
    "Survival": ["survival"],
    "Sandbox": ["sandbox"]
}

def match_tags(genres, categories):
    text = " ".join(genres + categories).lower()
    matched = []

    for tag, aliases in TAG_ALIASES.items():
        for a in aliases:
            if a in text:
                matched.append(tag)
                break

    return matched