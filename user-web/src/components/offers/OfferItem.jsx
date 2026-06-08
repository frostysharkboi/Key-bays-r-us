import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';
import { useDebounce } from '../../hooks/UseDebounce';

export default function OfferItem({ offer, gameId, openedOfferId, setOpenedOfferId, doesHeOwnIt }) {
  const { userData } = useContext(UserContext);

  const [reciever, setReciever] = useState(userData?.login || "");
  const debouncedReciever = useDebounce(reciever, 400);

  const [users, setUsers] = useState([]);
  const [loggedInIsReciever, setLoggedInIsReciever] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (loggedInIsReciever) {
      setReciever(userData?.login || "");
    } else {
      setReciever("");
    }
  }, [loggedInIsReciever, userData]);

  function showButton() {
    setOpenedOfferId(
      openedOfferId === offer.id ? null : offer.id
    );
  }

  function GetInContact() {
    let str1 = "";
    let str2 = "";
    if (offer.discord_tag != null) {
      str1 = `\nTag discord: ${offer.discord_tag}\n`;
    }
    if (offer.phone != null) {
      str2 = `\nNumer telefonu: ${offer.phone}\n`;
    }

    let popup = confirm(`Źródła komunikacji z sprzedawcą\n${str1}${str2}\nCzy będziesz negocjować o tę ofertę?`);
    if (popup === true) {
      let receiverId = userData.id;

      let receiverLogin = debouncedReciever;

      let hesAlreadyBuying = false;
      let hesBuyingFromHimself = false;

      if (users && users.length > 0) {
        users.forEach(user => {
          if (user.login === receiverLogin) {
            receiverId = user.id;
          }
        });
      }

      if (receiverId === userData.id && userData.type === "seller") {
        hesBuyingFromHimself = true;
      }

      if (transactions && transactions.length > 0) {
        transactions.forEach(tran => {
          if (tran.buyer_id === userData.id && tran.offer_id === offer.id) {
            hesAlreadyBuying = true;
          }
        });
      }

      if (hesAlreadyBuying === true) {
        alert("Jesteś w trakcie negocjacji w tej ofercie");
        return;
      }
      if (hesBuyingFromHimself === true) {
        alert("Nie możesz kupić kluczy od samego siebie");
        return;
      }

      console.log("Dane do transakcji:\n", `${userData.login} | Odbiorca ID: ${receiverId} | Oferta: ${offer.id} | Login odbiorcy: ${receiverLogin}`);

      axios.post(`${axiosPath}/transactions/add`, {
        offerId: offer.id,
        buyerId: userData.id,
        receiverId: receiverId,
        status: 'Pending'
      }).then(() => {
        alert("Transakcja została dodana");
      }).catch((err) => {
        alert("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
        console.error(err);
      });
    }
  }

  useEffect(() => {
    axios.get(`${axiosPath}/users`)
      .then((res) => setUsers(res.data || []))
      .catch(err => console.error(err));

    axios.get(`${axiosPath}/transactions`)
      .then((res) => setTransactions(res.data || []))
      .catch(err => console.error(err));
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
      <button onClick={() => showButton()}>Więcej</button>

      {doesHeOwnIt === false ? (
        <div className='my-2'>
          {offer != null && isVisible && (
            <div id={offer.id}>
              <select value={loggedInIsReciever} onChange={(e) => setLoggedInIsReciever(e.target.value === 'true')}>
                <option value={true}>Dla mnie</option>
                <option value={false}>Dla kogoś innego</option>
              </select>

              {loggedInIsReciever === false && (
                <div>
                  <input
                    list={`users-list-${offer.id}`}
                    type="text"
                    placeholder="Wpisz login..."
                    value={reciever}
                    onChange={(e) => setReciever(e.target.value)}
                  />
                  <datalist id={`users-list-${offer.id}`}>
                    {users.map((user) => (
                      <option key={user.id} value={user.login}>{user.login}</option>
                    ))}
                  </datalist>
                  <h5><button className='mt-2' onClick={() => GetInContact()}>Zgiftuj</button></h5>
                </div>
              )}

              {loggedInIsReciever === true && (
                <div>
                  <h5><button className='mt-2' onClick={() => GetInContact()}>Kup</button></h5>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className='my-2'>
          {offer != null && isVisible && (
            <div id={offer.id}>
              <div>
                <input
                  list={`users-list-own-${offer.id}`}
                  type="text"
                  placeholder="Wpisz login..."
                  onChange={(e) => setReciever(e.target.value)}
                />
                <datalist id={`users-list-own-${offer.id}`}>
                  {users.map((user) => (
                    <option key={user.id} value={user.login}>{user.login}</option>
                  ))}
                </datalist>
                <h5><button className='mt-2' onClick={() => GetInContact()}>Zgiftuj</button></h5>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}