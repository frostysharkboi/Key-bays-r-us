import random
import mysql.connector

# --- KONFIGURACJA POŁĄCZENIA Z TWOJĄ BAZĄ ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'keybay'  # Wpisz tutaj dokładną nazwę swojej bazy danych
}

RECENZJE_POOL = {
  '5': [
    "Absolutne arcydzieło! Klimat powala, a mechanika gry jest bezbłędna.", 
    "Gra mojego dzieciństwa. Kod zadziałał od razu, polecam!", 
    "Wciąga jak bagno. Miałem grać godzinę, a wstałem o świcie.", 
    "Złoty klasyk. Transakcja błyskawiczna, sprzedawca 10/10.", 
    "Absolutne Kino: 10/10", 
    "Ujdzie",
    "Przeszedłem 5 razy i na pewno wrócę po raz kolejny. Najlepiej wydane pieniądze.",
    "Muzyka z menu głównego do teraz leci u mnie na Spotify. Coś pięknego.",
    "Fabularny majstersztyk, popłakałem się na zakończeniu. Polecam jedem.",
    "Kupiłem bratu na urodziny, teraz nie wychodzi z pokoju od tygodnia. Sukces!"
  ],
  '4': [
    "Świetna produkcja, chociaż grafika lekko trąci myszką.", 
    "Bardzo dobry tytuł na długie wieczory ze znajomymi.", 
    "Gameplay super, fabuła wciąga, jedynie optymalizacja mogłaby być ciut lepsza.", 
    "Ewenement na skale światową, gra prawdopodobnie równie ważna co Biblia",
    "Solidny sequel. Poprawili większość błędów z jedynki, bawiłem się świetnie.",
    "Bardzo przyjemny gameplay loop, potrafi zassać syndromem 'jeszcze jednej tury'.",
    "Gdyby nie te sporadyczne crashe do pulpitu, dałbym pełną piątkę. Warto kupić.",
    "Super odskocznia od codzienności. Dużo humoru i ciekawe questy poboczne.",
    "Klimat gęsty, że można go kroić nożem. Trochę powtarzalna pod koniec, ale i tak super.",
    "Gra kupiona na promocji i przerosła moje oczekiwania. Naprawdę mocne 4/5."
  ],
  '3': [
    "Gra poprawna, ale bez rewelacji. Szybko się nudzi.", 
    "Fajny pomysł, gorzej z wykonaniem. Sterowanie momentami drewniane.", 
    "Kupiłem na wyprzedaży i jest ok, ale pełnej ceny nie warta.", 
    "Całkiem dobre szkoda że developer siedzi w więzieniu",
    "Przeciętniak jakich mało. Można pograć z braku laku, ale szybko się zapomina.",
    "Strasznie dużo grindu. Początek był obiecujący, ale potem robi się z tego druga praca.",
    "Graficznie ładna, ale pusta w środku. AI przeciwników praktycznie nie istnieje.",
    "Taki typowy symulator chodzenia z elementami walki. Bez szału.",
    "Twórcy chyba sami nie wiedzieli, jaki gatunek chcą stworzyć. Niby ok, ale mess.",
    "Można odpalić do podcastu w tle. Nic ambitnego, ot zwykły zapychacz czasu."
  ],
  '2': [
    "Spora zawód. Potencjał był enormny, ale serwery ciągle lagują.", 
    "Męcząca rozgrywka. Mechaniki zamiast bawić – frustrują.", 
    "Nuda. Gra zrobiona kompletnie bez pomysłu.", 
    "Pały nie urywa", 
    "Nawet tej gry nie odpaliłem", 
    "Okropne balansowane broni w tej grze sprawiło że rozwaliłem już 2 klawiatury i monitor",
    "Zagrałem 30 minut i zażądałem zwrotu pieniędzy. Współczuję ludziom, którzy kupili preorder.",
    "Ilość bugów w tej grze przechodzi ludzkie pojęcie. Przenikanie przez ściany to standard.",
    "Mikrotransakcje na każdym kroku. Bez portfela rodziców nawet nie ma co podchodzić.",
    "Obiecywali gruszki na wierzbie, a wydali niedokończone demo. Tragedia."
  ],
  '1': [
    "Dno i wodorosty. Gra nie chce się nawet uruchomić, wyskakuje tylko czarny ekran.",
    "KOD NIE DZIAŁA!!! Złodzieje i oszuści, żądam natychmiastowego zwrotu pieniędzy!!!",
    "Gorszej gry w życiu nie widziałem. Grafika jak z PlayStation 1, a optymalizacja leży.",
    "Nie polecam",
    "Ta gra uraziła moje uczucia religijne i sprawiła, że mój kot uciekł z domu.",
    "Nawet za darmo bym tego nie chciał. Twórcy powinni dopłacać ludziom za granie w ten gniot.",
    "Kupione przez przypadek, dziecko mi poklikało na telefonie. Da się to cofnąć?",
    "Zagrałem 5 minut i rozbolały mnie oczy. Pokaz slajdów, 15 klatek na sekundę na potężnym PC.",
    "Totalne nieporozumienie. Fabuła bez sensu, postacie irytujące, a muzyka to jakiś żart.",
    "Jedna gwiazdka to i tak za dużo. Omijać szerokim łukiem!"
  ]
}

