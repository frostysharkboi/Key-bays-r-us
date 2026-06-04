import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

export default function ReviewsSection({ gameId }) {
    const { userData } = useContext(UserContext);

    const [reviews, setReviews] = useState([]);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    // 1. Zabezpieczenie na wypadek, gdy userData jest null (użytkownik niezalogowany)
    const isAdmin = userData?.type === 'admin';
    const myReview = reviews.find(r => r.user_id === userData?.id);

    // Funkcja pobierająca recenzje dla danej gry
    const fetchReviews = () => {
        axios.get(`${axiosPath}/api/reviews`, { params: { gameId: Number(gameId) } })
            .then(res => setReviews(res.data))
            .catch(err => console.error("Błąd pobierania recenzji:", err));
    };

    useEffect(() => {
        if (!gameId) return;

        // 2. RESET STANÓW: Zapobiega sytuacji, w której uprawnienia z poprzednio oglądanej gry
        // zostają przypisane do nowo otwartej gry przed zakończeniem strzału do bazy.
        setHasPurchased(false);
        setEditingReview(null);

        fetchReviews();

        // 3. BEZPIECZNE SPRAWDZANIE ZAKUPU: Wymuszamy rzutowanie na typ Number na wypadek,
        // gdyby React próbował wysłać do bazy stringi lub wartości tekstowe typu "null"/"undefined".
        if (userData?.isLogged && userData?.id && !isAdmin) {
            axios.get(`${axiosPath}/api/transactions/check-purchase`, { params: { userId: Number(userData.id), gameId: Number(gameId) } })
                .then(res => {
                    setHasPurchased(res.data.hasPurchased);
                })
                .catch(err => {
                    console.error("Błąd sprawdzania zakupu:", err);
                    setHasPurchased(false); // W razie błędu sieci bezpiecznie blokujemy formularz
                });
        }
    }, [gameId, userData?.id, userData?.isLogged, isAdmin]);

    // Funkcja obsługująca dodawanie oraz edycję recenzji
    const handleCreateOrUpdate = (formData) => {
        if (!userData?.id) return;

        if (myReview) {
            // AKTUALIZACJA: Wysyłamy body z poprawnym typem liczbowym
            axios.put(`${axiosPath}/api/reviews`, {
                game_id: Number(gameId),
                user_id: Number(userData.id),
                rating: formData.rating,
                other: formData.other
            })
                .then(() => {
                    fetchReviews();
                    setEditingReview(null);
                })
                .catch(err => console.error("Błąd podczas aktualizacji recenzji:", err));
        } else {
            // DODAWANIE: Wysyłamy body z poprawnym typem liczbowym
            axios.post(`${axiosPath}/api/reviews`, {
                game_id: Number(gameId),
                user_id: Number(userData.id),
                rating: formData.rating,
                other: formData.other
            })
                .then(() => fetchReviews())
                .catch(err => console.error("Błąd podczas dodawania recenzji:", err));
        }
    };

    // Funkcja obsługująca usuwanie recenzji (własnej lub cudzej przez Admina)
    const handleDelete = (reviewTargetUserId) => {
        if (!userData?.id) return;

        const message = isAdmin && reviewTargetUserId !== userData.id
            ? "Czy jako Administrator chcesz usunąć recenzję tego użytkownika?"
            : "Czy na pewno chcesz usunąć swoją recenzję?";

        if (window.confirm(message)) {
            axios.delete(`${axiosPath}/api/reviews`, {
                params: {
                    gameId: Number(gameId),
                    userId: Number(reviewTargetUserId)
                }
            })
                .then(() => {
                    fetchReviews();
                    if (editingReview?.user_id === reviewTargetUserId) setEditingReview(null);
                })
                .catch(err => console.error("Błąd podczas usuwania recenzji:", err));
        }
    };

    return (
        <div className='box-idk row m-3 p-3 text-center border'>
            <p className='font fw-bold fs-4'>Szczegółowe Recenzje</p>
            <div className="p-2">

                {/* Warunek wejścia: zalogowany i (kupił grę LUB jest adminem) */}
                {userData?.isLogged && (hasPurchased || isAdmin) && (
                    <div className="mb-4">
                        {myReview && !editingReview ? (
                            <div className="alert alert-info text-start d-flex justify-content-between align-items-center border border-2 border-info">
                                <div>
                                    <h5 className="font fw-bold mb-1">Twoja obecna ocena:</h5>
                                    <span>Ocena: <strong>{myReview.rating}/5</strong> | Opis: {myReview.other}</span>
                                </div>
                                <div className="btn-group gap-2">
                                    <button className="btn btn-sm btn-primary" onClick={() => setEditingReview(myReview)}>Edytuj</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(myReview.user_id)}>Usuń</button>
                                </div>
                            </div>
                        ) : (
                            <ReviewForm
                                onSubmit={handleCreateOrUpdate}
                                initialReview={editingReview}
                                onCancel={() => setEditingReview(null)}
                            />
                        )}
                    </div>
                )}

                {/* Lista wszystkich recenzji */}
                <div className="d-flex flex-column gap-2 mt-2">
                    {reviews.length > 0 ? (
                        reviews.map(r => (
                            <ReviewItem
                                key={`${r.game_id}-${r.user_id}`}
                                review={r}
                                currentUserId={userData?.id}
                                isAdmin={isAdmin}
                                onEdit={(rev) => setEditingReview(rev)}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <p className="text-muted font italic">Ta gra nie posiada jeszcze żadnych recenzji.</p>
                    )}
                </div>

            </div>
        </div>
    );
}