import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as React from 'react';
import { UserContext } from '../../public/user-context/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";

export default function GamePage(){
  const { userData, logout } = useContext(UserContext);

  const [game, setGame] = useState([]);                // Dane gier z bazy danych
  const [tags, setTags] = useState([]);                // Dane tagów z bazy danych
  const [connectedTags, updateTags] = useState([]);    // Lista tagów gier.
  const [reviews, updateReviews] = useState([]);       // Lista Recenzji
  const [SearchThisTitle, changeTitle] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const GameId = location.state?.GameId;

  // Pobranie danych z API
  const getGame = () => {
    if (!GameId) return;
    axios.get(`${axiosPath}/games/alldata`, { params: { game_id: GameId }}).then((res) => {
      setGame(res.data);
    });
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

  useEffect(() => {
    getGame();
    getAllTags();
    getSomeTags();
    getAllReviews();
  }, [GameId]);

  const gameData = game[0];

  function WypiszTagi(){
    const powiazaneTagi = [];
    if (connectedTags && tags.length > 0) {
      connectedTags.forEach(e => {
        if (e.game_id == GameId) {
          const znalezionyTag = tags.find(f => f.id == e.tag_id);
          if (znalezionyTag) {
            powiazaneTagi.push(znalezionyTag.tag);
          }
        }
      });
    }

    return (
      <>
        {powiazaneTagi.map((t, idx) => (
          <span key={idx}> {t} | </span>
        ))}
      </>
    );
  }

  function WypiszRecenzje(){
    const powiazaneRecenzje = [];
    if (reviews) {
      reviews.forEach(e => {
        if (e.game_id == GameId) {
          powiazaneRecenzje.push({ id: e.id, text: `Ocena: ${e.rating} | Opis: ${e.other}` });
        }
      });
    }

    if (powiazaneRecenzje.length > 0) {
      return (
        <div className="d-flex flex-column gap-2">
          {powiazaneRecenzje.map(r => (
            <i key={r.id} className="d-block border-bottom pb-1"> {r.text} </i>
          ))}
        </div>
      );
    } else {
      return <p>BRAK RECENZJI</p>;
    }
  }

  function SredniaRecenzji(){
    let sumaRecenzji = 0;
    let liczbaPetli = 0;
    let stringGwiazdki = "";

    if (reviews) {
      reviews.forEach(e => {
        if (e.game_id == GameId) {
          sumaRecenzji += e.rating;
          liczbaPetli += 1;
        }
      });
    }

    if (liczbaPetli > 0) {
      const srednia = Math.round(sumaRecenzji / liczbaPetli);
      for (let i = 0; i < srednia; i++) {
        stringGwiazdki += "★";
      }
    }

    while (stringGwiazdki.length < 5) {
      stringGwiazdki += "☆";
    }
    
    return <p className="fs-4 text-warning"> {stringGwiazdki} </p>;
  }

  function RedirectToSearching(genreId) {
    if (genreId == null) {
      navigate("/Search", { state: { Title: SearchThisTitle } });
    } else {
      navigate("/Search", { state: { GenreId: genreId } });
    }
  }

  function LogOutUser() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <>
    <div className="container-fluid col">
      {/* Nagłówek Strony */}
      <div className="row m-3 p-3 text-center">
        {/* Wyszukiwarka */}
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...' onChange={(e) => changeTitle(e.target.value)}/>
          <button className='border border-3 btnsrch' onClick={() => RedirectToSearching(null)}>SZUKAJ</button>
        </div>

        {/* Logo */}
        <div className='col-4 fw-bolder logo'>
          <h1 onClick={() => navigate('/')}>Keys &apos;R&apos; Us</h1>
        </div>

        {/* Dropdown menu konta */}
        <div className='col-4'>
          <div className="dropdown">
            <button className="dropbtn font" id="nick">
              {userData.isLogged ? userData.login : "Gość"}
            </button>
            <div className="dropdown-content fw-bold">
               {!userData.isLogged ? (
                  <h5 onClick={() => navigate("/Login")}>Zaloguj się</h5>
                ) : (
                <>
                  <h5 onClick={() => navigate("/Wishlist")}>Lista życzeń</h5>
                  <h5>Zarządzaj kontem</h5>
                  <h5 onClick={LogOutUser}>Wyloguj się</h5>
                </>
              )}
            </div>
          </div> 
        </div>
      </div>

      {/* Tytuł Gry */}
      <div className='row m-3 p-3 text-center'>
        <div className='col'>
          <h2 className='font'>{gameData ? gameData.title : "Ładowanie tytułu..."}</h2>
        </div>
      </div>

      {/* Wiersz z mediami i metadanymi gry */}
      <div className='row m-3 p-3 text-center'>
        {/* Okładka */}
        <div className='col-7'>
          {gameData ? (
            <img src={gameData.cover_img} alt={`Okładka ${gameData.title}`} className="img-fluid rounded" style={{maxHeight: '400px'}}/>
          ) : (
            <p>Brak obrazka</p>
          )}
        </div>
        <div className='box-idk col-5 p-3 border'>
            {/* Recenzje */}
            <div>
              <p className='font fw-bold'>Recenzje</p>
              {SredniaRecenzji()}
            </div>
            <br/>
            {/* Tagi */}
            <div>
              <p className='font fw-bold'>Tagi:</p>
              <p>| {WypiszTagi()}</p>
            </div>
            <br/>
            {/* Szczegóły wydania */}
            <div>
              <p><b>Data Wydania:</b> {gameData ? gameData.release_date : "---"}</p>
              <p><b>Developer:</b> {gameData ? gameData.publisher : "---"}</p>
            </div>
        </div>
      </div>

      {/* Opis Gry i wymagania sprzętowe */}
      <div className='row m-3 p-3 text-center'>
        {/* Opis Gry */}
        <div className='box-idk col-5 p-3 border text-start'>
          <p className="fw-bold font">O grze:</p>
          <p>{gameData ? gameData.about : "Brak opisu gry."}</p>
        </div>
        {/* Kontener wymagań technicznych */}
        <div className='col-7 d-flex'>
          {/* Zalecane */}
          <div className='box-idk m-2 p-3 border flex-fill text-start'>
            <h3 className='font fs-5 text-center mb-3'>Zalecane Wymagania:</h3>
            <p>
              <b>System:</b> {gameData ? gameData.opt_os : "---"}<br/>
              <b>Grafika:</b> {gameData ? gameData.opt_gpu : "---"}<br/>
              <b>Procesor:</b> {gameData ? gameData.opt_cpu : "---"}<br/>
              <b>RAM:</b> {gameData ? (gameData.opt_ram / 1024).toFixed(0) : "---"} GB<br/>
              <b>Miejsce:</b> {gameData ? gameData.opt_size : "---"} GB
            </p>
          </div>

          {/* Minimalne */}
          <div className='box-idk m-2 p-3 border flex-fill text-start'>
            <h3 className='font fs-5 text-center mb-3'>Minimalne Wymagania:</h3>
            <p>
              <b>System:</b> {gameData ? gameData.min_os : "---"}<br/>
              <b>Grafika:</b> {gameData ? gameData.min_gpu : "---"}<br/>
              <b>Procesor:</b> {gameData ? gameData.min_cpu : "---"}<br/>
              <b>RAM:</b> {gameData ? (gameData.min_ram / 1024).toFixed(0) : "---"} GB<br/>
              <b>Miejsce:</b> {gameData ? gameData.min_size : "---"} GB
            </p>
          </div>
        </div>
      </div>

      {/* Oferty sklepowe */}
      <div className='row m-3 p-3 text-center border border-3 offer'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <h3 className='tbd text-muted fs-5'>TBD (Wkrótce dostępne)</h3>
      </div>

      {/* Szczegółowe Recenzje użytkowników */}
      <div className='box-idk row m-3 p-3 text-center border'>
        <p className='font fw-bold'>Szczegółowe Recenzje</p>
        <div className="text-start p-2">{WypiszRecenzje()}</div>
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