import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';
import OfferItem from './OfferItem';

export default function SaleOffers({ gameId, DoesHeOwnIt }) {
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
          if (res.data[0].id != null) {
            console.log("Dane zostały pobrane z serwera:\n", res.data);

            let filteredOffers = res.data;

            if (userData?.type === 'normal') {
              filteredOffers = filteredOffers.filter(offer => {
                const currentStatus = offer.status ? offer.status.toString().trim().toLowerCase() : '';
                return currentStatus !== 'closed';
              });
              console.log("Dane po filtracji dla Normal:", filteredOffers);

            } else if (userData?.type === 'seller') {
              filteredOffers = filteredOffers.filter(offer => {
                const currentStatus = offer.status ? offer.status.toString().trim().toLowerCase() : '';
                const isOwnOffer = String(offer.seller_id) === String(userData.id);
                return currentStatus !== 'closed' || isOwnOffer;
              });
              console.log("Dane po filtracji dla Seller:", filteredOffers);
            }
            setOffersData(filteredOffers);

          } else {
            setError(true);
          }
        } else {
          setOffersData([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania ofert dla gry:", err);
        setError(true);
        setLoading(false);
      });
  }, [gameId, userData]);

  // Widok ładowania
  if (loading) {
    return (
      <div className='row m-3 p-3 text-center'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Ładowanie ofert...</span>
      </div>
    );
  }

  // Widok błędu lub braku ofert
  if (error || offersData.length === 0) {
    return (
      <div className='row m-3 p-3 text-center'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <span className="offer font" style={{ fontSize: '0.85rem' }}>brak ofert</span>
      </div>
    );
  }

  // Widok poprawnie wyrenderowanych ofert
  return (
    <div className='row m-3 p-3 text-center offer'>
      <p className='font fw-bold'>Oferty sklepu</p>
      <div className="container-fluid">
        <div className="row flex-row flex-nowrap overflow-auto">
          {offersData.map((offer) => (
            <OfferItem key={offer.id} offer={offer} gameId={gameId} openedOfferId={openedOfferId} setOpenedOfferId={setOpenedOfferId} doesHeOwnIt={DoesHeOwnIt}/>
          ))}
        </div>
      </div>
    </div>
  );
}