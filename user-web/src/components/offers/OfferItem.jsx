import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';

export default function OfferItem({ offer, userData, gameId }) {
  const [forWho, changePerson] = useState(userData.login);
  const [showPurchase, changeVisibility] = useState([]);
  const [offersData, GetOffers] = useState(null);

  function showButton(offerId) {
    /*
    const element = document.getElementById(offerId);
    if (element) {
      if (element.style.visibility === "visible") {
        element.style.visibility = "hidden";
      } else {
        element.style.visibility = "visible";
      }
    }
    */
    let boobies = [...showPurchase];
    boobies.forEach(element => {
      if(element.id == offerId){
        element.isVisible = true;
      };
    });
    changeVisibility(boobies);
  }

  useEffect(() => {
    axios.get(`${axiosPath}/key_offers/offersForGames`, { params: { id: gameId } })
      .then((res) => {
        if (res.data && res.data[0].id != null) {
          GetOffers(res.data);
          console.log("Dane zostały pobrane\n", res.data);
        }
      })
      .catch((err) => {
        console.error("Błąd pobierania danych ofert", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let arr = [];
    if(offersData != null){
      offersData.forEach(off => {
        let dat = {
          id: off.id,
          isVisible: false
        }
        arr.push(dat);
      });
    }
    changeVisibility(arr);
    console.log("\njebać was kurwa", showPurchase);
  }, [offersData]);

  return (
    <div className="col-3">
      <h2>{offer.login}</h2>
      <div>
        <h5>{offer.other}</h5>
        <h5>Cena: {offer.suggested_price} zł.</h5>
        <h5>Status: {offer.status}</h5>
      </div>
      <button onClick={() => showButton(offer.id)}>KUP</button>
      
      
      {offer != null && (
        <div id={offer.id}>
          <select onChange={(e) => changePerson(e.target.value)} value={forWho}>
            <option value={userData.login}>Dla mnie</option>
            <option value="Other">Dla kogoś innego</option>
          </select>
          
          {forWho !== userData.login && (
            <div>
              <input type="text" onChange={(e) => changePerson(e.target.value)} />
              <button>Zgiftuj</button>
            </div>
          )}
      </div>
      )}
      
    </div>
  );
}