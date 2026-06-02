import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { axiosPath } from '../../App';
import { UserContext } from '../user-context/UserContext';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

export default function ReviewsSection({ gameId }) {
    const { userData } = useContext(UserContext);
    console.log("=== DEBUG ADMINA ===", userData);
    const [reviews, setReviews] = useState([]);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    // Sprawdzamy czy zalogowany użytkownik to administrator
    const isAdmin = userData.type === 'admin';
    const myReview = reviews.find(r => r.user_id === userData.id);

    const fetchReviews = () => {
        axios.get(`${axiosPath}/api/reviews`, { params: { gameId } })
            .then(res => setReviews(res.data))
            .catch(err => console.error("Błąd pobierania recenzji:", err));
    };

    useEffect(() => {
        if (!gameId) return;
        fetchReviews();

        // Szary użytkownik musi mieć sprawdzony zakup, admina to nie obchodzi
        if (userData.isLogged && userData.id && !isAdmin) {
            axios.get(`${axiosPath}/transactions/check-purchase`, { params: { userId: userData.id, gameId } })
                .then(res => setHasPurchased(res.data.hasPurchased))
                .catch(err => console.error("Błąd sprawdzania zakupu:", err));
        }
    }, [gameId, userData.id, userData.isLogged, isAdmin]);

    const handleCreateOrUpdate = (formData) => {
        if (myReview) {
            // AKTUALIZACJA: Wysyłamy body z game_id i user_id zamiast parametru w adresie URL
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
                .catch(err => console.error(err));
        } else {
            // DODAWANIE: Bez zmian, tabela ratings obsłuży to poprawnie
            axios.post(`${axiosPath}/api/reviews`, {
                game_id: Number(gameId),
                user_id: Number(userData.id),
                rating: formData.rating,
                other: formData.other
            })
                .then(() => fetchReviews())
                .catch(err => console.error("Błąd wysyłania Axios:", err));
        }
    };

    const handleDelete = (reviewTargetUserId) => {
        // Ponieważ przekazujemy id użytkownika, którego recenzję usuwamy (dla admina to będzie cudze id, dla nas nasze)
        const message = isAdmin && reviewTargetUserId !== userData.id
            ? "Czy jako Administrator chcesz usunąć recenzję tego użytkownika?"
            : "Czy na pewno chcesz usunąć swoją recenzję?";

        if (window.confirm(message)) {
            // USUWANIE: Wysyłamy parametry w query stringu (gameId i userId)
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
                .catch(err => console.error(err));
        }
    };

    return (
        <div className='box-idk row m-3 p-3 text-center border'>
            <p className='font fw-bold fs-4'>Szczegolowe Recenzje</p>
            <div className="p-2">

                {/* Warunek wejścia dla formularza: zalogowany i (kupił grę LUB jest adminem) */}
                {userData.isLogged && (hasPurchased || isAdmin) && (
                    <div className="mb-4">
                        {myReview && !editingReview ? (
                            <div className="alert alert-info text-start d-flex justify-content-between align-items-center border border-2 border-info">
                                <div>
                                    <h5 className="font fw-bold mb-1">Twoja obecna ocena:</h5>
                                    <span>Ocena: <strong>{myReview.rating}/5</strong> | Opis: {myReview.other}</span>
                                </div>
                                <div className="btn-group gap-2">
                                    <button className="btn btn-sm btn-primary" onClick={() => setEditingReview(myReview)}>Edytuj</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(myReview.user_id)}>Usun</button>
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
                                key={`${r.game_id}-${r.user_id}`} // bezpieczny unikalny klucz łączony
                                review={r}
                                currentUserId={userData.id}
                                isAdmin={isAdmin}
                                onEdit={(rev) => setEditingReview(rev)}
                                onDelete={handleDelete} // przekazuje r.user_id wewnątrz ReviewItem
                            />
                        ))
                    ) : (
                        <p className="text-muted font italic">Ta gra nie posiada jeszcze zadnych recenzji.</p>
                    )}
                </div>

            </div>
        </div>
    );
}