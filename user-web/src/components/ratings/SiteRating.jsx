import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';

export default function SiteRating({ gameId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!gameId) return;
    
    axios.get(`${axiosPath}/ratings`)
      .then((res) => {
        setReviews(res.data);
      })
      .catch((err) => {
        console.error("Błąd podczas pobierania ocen serwisu:", err);
      });
  }, [gameId]);

  // Filtrowanie i obliczanie średniej dla konkretnej gry
  const filteredReviews = reviews.filter(r => r.game_id == gameId);
  const count = filteredReviews.length;
  const average = count > 0 
    ? (filteredReviews.reduce((acc, curr) => acc + Number(curr.rating), 0) / count).toFixed(1) 
    : null;

  // Funkcja generująca gwiazdki (zaokrąglona do pełnych liczb dla wizualizacji)
  const renderStars = (val) => {
    const rounded = Math.round(Number(val));
    return "★".repeat(rounded).padEnd(5, "☆");
  };

  return (
    <div className="rating-box mb-2">
      <small className="d-block font" style={{ fontSize: '0.7rem' }}>
        Ocena Serwisu
      </small>
      <div className="d-flex align-items-center justify-content-center gap-2">
        <span className="rating fs-4">
          {average ? renderStars(average) : "☆☆☆☆☆"}
        </span>
        <span className="fw-bold fs-5">
          {average ? `${average}` : "0.0"}
        </span>
      </div>
      <small className=" d-block" style={{ fontSize: '0.75rem', marginTop: '-4px' }}>
        {count} opinii
      </small>
    </div>
  );
}