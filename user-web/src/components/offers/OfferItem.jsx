import React, { useState } from 'react';

export default function OfferItem({ offer, userData }) {
  const [forWho, changePerson] = useState(userData.login);

  function showButton(offerId) {
    const element = document.getElementById(offerId);
    if (element) {
      if (element.style.visibility === "visible") {
        element.style.visibility = "hidden";
      } else {
        element.style.visibility = "visible";
      }
    }
  }

  return (
    <div className="col-3">
      <h2>{offer.login}</h2>
      <div>
        <h5>{offer.other}</h5>
        <h5>Cena: {offer.suggested_price} zł.</h5>
        <h5>Status: {offer.status}</h5>
      </div>
      <button onClick={() => showButton(offer.id)}>KUP</button>
      
      <div id={offer.id} style={{ visibility: "hidden" }}>
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
    </div>
  );
}