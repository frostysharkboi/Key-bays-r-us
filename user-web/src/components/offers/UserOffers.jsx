import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';

export default function UserOffers({ gameId }) {

  const [offersData, GetOffers] = useState(null);
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
        if (res.data) {
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
            <div key={offer.id} className="col-3">
              <h2>{offer.login}</h2>
              <p>
                <h5>{offer.other}</h5>
                <h5>Cena: {offer.suggested_price} zł.</h5>
                <h5>Status: {Array.isArray(offer.status) ? offer.status[0] : offer.status}</h5>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}