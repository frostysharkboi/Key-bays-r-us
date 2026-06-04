import { useState, useContext, useEffect } from 'react';
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


export default function GamePage(){
  const { userData, logout } = useContext(UserContext);

  const [game, setGame] = useState([]);               
  const [tags, setTags] = useState([]);                 
  const [connectedTags, updateTags] = useState([]);   
  const [reviews, updateReviews] = useState([]);      
  const [SearchThisTitle, changeTitle] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const GameId = location.state?.GameId;

  const getGame = () => {
    if (!GameId) return;
    axios.get(`${axiosPath}/games/alldata`, { params: { game_id: GameId }}).then((res) => {
      console.log("Dane pobranej gry z API:", res.data[0]); // <-- DODAJ TĘ LINIJKĘ
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
          if (znalezionyTag) powiazaneTagi.push(znalezionyTag.tag);
        }
      });
    }
    return <>{powiazaneTagi.map((t, idx) => <span key={idx}> {t} | </span>)}</>;
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
      <div className="row m-3 p-3 text-center">
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" placeholder='szukaj...' onChange={(e) => changeTitle(e.target.value)}/>
          <button className='border border-3 btnsrch' onClick={() => navigate("/Search", { state: { Title: SearchThisTitle } })}>SZUKAJ</button>
        </div>
        <div className='col-4 fw-bolder logo'>
          <h1 onClick={() => navigate('/')}>Keys &apos;R&apos; Us</h1>
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
                  <h5 onClick={() => navigate('/Edit-Account')}>Zarzadzaj kontem</h5>
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

      <div className='row m-3 p-3 text-center'>
        <div className='col'>
          <h2 className='font'>{gameData ? gameData.title : "Ładowanie..."}</h2>
        </div>
      </div>

      <div className='row m-3 p-3 text-center'>
        <div className='col-7'>
          {gameData && <img src={gameData.cover_img} alt="Cover" className="img-fluid rounded" style={{maxHeight: '400px'}}/>}
        </div>
        <div className='box-idk col-5 p-3 border d-flex flex-column justify-content-between'>
            {/* Sekcja ocen podzielona na dwa komponenty w jednym wierszu */}
            <div className="row align-items-center g-0">
              <div className="col-6 border-end">
                <SiteRating gameId={GameId} />
              </div>
              <div className="col-6">
                <SteamRating gameId={GameId} />
              </div>
            </div>

            <br/>
            <div>
              <p className='font fw-bold m-0'>Tagi:</p>
              <p className="m-0">| {WypiszTagi()}</p>
            </div>
            <br/>
            <div>
              <p className="m-0"><b>Data Wydania:</b> {gameData ? gameData.release_date : "---"}</p>
              <p className="m-0"><b>Developer:</b> {gameData ? gameData.publisher : "---"}</p>
            </div>
        </div>
      </div>

      <div className='row m-3 p-3 text-center'>
        <div className='box-idk col-5 p-3 border text-start d-flex flex-column justify-content-between'>
          <div>
            <p className="fw-bold font">O grze:</p>
            <p>{gameData ? gameData.about : "Brak opisu gry."}</p>
          </div>
          
          {/* Blok dedykowanego przycisku Wishlisty */}
          {userData.isLogged && gameData && (
            <div className="mt-3 text-center">
              <WishlistButton 
                gameId={gameData.id} 
                userId={userData.id} 
                isLogged={userData.isLogged} 
              />
            </div>
          )}
        </div>
        <div className='col-7 d-flex'>
          <div className='box-idk m-2 p-3 border flex-fill text-start'>
            <h3 className='font fs-5 text-center mb-3'>Zalecane Wymagania:</h3>
            <p>
              <b>System:</b> {gameData ? gameData.opt_os : "---"}<br/>
              <b>Grafika:</b> {gameData ? gameData.opt_gpu : "---"}<br/>
              <b>Procesor:</b> {gameData ? gameData.opt_cpu : "---"}<br/>
              <b>RAM:</b> {gameData ? gameData.opt_ram : "---"} GB<br/>
              <b>Miejsce:</b> {gameData ? gameData.opt_size : "---"} GB
            </p>
          </div>
          <div className='box-idk m-2 p-3 border flex-fill text-start'>
            <h3 className='font fs-5 text-center mb-3'>Minimalne Wymagania:</h3>
            <p>
              <b>System:</b> {gameData ? gameData.min_os : "---"}<br/>
              <b>Grafika:</b> {gameData ? gameData.min_gpu : "---"}<br/>
              <b>Procesor:</b> {gameData ? gameData.min_cpu : "---"}<br/>
              <b>RAM:</b> {gameData ? gameData.min_ram : "---"} GB<br/>
              <b>Miejsce:</b> {gameData ? gameData.min_size : "---"} GB
            </p>
          </div>
        </div>
      </div>

      {userData.isLogged && gameData && (
        <SaleOffers gameId={GameId} />
      )}

      <div className='box-idk row m-3 p-3 text-center border'>
        <p className='font fw-bold'>Szczegółowe Recenzje</p>
        <div className="text-start p-2">{WypiszRecenzje()}</div>
      </div>
    </div>
  );
}