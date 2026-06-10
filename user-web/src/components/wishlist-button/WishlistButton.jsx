import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App'; // Dopasuj ścieżkę do App importu jeśli trzeba

export default function WishlistButton({ gameId, userId, isLogged }) {
  const [isOnWishlist, setIsOnWishlist] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sprawdzanie stanu w bazie przy montowaniu komponentu
  useEffect(() => {
    if (isLogged && userId && gameId) {
      setLoading(true);
      const checkPurchase = axios.get(`${axiosPath}/transactions/byId`, { params: { userId: userId, gameId: gameId } });
      const checkWishlist = axios.get(`${axiosPath}/wishlist`, { params: { user_id: userId } });
      Promise.all([checkPurchase, checkWishlist])
        .then(([purchaseRes, wishlistRes]) => {
          if (purchaseRes.data && purchaseRes.data.length > 0) setIsPurchased(true);
          const ids = wishlistRes.data.map(id => Number(id));
          setIsOnWishlist(ids.includes(Number(gameId)));
        })
        .catch(err => console.error("Błąd pobierania danych transakcji/wishlisty:", err)).finally(() => setLoading(false));
    }
  }, [gameId, userId, isLogged]);

  const handleToggle = () => {
    if (!isLogged) {
      alert("Musisz się zalogować, aby zarządzać listą życzeń!");
      return;
    }

    setLoading(true);

    if (isOnWishlist) {
      // Usuwanie
      axios.delete(`${axiosPath}/wishlist/remove`, { params: { user_id: userId, game_id: gameId } }).then(() => { setIsOnWishlist(false); })
        .catch(err => {
          console.error(err);
          alert("Nie udało się usunąć z wishlisty");
        }).finally(() => setLoading(false));
    } else {
      // Dodawanie
      axios.post(`${axiosPath}/wishlist`, { user_id: userId, game_id: gameId }).then(() => { setIsOnWishlist(true); })
        .catch(err => {
          console.error(err);
          alert("Nie udało się dodać do wishlisty");
        }).finally(() => setLoading(false));
    }
  };

  if (isPurchased) {
    return null;
  }

  return (
    <button
<<<<<<< Updated upstream
      className={`btn border border-3 w-100 fw-bold transition-all ${isOnWishlist ? 'btn-danger border-danger' : 'btn-success border-success'}`}
=======
      className={`border w-100 fw-bold transition-all ${isOnWishlist ? 'noWishlistBtn' : 'WishlistBtn'}`}
>>>>>>> Stashed changes
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "PRZETWARZANIE..." : isOnWishlist ? "USUŃ Z WISHLISTY" : "DODAJ DO WISHLISTY"}
    </button>
  );
}