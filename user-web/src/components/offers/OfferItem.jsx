import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';

export default function OfferItem({ offer, gameId, openedOfferId, setOpenedOfferId, doesHeOwnIt }) {
  const { userData } = useContext(UserContext);
  const [forWho, changePerson] = useState(userData.id);
  const [showPurchase, changeVisibility] = useState([]);
  const [AllUsers, getAllUsers] = useState(null);
  const [forWhoButBetter, changeWho] = useState(true);
  const [allTrans, getTrans] = useState(null);

  const [allOffers, setTable] = useState(null);

  function showButton() {
    setOpenedOfferId(
      openedOfferId === offer.id ? null : offer.id
    );
  }

  function GetInContact() {
    let str1 = "";
    let str2 = "";
    if(offer.discord_tag != null){
      str1 = `\nTag discord: ${offer.discord_tag}\n`;
    }
    if(offer.phone != null){
      str2 = `\nNumer telefonu: ${offer.phone}\n`;
    }
    let popup = confirm(`Źródła komunikacji z sprzedawcą\n${str1}${str2}\nCzy będziesz negocjować o tą ofertę?`);
    if (popup == true) {
      let receiverId = userData.id;
      let receiverLogin = forWho;
      let hesAlreadyBuying = false;
      let hesBuyingFromHimself = false;
      AllUsers.forEach(user => {
        if(user.login == forWho){
          if(user.type == "normal"){
            console.log(user.login, " | ", user.type, " | ", user.id, " | ");
            receiverId = user.id;
          }
        }
      });
      
      if(receiverId == userData.id && userData.type == "seller"){
        hesBuyingFromHimself = true;
      }
      
      allTrans.forEach(tran => {
        if(tran.buyer_id == userData.id && tran.offer_id == offer.id){
          console.log(userData.id, " == ", tran.buyer_id);
          hesAlreadyBuying = true;
        }
      });

      if(hesAlreadyBuying == true){
        alert("Jesteś w trakcie negocjacji z tej ofercie");
      }
      if(hesBuyingFromHimself == true){
        alert("Nie możesz kupić kluczy od samego siebie");
      }

      console.log("Dane do trans\n", `${userData} | ${receiverId} | ${offer.id} | ${forWho}`);
      if (hesAlreadyBuying == false && hesBuyingFromHimself == false) {
        axios.post(`${axiosPath}/transactions/add`, {
          offerId: offer.id,
          buyerId: userData.id,
          receiverId: receiverId,
          status: 'Pending'
        }).then(() => {
          console.log("Chyba przeszło?");
          alert("Transakcja została dodana");
        }).catch((err) => {
          alert("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
          console.error(err);
        });
      }
    }
  }

  useEffect(() => {
    axios.get(`${axiosPath}/users`).then((res) => {
      getAllUsers(res.data);
      console.log("Dane userów\n", res.data);
    });
    axios.get(`${axiosPath}/transactions`).then((res) => {
      getTrans(res.data);
      console.log("Transakcje\n", res.data);
    })
    axios.get("http://localhost:3000/key_offers").then((res) => {setTable(res.data)})
    console.log(userData);
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
      {(doesHeOwnIt == false) ? (
        <div>
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
      ) : (
        <div>
          {offer != null && isVisible && (
            <div id={offer.id}>
              <div>
                <input list="allUsers" type="text" onChange={(e) => changePerson(e.target.value)} />
                  <datalist id="allUsers">
                    {AllUsers.map((user) => (
                      <option key={user.id} value={user.login}>{user.login}</option>
                    ))}
                  </datalist>
                <h5><button onClick={() => GetInContact()}>Zgiftuj</button></h5>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}