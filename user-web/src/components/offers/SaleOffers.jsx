import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';
import OfferItem from './OfferItem';

export default function SaleOffers({ gameId }) {
  const { userData, logout } = useContext(UserContext);

  const [offersData, GetOffers] = useState(null);
  const [offersBtnTemp, changeBtn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    setError(false);

    console.log("Zaczyna pobierać dane. Id gry nie było puste.");
    // Zapytanie do naszego lokalnego backendu proxy
    axios.get(`${axiosPath}/key_offers/offersForGames`, { params: { id: gameId } })
      .then((res) => {
        if (res.data && res.data[0].id != null) {
          GetOffers(res.data);
          console.log("Dane zostały pobrane\n", res.data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania danych ofert", err);
        setError(true);
        setLoading(false);
      });
  }, [gameId]);

  useEffect(() => {
    if (offersData != null) {
      const newButtons = offersData.map(offer => ({
        offerId: offer.id,
        isVisible: false
      }));

      changeBtn(newButtons);
      console.log(offersBtnTemp);
    }
  }, [offersData]);

  if (loading) {
    return (
      <div className='row m-3 p-3 text-center border border-3 offer'>
        <p className='font fw-bold'>Oferty sklepu</p>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Ładowanie ofert...</span>
      </div>
    );
  }

  if (error || !offersData) {
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}