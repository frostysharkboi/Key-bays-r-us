import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importujemy hook do nawigacji

export default function ReviewItem({ review, currentUserId, isAdmin, onEdit, onDelete }) {
    const navigate = useNavigate(); // Inicjalizacja nawigacji

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    const isOwnReview = review.user_id === currentUserId;

    // Funkcja przekierowująca do profilu autora recenzji
    const handleUserClick = (e, userId) => {
        e.stopPropagation(); // Zatrzymuje bąbelkowanie eventu
        if (!userId) {
            alert("Nie znaleziono identyfikatora użytkownika.");
            return;
        }
        navigate(`/User/${userId}`, { replace: true, state: { uId: userId } });
    };

    return (
        <div className="p-3 mb-2 border noRound text-start review" onClick={(e) => handleUserClick(e, review.user_id)}>
            <div className="d-flex justify-content-between align-items-center pb-2 mb-2">
                <div>
                    <span className="fs-5 fw-bold rating text-decoration-underline" style={{ cursor: 'pointer' }}>
                        @{review.login || "Użytkownik"}
                    </span>
                    <span className="ms-3 rating fw-bold fs-5">{renderStars(review.rating)}</span>
                    <span className="ms-2 fw-bold">({review.rating}/5)</span>
                </div>

                {/* Przyciski akcji */}
                <div className="btn-group gap-2">
                    {/* Edycja i usuwanie własnej recenzji */}
                    {isOwnReview && (
                        <>
                            <button className="border border-6 noRound fw-bold" onClick={() => onEdit(review)}>Edytuj</button>
                            <button className="border border-6 noRound fw-bold" onClick={() => onDelete(review.user_id)}>Usuń</button>
                        </>
                    )}

                    {/* Moderacja administratorska dla cudzych recenzji */}
                    {!isOwnReview && isAdmin && (
                        <button className="border border-6 noRound fw-bold" onClick={() => onDelete(review.user_id)}>
                            Usuń (Admin)
                        </button>
                    )}
                </div>
            </div>
            <p className="mb-0 fw-bold" style={{ whiteSpace: 'pre-line' }}>{review.other}</p>
        </div>
    );
}