import React, { createContext, useState, useEffect } from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';

export const DbStatusContext = createContext();

export function DbProvider({ children }) {
    const [isDbLoading, setIsDbLoading] = useState(true);
    const [dbError, setDbError] = useState(false);

    useEffect(() => {
        const connectToDatabase = async () => {
            try {
                // TUTAJ WSTAW SWOJE PRAWDZIWE ZAPYTANIE DO BAZY
                // np. await fetch('https://twoj-backend.pl/api/health-check')

                // Tymczasowa symulacja: 2.5 sekundy ładowania
                await new Promise((resolve) => setTimeout(resolve, 2500));

                setIsDbLoading(false);
            } catch (error) {
                console.error("Nie udało się połączyć z bazą danych:", error);
                setDbError(true);
                setIsDbLoading(false);
            }
        };

        connectToDatabase();
    }, []);

    // 1. GORĄCY EKRAN ŁADOWANIA (Wyświetla się dopóki baza się ładuje)
    if (isDbLoading) {
        return (
            <div
                className="position-fixed top-0 start-0 vw-100 vh-100 d-flex flex-column justify-content-center align-items-center bg-dark text-white"
                style={{ zIndex: 99999 }}
            >
                <Header showAccountMenu={false} />
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '4rem', height: '4rem' }}>
                    <span className="visually-hidden">Ładowanie...</span>
                </div>
                <h4 className="fw-light">Uruchamianie usług sieciowych...</h4>
                <p className="text-muted small">Trwa nawiązywanie połączenia z bazą danych</p>
                <Footer />
            </div>
        );
    }

    // 2. EKRAN BŁĘDU (Jeśli baza danych całkowicie padnie i fetch zwróci błąd)
    if (dbError) {
        return (
            <div className="container vh-100 d-flex flex-column justify-content-center align-items-center text-center">
                <Header showAccountMenu={false} />
                <div className="alert alert-danger p-5 shadow" style={{ maxWidth: '500px' }}>
                    <h3 className="alert-heading mb-3">Błąd połączenia</h3>
                    <p>Nie mogliśmy połączyć się z bazą danych serwisu <strong>KeysRUs</strong>.</p>
                    <hr />
                    <p className="mb-0 small text-muted">Spróbuj odświeżyć stronę za chwilę. Jeśli problem nadal występuje, skontaktuj się z administratorem.</p>
                    <button className="btn btn-outline-danger mt-4" onClick={() => window.location.reload()}>
                        Odśwież stronę
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    // 3. DOSTĘP DO APLIKACJI (Baza działa -> renderujemy resztę aplikacji)
    return (
        <DbStatusContext.Provider value={{ isDbLoading }}>
            {children}
        </DbStatusContext.Provider>
    );
}