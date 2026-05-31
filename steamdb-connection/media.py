"""
Moduł przetwarzania multimediów gier.
Odpowiada za selekcję i ekstrakcję adresów URL obrazów wysokiej rozdzielczości
oraz materiałów wideo w formacie MP4 o najwyższych dostępnych parametrach jakościowych.
"""

def extract_media(data):
    """
    Analizuje strukturę odpowiedzi JSON ze Steam API, wyodrębnia maksymalnie 12 odnośników
    do zrzutów ekranu oraz zwiastunów filmowych (z preferencją dla jakości 'max'),
    po czym zwraca je w postaci płaskiej listy stringów.
    """
    media = []

    # Pobieranie pełnowymiarowych ścieżek bezwzględnych dla zrzutów ekranu
    for s in data.get("screenshots", []):
        if s.get("path_full"):
            media.append(s["path_full"])

    # Pobieranie odnośników do plików wideo MP4 o najwyższym profilu jakościowym
    for m in data.get("movies", []):
        if "mp4" in m and m["mp4"].get("max"):
            media.append(m["mp4"]["max"])

    # Zwrócenie uciętej kolekcji ograniczonej do limitu 12 rekordów multimedialnych
    return media[:12]