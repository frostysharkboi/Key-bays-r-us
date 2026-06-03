import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as React from 'react';
import { UserContext } from '../components/user-context/UserContext';
import { useNavigate } from 'react-router-dom';
import './root.css'
import { axiosPath } from "../App";

export default function Root(){
  const { userData, logout } = useContext(UserContext);

  const [games, setGames] = useState([]);                 // Dane gier z bazy danych
  const [formatedGames, setFormatedGames] = useState([]); // Sformatowane dane gier
  const [tags, setTags] = useState([]);                   // Dane tagów z bazy danych
  const [SearchThisTitle, changeTitle] = useState("");

  // Stan odpowiedzialny za sterowanie automatyczną karuzelą
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = useNavigate();

  // Pobranie danych o okładkach gier z tabeli
  const getGames = () => {
    axios.get(`${axiosPath}/games/cover`).then((res) => {
      setGames(res.data);

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

  useEffect(() => {
    getGames();
    console.log(userData);
  }, []);

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

    // Czyszczenie interwału, by zapobiec wyciekom pamięci przy przełączaniu podstron
    return () => clearInterval(interval);
  }, [formatedGames]);

  // Czyste funkcje nawigacyjne bez przesyłania stanów usera
  function RedirectToSeaching(genreId) {
    if (genreId == null) {
      navigate("/Search", { state: { Title: SearchThisTitle } });
    } else {
      navigate("/Search", { state: { GenreId: genreId } });
    }
  }

  function RedirectToGamePage(gameId) {
    navigate('/Game', { state: { GameId: gameId } });
  }

  function LogOutUser() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <>
    <div className="container-fluid">
      {/* Nagłówek Strony */}
      <div className="row m-3 p-3 text-center">

        {/* Wyszukiwarka */}
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...' onChange={(e) => changeTitle(e.target.value)}/>
          <button className='border border-3 btnsrch' onClick={() => RedirectToSeaching(null)}>SZUKAJ</button>
        </div>

        {/* Logo */}
        <div className='col-4 fw-bolder logo'>
          <h1 onClick={() => navigate('google.com')}>Keys &apos;R&apos; Us</h1>
        </div>

        {/* Dropdown menu konta */}
        <div className='col-4'>
          <div className="dropdown">
            <button className="dropbtn font" id="nick">
              {userData.isLogged ? userData.login : "Gosc"}
            </button>
            <div className="dropdown-content fw-bold">
              {!userData.isLogged ? (
                <h5 onClick={() => navigate("/Login")}>Zaloguj sie</h5>
              ) : (
                <>
                  <h5 onClick={() => navigate('/Wishlist')}>Lista Zyczen</h5>
                  <h5>Zarzadzaj kontem</h5>
                  {userData.type == "seller" && (
                    <h5 onClick={() => navigate("/Create-Offer")}>Dodaj oferte</h5>
                  )}
                  {userData.type == "admin" && (
                    <h5>Panel Admina</h5>
                  )}
                  <h5 onClick={LogOutUser}>Wyloguj sie</h5>
                </>
              )}
            </div>
          </div> 
        </div>
      </div>

      {/* Karuzela sterowana przez Reacta (Pierwszy statyczny obrazek usunięty zgodnie z prośbą) */}
      <div className="row m-3 p-3 text-center">
        <div className="carousel slide carousel-fade w-25">
          <div className="carousel-inner">
            {formatedGames.map((e, index) => {
              return (
                <div 
                  key={e.id}
                  className={index === activeIndex ? "carousel-item active" : "carousel-item"} 
                  onClick={() => RedirectToGamePage(e.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={e.cover_img} className="mx-auto d-block w-50 h-50" alt={e.title}/>
                  <div className="carousel-caption d-none d-md-block">
                    <h5 className="opacity-50 bg-dark d-inline-block px-2 py-1">{e.title}</h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sekcja Gatunki */}
      <div className='row m-1 text-center font'>
          <h2>GATUNKI</h2>
      </div>
      <div className="row row-cols-4 justify-content-md-center m-3 p-3 text-center">
        {tags.map((row) => (
          <div 
            className="card rounded-0 border tag border-3 font col p-4 m-3" 
            key={row.id} 
            onClick={() => RedirectToSeaching(parseInt(row.id))}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">{row.tag}</p>
            </div>
          </div>
        ))}
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