OPISY_OFERT = [
    "Oficjalny klucz globalny.",
    "Promocja weekendowa! Ostatnie sztuki z legalnego źródła.",
    "Klucz z dystrybucji europejskiej, aktywacja na głównym koncie Steam.",
    "Najniższa cena na rynku, błyskawiczna dostawa."
]

def main():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("[-] Połączono z bazą danych.")

        # 1. POBIERANIE WSZYSTKICH ID GIER ISTNIEJĄCYCH W BAZIE
        cursor.execute("SELECT id FROM `games` ORDER BY id ASC;")
        wszystkie_gry = [row[0] for row in cursor.fetchall()]
        
        if not wszystkie_gry:
            print("[!] Błąd: Twoja tabela z grami jest pusta! Najpierw zaimportuj strukturę i gry z pliku .sql.")
            return
            
        print(f"[-] Wykryto {len(wszystkie_gry)} gier w Twojej bazie danych.")

        # 2. CZYSZCZENIE ZALEŻNYCH TABEL
        print("[-] Czyszczenie starych danych...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cursor.execute("TRUNCATE TABLE `ratings`;")
        cursor.execute("TRUNCATE TABLE `wishlist`;")
        cursor.execute("TRUNCATE TABLE `transactions`;")
        cursor.execute("TRUNCATE TABLE `key_offers`;")
        cursor.execute("TRUNCATE TABLE `users`;")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        conn.commit()

        # 3. GENEROWANIE UŻYTKOWNIKÓW (3 Adminów, 10 Sprzedawców, 30 Kupujących)
        print("[-] Tworzenie użytkowników...")
        logins_admin = ['CyberGlitch_Admin', 'RootOverlord', 'KernelPanic_99']
        logins_sellers = ['VaultDweller_Keys', 'GamerDen_Wholesale', 'PixelMerchant', 'Lootbox_Emperor', 'KeyKrypton', 'RetroReseller', 'SteamSmuggler', 'DiscountDragon', 'IndieBundle_King', 'Goblin_Market']
        logins_normals = [f'Gamer_Nick_{i}' for i in range(1, 31)]
        
        user_id = 1
        admin_ids = []
        seller_ids = []
        buyer_ids = []

        # W tabeli users kolumna to 'other'
        insert_user_query = """
            INSERT INTO `users` (`id`, `login`, `pass`, `phone`, `email`, `discord_tag`, `other`, `type`) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """

        for l in logins_admin:
            cursor.execute(insert_user_query, (user_id, l, 'adminpass', '500100200', f'{l.lower()}@kb.pl', f'{l}#1111', 'Admin', 'admin'))
            admin_ids.append(user_id)
            user_id += 1
        for l in logins_sellers:
            cursor.execute(insert_user_query, (user_id, l, 'sellerpass', '600100100', f'{l.lower()}@shop.com', f'{l}#2222', 'Sprzedawca', 'seller'))
            seller_ids.append(user_id)
            user_id += 1
        for l in logins_normals:
            cursor.execute(insert_user_query, (user_id, l, 'userpass', '700300100', f'{l.lower()}@mail.pl', f'{l}#3333', 'Kupujący', 'normal'))
            buyer_ids.append(user_id)
            user_id += 1

        # Nowa połączona lista: wszyscy użytkownicy, którzy mogą teraz kupować i posiadać gry
        wszyscy_kupujacy = admin_ids + seller_ids + buyer_ids

        # 4. WARUNEK: 2 AKTYWNE OFERTY DLA KAŻDEJ GRY W BAZIE
        print("[-] Tworzenie po 2 aktywnych ofert dla KAŻDEJ gry...")
        offer_id = 1
        trans_id = 1
        
        # W tabeli key_offers kolumna to 'other' (zgodnie z Twoją działającą wersją)
        insert_offer_query = """
            INSERT INTO `key_offers` (`id`, `seller_id`, `game_id`, `game_key`, `other`, `status`, `suggested_price`) 
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        # W tabeli transactions kolumna to 'other'
        insert_trans_query = """
            INSERT INTO `transactions` (`id`, `offer_id`, `buyer_id`, `reciever_id`, `status`) 
            VALUES (%s, %s, %s, %s, %s);
        """

        for g_id in wszystkie_gry:
            for _ in range(2):
                seller = random.choice(seller_ids)
                cena = random.randint(20, 250)
                klucz = f"KEY-ACT-{g_id}-{random.randint(1000,9999)}"
                opis = random.choice(OPISY_OFERT)
                cursor.execute(insert_offer_query, (offer_id, seller, g_id, klucz, opis, 'Active', cena))
                
                # Zamówienie oczekujące (Pending) na niektóre z ofert aktywnych
                if random.random() > 0.5:
                    # Wybieramy kupującego ze wspólnej puli (Kupujący, Admin lub inny Sprzedawca)
                    # Jeśli wylosuje się Sprzedawca, dbamy o to, aby nie kupił od samego siebie
                    dostepni_kupujacy = [u for u in wszyscy_kupujacy if u != seller]
                    buyer = random.choice(dostepni_kupujacy)
                    
                    cursor.execute(insert_trans_query, (trans_id, offer_id, buyer, buyer, 'Pending'))
                    trans_id += 1
                offer_id += 1

        # 5. WARUNEK: KAŻDY USER (Normal, Admin, Seller) MA 5-15 ZAKUPIONYCH GIER
        print("[-] Przypisywanie historii zakupów (5-15 gier na usera: w tym sprzedawców i adminów) oraz recenzji...")
        posiadane_gry_usera = {u_id: set() for u_id in wszyscy_kupujacy}

        # W tabeli ratings kolumna to 'other'
        insert_rating_query = """
            INSERT INTO `ratings` (`game_id`, `user_id`, `rating`, `other`) 
            VALUES (%s, %s, %s, %s);
        """

        for buyer in wszyscy_kupujacy:
            liczba_zakupow = random.randint(5, 15)
            wybrane_gry = random.sample(wszystkie_gry, min(liczba_zakupow, len(wszystkie_gry)))
            
            for g_id in wybrane_gry:
                posiadane_gry_usera[buyer].add(g_id)
                
                # ZABEZPIECZENIE: Sprzedawca nie może kupić od samego siebie!
                # Odfiltrowujemy listę sprzedawców tak, aby wykluczyć aktualnego kupującego (jeśli jest sprzedawcą)
                dostepni_sprzedawcy = [s for s in seller_ids if s != buyer]
                
                # Na wypadek gdyby lista była pusta (np. jest tylko 1 sprzedawca w bazie), 
                # awaryjnie bierzemy kogokolwiek, ale przy 10 sprzedawcach zawsze ktoś zostanie
                seller = random.choice(dostepni_sprzedawcy if dostepni_sprzedawcy else seller_ids)
                
                cena = random.randint(15, 200)
                klucz_zuzyty = f"KEY-SOLD-{g_id}-{random.randint(10000,99999)}"
                
                # Tworzymy ofertę archiwalną
                cursor.execute(insert_offer_query, (offer_id, seller, g_id, klucz_zuzyty, 'Archiwum', 'Closed', cena))
                # Tworzymy transakcję sukcesu
                cursor.execute(insert_trans_query, (trans_id, offer_id, buyer, buyer, 'Success'))
                
                # ~80% szans na wystawienie recenzji po zakupie
                if random.random() > 0.2:
                    ocena = '1'
                    for i in range(5,0,-1):
                        if random.random() > 0.4:
                            ocena = f'{i}'
                            break
                    tekst = random.choice(RECENZJE_POOL[ocena])
                    cursor.execute(insert_rating_query, (g_id, buyer, ocena, tekst))
                
                offer_id += 1
                trans_id += 1

        # 6. WARUNEK: OKOŁO 5 GIER NA WISHLIŚCIE (Dla każdego konta w bazie)
        print("[-] Generowanie wishlist dla wszystkich użytkowników...")
        insert_wishlist_query = """
            INSERT INTO `wishlist` (`user_id`, `game_id`) 
            VALUES (%s, %s);
        """

        for buyer in wszyscy_kupujacy:
            # Filtrujemy pełną listę gier, usuwając te, które użytkownik już posiada/kupił
            dostepne_do_wishlisty = [g for g in wszystkie_gry if g not in posiadane_gry_usera[buyer]]
            
            # Pobieramy maksymalnie 5 sztuk
            liczba_na_wishlist = min(5, len(dostepne_do_wishlisty))
            if liczba_na_wishlist > 0:
                wybrane_do_wl = random.sample(dostepne_do_wishlisty, liczba_na_wishlist)
                for w_g_id in wybrane_do_wl:
                    cursor.execute(insert_wishlist_query, (buyer, w_g_id))

        conn.commit()
        print("[+] Sukces! Baza została kompletnie i poprawnie uzupełniona danymi dla wszystkich kont (w tym adminów i sprzedawców).")

    except mysql.connector.Error as err:
        print(f"[!] Błąd bazy danych: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    main()