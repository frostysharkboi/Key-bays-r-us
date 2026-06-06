import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";
import { UserContext } from '../components/user-context/UserContext';
import Header from '../components/header/Header';
import { useDebounce } from '../hooks/UseDebounce';

export default function Root() {
  const navigate = useNavigate();

  const { userData, logout } = useContext(UserContext);
  const [games, setGames] = useState([]);
  const [offerKey, setKey] = useState(null);
  const [offerPrice, setPrice] = useState(null);
  const [offerOther, setOther] = useState(null);

  // ZMIANA: Inicjalizujemy tytuł jako pusty string, by kontrolowany input działał prawidłowo
  const [offerTitle, setTitle] = useState("");

  // NOWOŚĆ: Stan debounce oraz sterowanie panelem podpowiedzi
  const debouncedOfferTitle = useDebounce(offerTitle, 400);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [DataIsGood, changeVeryfication] = useState(false);
  const [errorBoxText, setErrorBoxText] = useState("");
  const [offerAsObject, getOffer] = useState(null);

  useEffect(() => {
    getFilteredGames();
    console.log(userData);
  }, []);

  useEffect(() => {
    console.log(games);
  }, [games]);

  useEffect(() => {
    let gameId2 = 0;

    if (offerTitle !== "") {
      games.forEach(game => {
        if (game.title == offerTitle) {
          gameId2 = game.id;
        };
      });
    }

    getOffer({
      key: offerKey,
      title: offerTitle,
      price: offerPrice,
      other: offerOther,
      gameId: gameId2
    });
  }, [offerKey, offerPrice, offerOther, offerTitle, games])

  function getTitleAndId(e) {
    setTitle(e.target.value);
    setIsDropdownOpen(true);
  }

  const getFilteredGames = () => {
    const outputTags = "";

    axios.get(`${axiosPath}/games/tagsort`, { params: { tags: outputTags } })
      .then((res) => {
        setGames(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("Błąd pobierania gier:", err));
  };

  // NOWOŚĆ: Automatyczne zamykanie panelu podpowiedzi gier po kliknięciu poza obszar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // NOWOŚĆ: Filtrowanie gier na podstawie opóźnionej frazy (dokładnie jak w Headerze, max 10 sztuk)
  const displayedGames = useMemo(() => {
    if (!debouncedOfferTitle.trim()) return [];
    return games
      .filter(game => game.title && game.title.toLowerCase().includes(debouncedOfferTitle.toLowerCase()))
      .slice(0, 5);
  }, [debouncedOfferTitle, games]);

  // Funkcja walidująca poprawność wprowadzonych danych
  function CheckIfDataIsGood() {
    const offerChekcs = {
      key: false,
      title: false
    }
    if (offerChekcs != null && offerKey != null && offerOther != null && offerPrice != null) {
      console.log(offerAsObject);

      games.forEach(game => {
        if (offerChekcs.title == false) {
          if (game.title == offerAsObject.title) {
            setErrorBoxText("");
            offerChekcs.title = true;
          } else {
            setErrorBoxText("Podana gra nie istnieje");
          }
        }
      });

      (offerAsObject.key.length > 14 && offerAsObject.key.length < 51) ? offerChekcs.key = true : setErrorBoxText("Klucz jest nieprawidłowy");

      (offerPrice != null) ? null : setErrorBoxText("Oferta musi być wycieniona");
      (offerOther != null) ? null : setErrorBoxText("Oferta musi zawierać opis");

      if (offerChekcs.key == true && offerChekcs.title == true && offerPrice != null && offerOther != null) return true;
      return false
    } else {
      alert("Proszę uzupełnić formularz do końca");
      return false;
    }
  }

  function AddOfferToDb() {
    if (CheckIfDataIsGood() == true) {
      if (confirm("Czy na pewno chcesz wystawić tą ofertę?\nWciśnij ok, by wystawić.") == true) {
        axios.post(`${axiosPath}/key_offers/add`, { key: offerAsObject.key, price: offerAsObject.price, other: offerAsObject.other, game_id: offerAsObject.gameId, seller_id: userData.id, status: "Active" })
          .then(() => {
            console.log("Chyba przeszło?");
            let popup = alert("Twoja oferta właśnie została wystawiona", "ok");
            if (popup == true) {
              console.log("Kurwa powinna przekazywać locationState");
              navigate("/Offers");
            }
          }).catch((err) => {
            setErrorBoxText("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
            console.error(err);
          });
        navigate("/Offers");
      } else {
        setTitle("");
        setPrice("");
        setOther("");
        setKey("");
      }
    }
  }

  return (
    <>
      <div className="container-fluid">
        <Header />

        {/* Formularz Rejestracji */}
        <div className='row m-1 text-center font'>
          <h3>DODAWANIE OFERTY</h3>

          <div className="mt-2" ref={dropdownRef}>
            {/* Label i br stoją luźno – nie wpływają na szerokość listy */}
            <label>Podaj gre, jaka chcesz wystawic</label>
            <br />

            {/* NOWOŚĆ: Ta otoczka pilnuje, by podgląd dopasował się TYLKO do szerokości tego konkretnego inputa */}
            <div className="position-relative d-inline-block">
              <input
                type="text"
                autoComplete="off"
                onChange={(e) => getTitleAndId(e)}
                onFocus={() => setIsDropdownOpen(true)}
                value={offerTitle}
              /* Twój styl inputa jest w 100% bezpieczny i nienaruszony */
              />

              {/* Podgląd listy wyświetli się dokładnie pod krawędziami inputa */}
              {isDropdownOpen && displayedGames.length > 0 && (
                <div
                  className="position-absolute bg-white border border-secondary text-start mt-1 w-100 shadow-lg custom-search-dropdown"
                  style={{
                    zIndex: 999,
                    maxHeight: '350px',
                    overflowY: 'auto',
                    borderRadius: '4px',
                    left: 0,
                    right: 0
                  }}
                >
                  {displayedGames.map((game) => (
                    <div
                      key={game.id}
                      className="d-flex bg-dark align-items-center p-2 border-bottom search-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setTitle(game.title);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {game.cover_img ? (
                        <img
                          src={game.cover_img}
                          alt={game.title}
                          style={{ width: '35px', height: '45px', objectFit: 'cover', marginRight: '12px', borderRadius: '2px' }}
                        />
                      ) : (
                        <div style={{ width: '35px', height: '45px', backgroundColor: '#e0e0e0', marginRight: '12px', borderRadius: '2px' }} />
                      )}
                      <span className="fw-bold text-danger">{game.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2">
            <label>Podaj klucz gry</label>
            <br />
            <input type="text" onChange={(e) => setKey(e.target.value)} value={offerKey || ""} />
          </div>
          <div className="mt-2">
            <label>Podaj sugerowana cene sprzedazy</label>
            <br />
            <input type="number" min="0.01" step={"0.01"} onChange={(e) => setPrice(e.target.value)} value={offerPrice || ""} />
          </div>
          <div className="mt-2">
            <label>Podaj opis oferty</label>
            <br />
            <textarea rows="4" cols="50" onChange={(e) => setOther(e.target.value)} value={offerOther || ""} />
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={() => AddOfferToDb()}>Dodaj Oferte</button>
            {errorBoxText && <p id="Error_box" className='text-center fs-3 text-danger mt-2'>{errorBoxText}</p>}
          </div>
        </div>

        {/* Stopka */}
        <div className="row m-3 p-3 text-center">
          <div className='col'>
            <p>Kontakt</p>
            <p>Mail: biurokeysrus@gmail.com</p>
          </div>
        </div>
      </div>
    </>
  );
}