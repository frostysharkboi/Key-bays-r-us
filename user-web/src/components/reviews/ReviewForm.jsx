import React, { useState, useEffect } from 'react';

export default function ReviewForm({ onSubmit, initialReview, onCancel }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0); // Dodatkowy stan dla efektu najechania myszką
    const [other, setOther] = useState("");

    useEffect(() => {
        if (initialReview) {
            setRating(initialReview.rating);
            setOther(initialReview.other);
        } else {
            setRating(5);
            setOther("");
        }
    }, [initialReview]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!other.trim()) return alert("Wpisz treść recenzji!");
        onSubmit({ rating, other });
        if (!initialReview) setOther("");
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 border border-3 mb-4 text-start">
            <h4 className="font text-center">{initialReview ? "Edytuj swoją recenzje" : "Napisz recenzje gry"}</h4>

            {/* SEKCJA KLIKALNYCH GWIAZDEK */}
            <div className="mb-3 text-center">
                <label className="form-label d-block fw-bold font mb-1">Twoja Ocena:</label>
                <div className="star-rating d-inline-flex flex-row-reverse justify-content-center">
                    {[5, 4, 3, 2, 1].map((num) => {
                        // Gwiazdka powinna być pełna, jeśli jej numer jest mniejszy/równy wybranej ocenie LUB aktualnie najechanej myszką
                        const isFilled = hoverRating ? num <= hoverRating : num <= rating;

                        return (
                            <React.Fragment key={num}>
                                <input
                                    type="radio"
                                    id={`star-${num}`}
                                    name="rating"
                                    value={num}
                                    checked={rating === num}
                                    onChange={() => setRating(num)}
                                    className="d-none" // Ukrywamy domyślne kropki radio
                                />
                                <label
                                    htmlFor={`star-${num}`}
                                    className={`star-label fs-2 ${isFilled ? 'text-warning' : 'text-muted'}`}
                                    style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                                    onMouseEnter={() => setHoverRating(num)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    ★
                                </label>
                            </React.Fragment>
                        );
                    })}
                </div>
                <div className="text-muted small font">Kliknij gwiazdke, aby wybrac ({rating}/5)</div>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold font">Tresc opinii:</label>
                <textarea
                    className="form-control border border-2 border-dark font"
                    rows="3"
                    placeholder="Co sadzisz o tej produkcji?..."
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                />
            </div>
            <div className="d-flex gap-2 justify-content-end">
                {initialReview && (
                    <button type="button" className="btn btn-secondary font" onClick={onCancel}>Anuluj</button>
                )}
                <button type="submit" className="btn btn-success font fw-bold">
                    {initialReview ? "Zapisz zmiany" : "Wyslij recenzje"}
                </button>
            </div>
        </form>
    );
}