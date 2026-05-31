"""
Moduł parsowania i normalizacji danych tekstowych oraz dat.
Realizuje zadania z zakresu oczyszczania kodu HTML, ekstrakcji wartości na podstawie
słów kluczowych, unifikacji jednostek pamięci RAM/dysków (MB/GB) oraz unifikacji formatów dat.
"""

import re
from datetime import datetime


def clean_html(text):
    """
    Oczyszcza przekazany ciąg tekstowy z tagów HTML.
    Konwertuje znaczniki łamania linii i list na natywne znaki nowej linii
    oraz eliminuje pozostałe znaczniki strukturalne.
    """
    if not text: return ""
    text = re.sub(r'<br\s*/?>', '\n', text)  
    text = re.sub(r'</li\s*>', '\n', text)   
    text = re.sub(r'<.*?>', ' ', text)       
    return text


def extract_line_by_keywords(lines, keywords):
    """
    Przeszukuje kolekcję linii tekstu pod kątem wystąpienia określonych słów kluczowych.
    Po znalezieniu dopasowania izoluje, oczyszcza i zwraca powiązaną wartość.
    """
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        for kw in keywords:
            if kw.lower() in line_clean.lower():
                value = re.sub(rf'^{kw}\s*:?', '', line_clean, flags=re.IGNORECASE).strip()
                return value
    return None


def normalize_ram(text):
    """
    Analizuje surowy tekst opisujący pamięć RAM za pomocą wyrażeń regularnych.
    Wychwytuje wartości liczbowe i standaryzuje je do postaci całkowitoliczbowej w gigabajtach (GB).
    """
    if not text: return None
    text = text.lower()
    m = re.search(r'(\d+)\s*(?:gb|mb)', text)
    if m:
        val = int(m.group(1))
        if "mb" in text and val > 100:  
            return round(val / 1024)
        return val
    return None


def normalize_storage(text):
    """
    Analizuje surowy tekst dotyczący wymaganej przestrzeni dyskowej.
    Identyfikuje wartości liczbowe (w tym zmiennoprzecinkowe) i przelicza je na jednostkę gigabajtów (GB).
    """
    if not text: return None
    text = text.lower()
    m = re.search(r'(\d+(?:\.\d+)?)\s*(?:gb|mb)', text)
    if m:
        val = float(m.group(1))
        if "mb" in text and val > 100:
            return round(val / 1024, 1)
        return val
    return None


def parse_req(html_content):
    """
    Dokonuje kompleksowego parsowania struktury wymagań systemowych PC przekazanych w HTML.
    Wyodrębnia system operacyjny, procesor, kartę graficzną, pamięć RAM oraz przestrzeń dyskową,
    zwracając znormalizowany słownik danych technicznych.
    """
    if not html_content:
        return {"os": None, "cpu": None, "gpu": None, "ram": None, "size": None}

    cleaned_text = clean_html(html_content)
    lines = [line.strip() for line in cleaned_text.split('\n') if line.strip()]

    # Definicje słowników słów kluczowych dla lokalizacji wielojęzycznych (PL / EN)
    os_kws = ["System operacyjny", "OS", "Operating System"]
    cpu_kws = ["Procesor", "Processor", "CPU"]
    gpu_kws = ["Karta graficzna", "Graphics", "GPU", "Video Card"]
    ram_kws = ["Pamięć", "Memory", "RAM"]
    size_kws = ["Miejsce na dysku", "Storage", "Hard Drive", "Disk Space"]

    os_val = extract_line_by_keywords(lines, os_kws)
    cpu_val = extract_line_by_keywords(lines, cpu_kws)
    gpu_val = extract_line_by_keywords(lines, gpu_kws)
    ram_raw = extract_line_by_keywords(lines, ram_kws)
    size_raw = extract_line_by_keywords(lines, size_kws)

    # Obcinanie danych tekstowych chroniące przed przekroczeniem zakresu struktur VARCHAR kolumn bazy danych
    if os_val: os_val = os_val.split('|')[0].strip()[:250]
    if cpu_val: cpu_val = cpu_val.split('|')[0].strip()[:250]
    if gpu_val: gpu_val = gpu_val.split('|')[0].strip()[:250]

    return {
        "os": os_val,
        "cpu": cpu_val,
        "gpu": gpu_val,
        "ram": normalize_ram(ram_raw) if ram_raw else None,
        "size": normalize_storage(size_raw) if size_raw else None
    }


def parse_date(date_str):
    """
    Konwertuje zróżnicowane formaty tekstowe dat premier stosowane przez Steam API
    do jednolitego formatu bazodanowego typu DATE: RRRR-MM-DD.
    W przypadku niepowodzenia zwraca bieżącą datę systemową jako bezpieczną wartość domyślną.
    """
    if not date_str:
        return datetime.now().strftime("%Y-%m-%d")
    
    formats = ["%d %b, %Y", "%b %d, %Y", "%d %B %Y", "%Y-%m-%d"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except:
            continue
    return datetime.now().strftime("%Y-%m-%d")