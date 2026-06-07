import { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as React from 'react';
import { UserContext } from '../components/user-context/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";

import WishlistButton from '../components/wishlist-button/WishlistButton';
import SiteRating from '../components/ratings/SiteRating';
import SteamRating from '../components/ratings/SteamRating';
import SaleOffers from '../components/offers/SaleOffers';
import ReviewsSection from '../components/reviews/ReviewsSection';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';

export default function GamePage() {
  const { userData, logout } = useContext(UserContext);

  const [searchGamesTitles, setGamesTitles] = useState(null);
  const [game, setGame] = useState([]);
  const [tags, setTags] = useState([]);
  const [connectedTags, updateTags] = useState([]);
  const [reviews, updateReviews] = useState([]);

  // Stany do obsługi multimediów i indeksu karuzeli
  const [media, setMedia] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const GameId = location.state?.GameId;

  // Pobieranie głównych danych gry
  const getGame = () => {
    if (!GameId) return;
    axios.get(`${axiosPath}/games/alldata`, { params: { game_id: GameId } })
      .then((res) => {
        console.log("Dane pobranej gry z API:", res.data[0]);
        setGame(res.data);
      });
  };

  // Pobieranie multimediów dla karuzeli
  const getGameMedia = () => {
    if (!GameId) return;
    axios.get(`${axiosPath}/games/media`, { params: { game_id: GameId } })
      .then((res) => {
        setMedia(Array.isArray(res.data) ? res.data : []);
        setActiveIndex(0); // Resetujemy indeks przy zmianie gry
      })
      .catch(err => console.error("Błąd pobierania multimediów:", err));
  };

  const getAllTags = () => {
    axios.get(`${axiosPath}/tags`).then((res) => {
      setTags(res.data);
    });
  };

  const getSomeTags = () => {
    axios.get(`${axiosPath}/game_tags`).then((res) => {
      updateTags(res.data);
    });
  };

  const getAllReviews = () => {
    axios.get(`${axiosPath}/ratings`).then((res) => {
      updateReviews(res.data);
    });
  };

  // Ładowanie wszystkich danych po zmianie ID gry
  useEffect(() => {
    getGame();
    getGameMedia();
    getAllTags();
    getSomeTags();
    getAllReviews();
  }, [GameId]);

  const gameData = game[0];

  // Łączenie cover_img z galerii multimediów w jedną listę (Okładka zawsze na pozycji 0)
  const allMediaItems = useMemo(() => {
    const items = [];
    if (gameData && gameData.cover_img) {
      items.push({
        id: 'cover-default',
        source: gameData.cover_img,
        isCover: true
      });
    }
    return [...items, ...media];
  }, [gameData, media]);

  // Obsługa strzałek karuzeli bazująca na nowej, połączonej liście
  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prevIndex) => (prevIndex === 0 ? allMediaItems.length - 1 : prevIndex - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prevIndex) => (prevIndex === allMediaItems.length - 1 ? 0 : prevIndex + 1));
  };

  function WypiszTagi() {
    const powiazaneTagi = [];
    if (connectedTags && tags.length > 0) {
      connectedTags.forEach(e => {
        if (e.game_id == GameId) {
          const znalezionyTag = tags.find(f => f.id == e.tag_id);
          if (znalezionyTag) powiazaneTagi.push(znalezionyTag.tag);
        }
      });
    }
    return <>{powiazaneTagi.map((t, idx) => <span key={idx}> {t} | </span>)}</>;
  }

  function WypiszRecenzje() {
    const powiazaneRecenzje = [];
    if (reviews) {
      reviews.forEach(e => {
        if (e.game_id == GameId) {
          powiazaneRecenzje.push({ id: e.id, text: `Ocena: ${e.rating} | Opis: ${e.other}` });
        }
      });
    }
    return powiazaneRecenzje.length > 0 ? (
      <div className="d-flex flex-column gap-2">
        {powiazaneRecenzje.map(r => <i key={r.id} className="d-block border-bottom pb-1"> {r.text} </i>)}
      </div>
    ) : <p>BRAK RECENZJI</p>;
  }

  function LogOutUser() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="container-fluid col">
      {/* Nagłówek Strony */}
      <Header />

      {/* Tytuł gry */}
      <div className='row m-3 p-3 text-center'>
        <div className='col'>
          <h2 className='font'>{gameData ? gameData.title : "Ładowanie..."}</h2>
        </div>
      </div>

      {/* Sekcja Główna: Karuzela w col-7 oraz Blok Ocen/Tagów w col-5 */}
      <div className='row m-3 p-3 text-center justify-content-center'>

        {/* Lewa kolumna - Karuzela multimediów */}
        <div className='col-7'>
          {allMediaItems.length > 0 ? (
            /* Główny kontener izolujący pozycjonowanie */
            <div className="position-relative w-100 overflow-hidden rounded shadow bg-black">

              {/* Kontener proporcji 16:9 - zawiera wyłącznie slajdy */}
              <div className="ratio ratio-16x9">
                <div className="carousel slide">
                  <div className="carousel-inner h-100">
                    {allMediaItems.map((item, idx) => {
                      return (
                        <div key={`main-media-${idx}`} className={`carousel-item h-100 ${idx === activeIndex ? 'active' : ''}`}>
                          <img
                            src={item.source}
                            alt={`Media ${idx}`}
                            className="w-100 h-100"
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STRZAŁKI WYCIĄGNIĘTE POZA RATIO - Teraz pozycjonują się prawidłowo na krawędziach całego czarnego boxu */}
              <button
                className="carousel-control-prev"
                type="button"
                onClick={handlePrev}
                style={{ width: '60px', zIndex: 10, position: 'absolute', top: 0, bottom: 0, left: 0 }}
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Poprzedni</span>
              </button>

              <button
                className="carousel-control-next"
                type="button"
                onClick={handleNext}
                style={{ width: '60px', zIndex: 10, position: 'absolute', top: 0, bottom: 0, right: 0 }}
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Następny</span>
              </button>

              {/* Horyzontalny pasek miniatur pod spodem */}
              <div
                className="d-flex gap-2 mt-2 overflow-x-auto pb-2 pt-1 justify-content-start"
                style={{ scrollBehavior: 'smooth' }}
              >
                {allMediaItems.map((item, idx) => {
                  return (
                    <div
                      key={`thumb-media-${idx}`}
                      onClick={() => setActiveIndex(idx)}
                      className="position-relative flex-shrink-0 rounded overflow-hidden border border-2"
                      style={{
                        width: '120px',
                        height: '70px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderColor: idx === activeIndex ? '#1a9fff' : '#333',
                        opacity: idx === activeIndex ? 1 : 0.6
                      }}
                    >
                      <img
                        src={item.source}
                        alt="Miniaturka"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Fallback, gdyby gra nie miała jeszcze pobranych danych */
            <div className="ratio ratio-16x9 bg-secondary rounded animate-pulse"></div>
          )}
        </div>

        {/* Prawa kolumna - Statystyki i metadane gry */}
        <div className='box-idk col-5 p-3 border d-flex flex-column justify-content-between'>
          {/* Sekcja ocen */}
          <div className="row align-items-center g-0">
            <div className="col-6 border-end">
              <SiteRating gameId={GameId} />
            </div>
            <div className="col-6">
              <SteamRating gameId={GameId} />
            </div>
          </div>

          <br />
          <div>
            <p className='font fw-bold m-0'>Tagi:</p>
            <p className="m-0">| {WypiszTagi()}</p>
          </div>
          <br />
          <div>
            <p className="m-0"><b>Data Wydania:</b> {gameData ? gameData.release_date : "---"}</p>
            <p className="m-0"><b>Developer:</b> {gameData ? gameData.publisher : "---"}</p>
          </div>
        </div>
      </div>

      {/* Sekcja dolna: Opis Gry oraz Wymagania Sprzętowe */}
      <div className='row m-3 p-3 text-center'>
        <div className='box-idk col-5 p-3 border text-start d-flex flex-column justify-content-between'>
          <div>
            <p className="fw-bold font">O grze:</p>
            <p>{gameData ? gameData.about : "Brak opisu gry."}</p>
          </div>

          {/* Blok przycisku listy życzeń */}
          {userData.isLogged && gameData && (
            <div className="mt-3 text-center">
              <WishlistButton
                gameId={gameData.id}
                userId={userData.id}
                isLogged={userData.isLogged}
              />
              {(userData.type === 'seller' || userData.type === 'admin') && (
                <button className="btn border mt-2 border-3 w-100 fw-bold transition-all btn-danger border-danger" onClick={() => navigate("/Create-Offer", { state: { initialTitle: gameData.title } })}                >
                  DODAJ OFERTE
                </button>
              )}
            </div>
          )}
        </div>

        <div className='col-7 d-flex'>
          {gameData && (
            <>
              {/* Zalecane Wymagania */}
              <div className='box-idk m-2 p-3 border flex-fill text-start'>
                <h3 className='font fs-5 text-center mb-3'>Zalecane Wymagania:</h3>
                <p>
                  {gameData.opt_os && <><b>System:</b> {gameData.opt_os}<br /></>}
                  {gameData.opt_gpu && <><b>Grafika:</b> {gameData.opt_gpu}<br /></>}
                  {gameData.opt_cpu && <><b>Procesor:</b> {gameData.opt_cpu}<br /></>}
                  {gameData.opt_ram && <><b>RAM:</b> {gameData.opt_ram} GB<br /></>}
                  {gameData.opt_size && <><b>Miejsce:</b> {gameData.opt_size} GB<br /></>}
                </p>
              </div>

              {/* Minimalne Wymagania */}
              <div className='box-idk m-2 p-3 border flex-fill text-start'>
                <h3 className='font fs-5 text-center mb-3'>Minimalne Wymagania:</h3>
                <p>
                  {gameData.min_os && <><b>System:</b> {gameData.min_os}<br /></>}
                  {gameData.min_gpu && <><b>Grafika:</b> {gameData.min_gpu}<br /></>}
                  {gameData.min_cpu && <><b>Procesor:</b> {gameData.min_cpu}<br /></>}
                  {gameData.min_ram && <><b>RAM:</b> {gameData.min_ram} GB<br /></>}
                  {gameData.min_size && <><b>Miejsce:</b> {gameData.min_size} GB<br /></>}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Oferty sprzedaży kluczy */}
      {userData.isLogged && gameData && (
        <SaleOffers gameId={GameId} />
      )}

      {/* Recenzje i opinie użytkowników */}
      <ReviewsSection gameId={GameId} />

      {/* Stopka strony */}
      <Footer />
    </div>
  );
}