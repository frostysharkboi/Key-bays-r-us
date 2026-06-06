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

  React.useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    setError(false);
    console.log("=== URUCHOMIENIE POBIERANIA DANYCH ===");

    axios.get(`${axiosPath}/key_offers/offersForGames`, { params: { id: gameId } })
      .then((res) => {
        if (res.data != null && res.data.length > 0) {
          if (res.data && res.data[0].id != null) {
            setOffersData(res.data);
            console.log("Dane zostały pobrane\n", res.data);
            if (userData.type == 'normal') {
              setOffersData(offersData.filter(offer => offer.status != 'Closed'));
            }
            if (userData.type == 'seller') {
              setOffersData(offersData.filter(offer => offer.status != 'Closed' || offer.seller_id == userData.id));
            }
          } else {
            setError(true);
          }
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
            <OfferItem key={offer.id} offer={offer} gameId={gameId} openedOfferId={openedOfferId} setOpenedOfferId={setOpenedOfferId} />
          ))}
        </div>
      </div>
    </div>
  );
}