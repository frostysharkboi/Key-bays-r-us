import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';

export default function OfferItem({ offer, userData, gameId, openedOfferId, setOpenedOfferId }) {
  const [forWho, changePerson] = useState(userData.id);
  const [showPurchase, changeVisibility] = useState([]);
  const [AllUsers, getAllUsers] = useState(null);
  const [forWhoButBetter, changeWho] = useState(true);
  const [allTrans, getTrans] = useState(null);

    
  // POPRAWKA: Usunęliśmy stąd blokujący warunek "if (!isAdmin && ...)", 
  // ponieważ rodzic (SaleOffers) już zajął się odrzuceniem złych statusów.

  //Dzięki szkot, że usunąłęś funkcję odpowiadającą za pokazywanie szczegółów oferty.
  function showButton() {
    setOpenedOfferId(
      openedOfferId === offer.id ? null : offer.id
    );
  }

  function GetInContact(){
    if(userData.type != "seller") {
      let popup = confirm(`Źródła komunikacji z sprzedawcą\nTag Discord: ${offer.discord_tag}\nCzy będziesz negocjować o tą ofertę?`);
      if(popup == true){
        let receiverId = userData.id;
        AllUsers.forEach(user => {
          if(user.id == forWho && user.id != userData.id){
            receiverId = user.id;
          }
        });
        console.log(`${userData} | ${receiverId} | ${offer.id}`);

        //Ten warunek i bool są potrzebne. Z jakiegoś powodu, baza dostaje pierdolca jak user ma więcej niż jedną transkacje na koncie.
        let ifRecieverIsTheSame = false;
        if(allTrans != null){
          allTrans.forEach(element => {
            if(element.reciever_id == receiverId){
              //ifRecieverIsTheSame = true;
            }
          });
        }

        if(ifRecieverIsTheSame == false){
          axios.post(`${axiosPath}/transactions/add`, {
            offerId: offer.id,
            buyerId: userData.id,
            receiverId: receiverId,
            status: "Pending"
          }).then(() => {
            console.log("Chyba przeszło?");
            alert("Transakcja została dodana");
          }).catch((err) => {
            alert("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
            console.error(err);
          });
        } else {
          alert("Z jakiegoś powodu, transkacja nie mogła dojść do skutku");
        }
      }
    } else {
      alert("Przepraszamy\nZe względu na politykę naszego sklepu, sprzedawcy nie mogą kupować kluczy od innych sprzedawców.");
    }
  }

  useEffect(() => {
    axios.get(`${axiosPath}/users/getThemAll`).then((res) => {
      getAllUsers(res.data);
      console.log("Dane userów\n", res.data);
    });
    axios.get(`${axiosPath}/transactions/getAll`).then((res) => {
      getTrans(res.data);
      console.log("Transakcje\n", res.data);
    })
  }, []);

  const isVisible = openedOfferId === offer.id;

  return (
    <div className="col-3">
      <h2>{offer.login}</h2>
      <div>
        <h5>{offer.other}</h5>
        <h5>Cena: {offer.suggested_price} zł.</h5>
        <h5>Status: {offer.status}</h5>
      </div>
      <button onClick={() => showButton()}>Wiecej</button>
      
      
      {offer != null && isVisible && (
        <div id={offer.id}>
          <select onChange={() => changeWho(!forWhoButBetter)}>
            <option value={true}>Dla mnie</option>
            <option value={false}>Dla kogoś innego</option>
          </select>
          
          {forWhoButBetter == false && (
            <div>
              <input list="allUsers" type="text" onChange={(e) => changePerson(e.target.value)} />
              <datalist id="allUsers">
                {AllUsers.map((user) => (
                  <option key={user.id} value={user.login}>{user.login}</option>
                ))}
              </datalist>
              <h5><button onClick={() => GetInContact()}>Zgiftuj</button></h5>
            </div>
          )}

          {forWhoButBetter == true && (
            <div>
              <h5><button onClick={() => GetInContact()}>Kup</button></h5>
            </div>
          )}

      </div>
      )}
      
    </div>
  );
}