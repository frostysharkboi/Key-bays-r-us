import React, { useState, useEffect, useContext, } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';

export default function SaleOffers({ gameId }){
    const { userData, logout } = useContext(UserContext);

    const [offersData, GetOffers] = useState(null);
    const [offersBtnTemp, changeBtn] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      if (!gameId) return;

      setLoading(true);
      setError(false);

      console.log("Zaczyna pobierać dane. Id gry nie było puste.");
      // Zapytanie do naszego lokalnego backendu proxy
      axios.get(`${axiosPath}/key_offers/offersForGames`, { params: { id: gameId } })
        .then((res) => {
          if (res.data && res.data[0].id != null) {
            GetOffers(res.data);
            console.log("Dane zostały pobrane\n", res.data);
          } else {
            setError(true);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Błąd pobierania danych ofert", err);
          setError(true);
          setLoading(false);
        });
    }, [gameId]);

    useEffect(() => {
      if(offersData != null){
        const newButtons = offersData.map(offer => ({
          offerId: offer.id,
          isVisible: false
        }));

        changeBtn(newButtons);
        console.log(offersBtnTemp);
      }
    }, [offersData]);

    function showButton(offerId){
      if(document.getElementById(offerId).style.visibility == "visible"){
        document.getElementById(offerId).style.visibility = "hidden";
      } else {
        document.getElementById(offerId).style.visibility = "visible";
      }
    }

    function showforWho(offerId){
      /*
      if(document.getElementById(offerId).style.visibility == "visible"){
        if(forWho == userData.login){
          document.getElementById(`${offerId}Bullshit`).style.visibility = "hidden";
        } else {
          document.getElementById(`${offerId}Bullshit`).style.visibility = "visible";
        }
      }
      */
    }

    const [forWho, changePerson] = useState(userData.login);

    if (loading) {
    return (
      <div className='row m-3 p-3 text-center border border-3 offer'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Ładowanie ofert...</span>
      </div>
    );
  }

  if (error || !offersData) {
    return (
      <div className='row m-3 p-3 text-center border border-3 offer'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <span className="text-danger" style={{ fontSize: '0.85rem' }}>brak ofert</span>
      </div>
    );
  }
  return (
    <div className='row m-3 p-3 text-center border border-3 offer'>
      <p className='font fw-bold'>Oferty sklepu</p>
      <div className="container-fluid">
      <div className="row flex-row flex-nowrap overflow-auto">
        {offersData.map((offer) => (
          <div key={offer.id} className="col-3">
            <h2>{offer.login}</h2>
            <p>
              <h5>{offer.other}</h5>
              <h5>Cena: {offer.suggested_price} zł.</h5>
              <h5>Status: {offer.status}</h5>
            </p>
            <button onClick={() => showButton(offer.id)}>KUP</button>
            <div id={offer.id} style={{visibility: "hidden"}}>
              <select onChange={showforWho(offer.id)}>
                <option value={userData.login}>Dla mnie</option>
                <option value="Other"></option>
              </select>
              <div id={`${offer.id}Bullshit`} style={{visibility: "hidden"}}>
                  <input type="text" onChange={(e) => forWho(e.target.value)}/>
              </div>
            </div>
          </div>
        ))}
      </div>
  </div>
    </div>
  );
}