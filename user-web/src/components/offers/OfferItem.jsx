import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';

export default function OfferItem({ offer, userData, gameId, openedOfferId, setOpenedOfferId }) {
  const [forWho, changePerson] = useState(userData.login);
  const [showPurchase, changeVisibility] = useState([]);

  /*
  function showButton(offerId) {
    let boobies = [...showPurchase];
    boobies.forEach(element => {
      if(element.id == offerId){
        element.isVisible = true;
      };
    });
    changeVisibility(boobies);
  }
  */

  function showButton() {
    setOpenedOfferId(
      openedOfferId === offer.id ? null : offer.id
    );
    console.log("Man");
  }

  const isVisible = openedOfferId === offer.id;

  return (
    <div className="col-3">
      <h2>{offer.login}</h2>
      <div>
        <h5>{offer.other}</h5>
        <h5>Cena: {offer.suggested_price} zł.</h5>
        <h5>Status: {offer.status}</h5>
      </div>
      <button onClick={() => showButton()}>KUP</button>
      
      
      {offer != null && isVisible && (
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