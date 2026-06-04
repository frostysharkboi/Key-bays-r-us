import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';
import OfferItem from './OfferItem';

export default function SaleOffers({ gameId }) {
  const { userData } = useContext(UserContext);

  const [offersData, setOffersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openedOfferId, setOpenedOfferId] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    setError(false);
    console.log("=== URUCHOMIENIE POBIERANIA DANYCH ===");

    axios.get(`${axiosPath}/key_offers/offersForGames`, { params: { id: gameId } })
      .then((res) => {
        console.log("1. Dane dotarły z backendu:", res.data);

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const isAdmin = userData && userData.type === 'admin';
          console.log("2. Czy zalogowany użytkownik to admin?", isAdmin);

          // Filtrowanie z uwzględnieniem, że status może być tablicą (np. ['Active'])
          let filtered = isAdmin ? res.data : res.data.filter((offer) => {
            const currentStatus = Array.isArray(offer.status) ? offer.status[0] : String(offer.status);
            return currentStatus.trim() === 'Active' || currentStatus.trim() === 'Other';
          });

          console.log("3. Dane po przefiltrowaniu:", filtered);

          // Sortowanie (własne oferty na początku)
          if (userData && userData.id) {
            filtered = [...filtered].sort((a, b) => {
              const aIsMine = a.seller_id === userData.id ? 1 : 0;
              const bIsMine = b.seller_id === userData.id ? 1 : 0;
              return bIsMine - aIsMine;
            });
          }

          console.log("4. Finalne dane zapisywane do stanu:", filtered);
          setOffersData(filtered);
        } else {
          console.log("1. Backend zwrócił pustą tablicę lub błędny format.");
          setOffersData([]);
        }

        // Wyłączamy ładowanie dopiero, gdy cała logika (pobranie + filtry) się zakończyła
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania ofert dla gry:", err);
        setError(true);
        setLoading(false);
      });

    // Reagujemy zarówno na zmianę oglądanej gry, jak i na zalogowanie/wczytanie profilu użytkownika
  }, [gameId, userData]);

  // Widok ładowania
  if (loading) {
    return (
      <div className='row m-3 p-3 text-center border border-3 offer'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Ładowanie ofert...</span>
      </div>
    );
  }

  // Widok błędu lub braku ofert
  if (error || offersData.length === 0) {
    return (
      <div className='row m-3 p-3 text-center border border-3 offer'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <span className="text-danger" style={{ fontSize: '0.85rem' }}>brak ofert</span>
      </div>
    );
  }

  // Widok poprawnie wyrenderowanych ofert
  return (
    <div className='row m-3 p-3 text-center border border-3 offer'>
      <p className='font fw-bold'>Oferty sklepu</p>
      <div className="container-fluid">
        <div className="row flex-row flex-nowrap overflow-auto">
          {offersData.map((offer) => (
            <OfferItem
              key={offer.id}
              offer={offer}
              userData={userData}
              gameId={gameId}
              openedOfferId={openedOfferId}
              setOpenedOfferId={setOpenedOfferId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}