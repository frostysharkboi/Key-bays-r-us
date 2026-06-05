import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";
import { UserContext } from '../components/user-context/UserContext';
import Header from '../components/header/Header';

export default function Root() {
  const navigate = useNavigate();

  const { userData, logout } = useContext(UserContext);
  const [games, setGames] = useState([]);// Dane gier z bazy danych
  const [offerKey, setKey] = useState(null);
  const [offerPrice, setPrice] = useState(null);
  const [offerOther, setOther] = useState(null);
  const [offerTitle, setTitle] = useState(null);
  const [offerGameId, setGameId] = useState(null);
  const [DataIsGood, changeVeryfication] = useState(false);
  const [errorBoxText, setErrorBoxText] = useState("");
  const [offerAsObject, getOffer] = useState(null);

  React.useEffect(() => {
    getFilteredGames();
    console.log(userData);
  }, []);

  useEffect(() => {
    console.log(games);
  }, [games]);

  useEffect(() => {
    let gameId2 = 0;
    
    if(offerTitle != null){
        games.forEach(game => {
            if(game.title == offerTitle){
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

  function getTitleAndId(e){
    setTitle(e.target.value);
  }

  const getFilteredGames = () => {
    const outputTags = "";
    
    axios.get(`${axiosPath}/games/tagsort`, { 
      params: { tags: outputTags }
    })
    .then((res) => {
      setGames(res.data);
    })
    .catch(err => console.error("Błąd pobierania gier:", err));
  };

  // Funkcja walidująca poprawność wprowadzonych danych (E-mail, Login, Siła hasła)
  function CheckIfDataIsGood() {
    const offerChekcs = {
        key: false,
        title: false
    }
    if(offerChekcs != null && offerKey != null && offerOther != null && offerPrice != null){
      console.log(offerAsObject);

      games.forEach(game => {
          if(offerChekcs.title == false){
              if(game.title == offerAsObject.title){
                  setErrorBoxText("");
                  offerChekcs.title = true;
          } else {
              setErrorBoxText("Podana gra nie istnieje");
          }}
      });

      (offerAsObject.key.length > 14 && offerAsObject.key.length < 51) ? offerChekcs.key = true : setErrorBoxText("Klucz jest nieprawidłowy"); 
      
      (offerPrice != null)? null : setErrorBoxText("Oferta musi być wycieniona");
      (offerOther != null)? null : setErrorBoxText("Oferta musi zawierać opis");

      if(offerChekcs.key == true && offerChekcs.title == true && offerPrice != null && offerOther != null) return true;
      return false
    } else {
      alert("Proszę uzupełnić formularz do końca");
      return false;
    }
  }

  function AddOfferToDb(){
    if(CheckIfDataIsGood() == true){
      if(confirm("Czy na pewno chcesz wystawić tą ofertę?\nWciśnij ok, by wystawić.") == true){
        axios.post(`${axiosPath}/key_offers/add`, {
            key: offerAsObject.key,
            price: offerAsObject.price,
            other: offerAsObject.other,
            game_id: offerAsObject.gameId,
            seller_id: userData.id,
            status: "Active"
        }).then(() => {
            console.log("Chyba przeszło?");
            let popup = alert("Twoja oferta właśnie została wystawiona", "ok");
            if(popup == true){
              console.log("Kurwa powinna przekazywać locationState");
              //Szkot, tu musisz wykminić, by po przekierowaniu na podstronę odświeżyło /Offers.
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

  function LogOutUser() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <>
    <div className="container-fluid">
      <Header axiosPath={axiosPath}/>

      {/* Formularz Rejestracji */}
      <div className='row m-1 text-center font'>
          <h3>DODAWANIE OFERTY</h3>
          <div>
            <label>Podaj grę, jaką chcesz wystawić</label>
            <br />
            <input list="availableGames" onChange={(e) => getTitleAndId(e)} value={offerTitle}/>
            <datalist id="availableGames">
                {games.map((game) => (
                    <option key={game.id} value={game.title}/>
                ))}
            </datalist>
          </div>
          <div>
            <label>Podaj klucz gry</label>
            <input type="text" onChange={(e) => setKey(e.target.value)} value={offerKey}/>
          </div>
          <div>
            <label>Podaj sugerowaną cenę sprzedaży</label>
            <input type="number" min="1" onChange={(e) => setPrice(e.target.value)} value={offerPrice}/>
          </div>
          <div>
            <label>Podaj opis oferty</label>
            <textarea rows="4" cols="50" onChange={(e) => setOther(e.target.value)} value={offerOther}/>
          </div>
          <div>
            <button onClick={() => AddOfferToDb()}>Dodaj Oferte</button>
            {errorBoxText && <p id="Error_box" className='text-center fs-3 text-danger'>{errorBoxText}</p>}
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