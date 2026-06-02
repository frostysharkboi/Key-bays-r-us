import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';
import OfferItem from './OfferItem';

export default function SaleOffers({ gameId }) {
  const { userData, logout } = useContext(UserContext);

  const [offersData, GetOffers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openedOfferId, setOpenedOfferId] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    setError(false);

    console.log("Zaczyna pobierać dane. Id gry nie było puste.");

    axios.get(`${axiosPath}/key_offers/offersForGames`, { params: { id: gameId } })
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const isAdmin = userData && userData.type === 'admin';

          let validOffers = isAdmin ? res.data : res.data.filter((offer) => offer.status === 'Active' || offer.status === 'Other');

          if (userData && userData.id) {
            validOffers = validOffers.sort((a, b) => {
              const aIsMine = a.seller_id === userData.id ? 1 : 0;
              const bIsMine = b.seller_id === userData.id ? 1 : 0;
              return bIsMine - aIsMine;
            });
          }

          GetOffers(validOffers);
          console.log("Posortowane oferty (własne na początku):\n", validOffers);
        } else GetOffers([]);
        setLoading(false);
      })
  }, [gameId]);

  if (loading) {
    return (
      <div className='row m-3 p-3 text-center border border-3 offer'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Ładowanie ofert...</span>
      </div>
    );
  }

  if (error || !offersData || offersData.length === 0) {
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