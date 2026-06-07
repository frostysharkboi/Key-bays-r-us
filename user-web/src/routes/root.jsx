import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as React from 'react';
import { UserContext } from '../components/user-context/UserContext';
import { useNavigate } from 'react-router-dom';
import './root.css'
import { axiosPath } from "../App";
import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import GameCarousel from '../components/carousel/GameCarousel';

export default function Root() {
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();

  const [formatedGames, setFormatedGames] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [wishlistGames, setWishlistGames] = useState([]);
  const [randomGenresData, setRandomGenresData] = useState([]);

  const getGames = () => {
    axios.get(`${axiosPath}/games/cover`).then((res) => {
      const mapped = res.data.map(e => ({
        id: e.id,
        title: e.title,
        about: e.about,
        cover_img: e.cover_img,
      }));
      setFormatedGames(mapped);
    });
  };

  const getAllTags = () => {
    axios.get(`${axiosPath}/tags`).then((res) => {
      setTags(res.data);
    });
  };

  // NAPRAWIONE: Dodanie poprawnej struktury params dla zapytania GET
  const getWishlistGames = () => {
    if (!userData?.isLogged || !userData?.id) return;

    axios.get(`${axiosPath}/wishlist/wishlistData`, {
      params: { id: userData.id }
    })
      .then((res) => {
        setWishlistGames(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("Błąd pobierania wishlisty:", err));
  };

  const getRandomGenresGames = () => {
    axios.get(`${axiosPath}/games/byRandomGenres`)
      .then((res) => {
        setRandomGenresData(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("Błąd pobierania losowych gatunków:", err));
  };

  useEffect(() => {
    getGames();
    getRandomGenresGames();
  }, []);

  useEffect(() => {
    if (userData?.isLogged) {
      getWishlistGames();
    } else {
      setWishlistGames([]);
    }
  }, [userData]);

  useEffect(() => {
    if (formatedGames.length > 0) {
      getAllTags();
    }
  }, [formatedGames]);

  useEffect(() => {
    if (formatedGames.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === formatedGames.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [formatedGames]);

  function RedirectToSeaching(genreId) {
    if (genreId == null) {
      navigate("/Search");
    } else {
      navigate("/Search", { state: { GenreId: genreId } });
    }
  }

  function RedirectToGamePage(gameId) {
    navigate('/Game', { state: { GameId: gameId } });
  }

  return (
    <>
      <div className="container-fluid text-light min-vh-100 pb-5">
        <Header />

        {/* GŁÓWNA KARUZELA BANEROWA */}
        <div className="row m-3 p-3 text-center justify-content-center">
          <div className="col-12 col-lg-8 carousel slide carousel-fade shadow-lg bg-black rounded overflow-hidden">
            <div className="carousel-inner" style={{ height: "400px" }}>
              {formatedGames.map((e, index) => (
                <div
                  key={e.id}
                  className={index === activeIndex ? "carousel-item active h-100" : "carousel-item h-100"}
                  onClick={() => RedirectToGamePage(e.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={e.cover_img} className="w-100 h-100" alt={e.title} style={{ objectFit: "contain" }} />
                  <div className="carousel-caption">
                    <h4 className=" bg-opacity-75 d-inline-block px-3 py-2 bg-dark font">
                      {e.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REUŻYWALNA KARUZELA: WISHLISTA */}
        {userData?.isLogged && wishlistGames.length > 0 && (
          <div className="position-relative">
            <GameCarousel
              title={`Twoja Lista Zyczen (${wishlistGames.length})`}
              games={wishlistGames}
              showArrows={true}
              onGameClick={RedirectToGamePage}
              titleColorClass="text-danger"
            />
            {/* NAPRAWIONE: Wyciągnięty styl inline z cudzysłowu klas Bootstrapa */}
            <div className="text-end mx-4 px-4" style={{ marginTop: '-20px' }}>
              <button
                className="btn noRound noWishlistBtn font px-4"
                onClick={() => navigate("/Wishlist")}
              >
                PRZEJDZ DO PELNEJ WISHLISTY →
              </button>
            </div>
          </div>
        )}

        {/* REUŻYWALNE KARUZELE: LOSOWE GATUNKI */}
        {randomGenresData.length > 0 && randomGenresData.map((genreBlock, idx) => (
          <GameCarousel
            key={`random-genre-${idx}`}
            title={`Polecane z gatunku: ${genreBlock.genreName}`}
            games={genreBlock.games}
            showArrows={true}
            onGameClick={RedirectToGamePage}
            titleColorClass="text-danger"
          />
        ))}

        {/* SEKCJA GATUNKI */}
        <div className='row m-1 mt-5 text-center font'>
          <h2>WSZYSTKIE GATUNKI</h2>
        </div>
        <div className="row row-cols-2 row-cols-md-4 justify-content-center mx-4 my-3 p-3 text-center">
          {tags.map((row) => (
            <div
              className="card border noRound tag border-3 font col p-3 m-2"
              key={row.id}
              onClick={() => RedirectToSeaching(parseInt(row.id))}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body p-1">
                <p className="card-text fw-bold m-0">{row.tag}</p>
              </div>
            </div>
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}