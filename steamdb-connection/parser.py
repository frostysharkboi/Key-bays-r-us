import re
from datetime import datetime


def clean_html(text):

    if not text:
        return ""

    return re.sub('<.*?>', '', text)


def normalize_ram(text):

    if not text:
        return None

    text = text.lower()

    m = re.search(r'(\d+)', text)

    if not m:
        return None

    value = int(m.group(1))

    if "gb" in text:
        return value * 1024

    if "mb" in text:
        return value

    return None


def normalize_storage(text):

    if not text:
        return None

    text = text.lower()

    m = re.search(r'(\d+)', text)

    if not m:
        return None

    value = int(m.group(1))

    if "gb" in text:
        return float(value)

    if "mb" in text:
        return round(value / 1024, 2)

    return None


def parse_req(text):

    text = clean_html(text).lower()

    def ext(key):

        m = re.search(
            rf"{key}:\s*([^\n]+)",
            text
        )

        return m.group(1).strip() if m else None

    return {
        "os": ext("os"),
        "cpu": ext("processor"),
        "gpu": ext("graphics"),
        "ram": normalize_ram(ext("memory")),
        "size": normalize_storage(ext("storage")),
        "other": None
    }


def parse_date(date_str):

    try:

        return datetime.strptime(
            date_str,
            "%d %b, %Y"
        ).strftime("%Y-%m-%d")

    except:
        return None