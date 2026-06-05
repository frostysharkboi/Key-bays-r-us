import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App'; // Dopasuj ścieżkę do App importu jeśli trzeba

export default function WishlistButton({ gameId, userId, isLogged }) {
  const [isOnWishlist, setIsOnWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sprawdzanie stanu w bazie przy montowaniu komponentu
  useEffect(() => {
    if (isLogged && userId && gameId) {
      axios.get(`${axiosPath}/wishlist`, { params: { user_id: userId } })
        .then((res) => {
          // Sprawdzamy czy ID aktualnej gry znajduje się w tablicy z backendu
          const ids = res.data.map(id => Number(id));
          setIsOnWishlist(ids.includes(Number(gameId)));
        })
        .catch(err => console.error("Błąd ładowania wishlisty:", err));
    }
  }, [gameId, userId, isLogged]);

  const handleToggle = () => {
    if (!isLogged) {
      alert("Musisz się zalogować, aby zarządzać listą życzeń!");
      return;
    }

    setLoading(true);

    if (isOnWishlist) {
      // Usuwanie (korzysta z Twojego dedykowanego endpointu w query)
      axios.delete(`${axiosPath}/wishlist/remove`, { params: { user_id: userId, game_id: gameId } })
        .then(() => {
          setIsOnWishlist(false);
        })
        .catch(err => {
          console.error(err);
          alert("Nie udało się usunąć z wishlisty");
        })
        .finally(() => setLoading(false));
    } else {
      // Dodawanie (korzysta z Twojego generycznego app.post("/:table"))
      axios.post(`${axiosPath}/wishlist`, { user_id: userId, game_id: gameId })
        .then(() => {
          setIsOnWishlist(true);
        })
        .catch(err => {
          console.error(err);
          alert("Nie udało się dodać do wishlisty");
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <button
      className={`btn border border-3 w-100 fw-bold transition-all ${isOnWishlist ? 'btn-danger border-danger' : 'btn-success border-success'
        }`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "PRZETWARZANIE..." : isOnWishlist ? "USUŃ Z WISHLISTY" : "DODAJ DO WISHLISTY"}
    </button>
  );
}