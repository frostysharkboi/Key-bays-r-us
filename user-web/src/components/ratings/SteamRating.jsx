import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';

export default function SteamRating({ gameId }) {
  const [steamData, setSteamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    setError(false);

    // Zapytanie do naszego lokalnego backendu proxy
    axios.get(`${axiosPath}/api/steam-rating`, { params: { appid: gameId } })
      .then((res) => {
        if (res.data && res.data.success) {
          setSteamData(res.data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania oceny Steam Live:", err);
        setError(true);
        setLoading(false);
      });
  }, [gameId]);

  // Renderowanie gwiazdek na podstawie oceny 0-5
  const renderStars = (val) => {
    const rounded = Math.round(Number(val));
    const safeStars = Math.max(0, Math.min(5, rounded));
    return "★".repeat(safeStars).padEnd(5, "☆");
  };

  if (loading) {
    return (
      <div className="rating-box mb-2">
        <small className="d-block fw-bold font" style={{ fontSize: '0.7rem' }}>Ocena Steam</small>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Ładowanie live...</span>
      </div>
    );
  }

  if (error || !steamData) {
    return (
      <div className="rating-box mb-2">
        <small className="d-block fw-bold font" style={{ fontSize: '0.7rem' }}>Ocena Steam</small>
        <span className="text-danger" style={{ fontSize: '0.85rem' }}>brak danych</span>
      </div>
    );
  }

  return (
    <div className="rating-box mb-2">
      <small className="d-block fw-bold font" style={{ fontSize: '0.7rem' }}>
        Ocena Steam (Live)
      </small>
      <div className="d-flex align-items-center justify-content-center gap-2" title={`Opis: ${steamData.review_score_desc}`}>
        <span className="rating fs-4">
          {renderStars(steamData.score)}
        </span>
        <span className="fw-bold fs-5">
          {steamData.score}
        </span>
      </div>
      <small className=" d-block" style={{ fontSize: '0.75rem', marginTop: '-4px' }}>
        {steamData.percent}% pozytywnych opinii
      </small>
    </div>
  );
}