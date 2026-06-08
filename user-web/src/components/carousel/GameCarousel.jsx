import React, { useState } from 'react';

export default function GameCarousel({
    title,
    games = [],
    showArrows = true,
    onGameClick,
    titleColorClass = "headline"
}) {
    const [startIndex, setStartIndex] = useState(0);
    const itemsPerPage = 5;

    // Jeśli nie ma gier, nie renderujemy nic
    if (!games || games.length === 0) return null;

    // Logika obsługi strzałek
    const handlePrev = () => {
        setStartIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setStartIndex((prev) => Math.min(games.length - itemsPerPage, prev + 1));
    };

    // Sprawdzamy czy strzałki są w ogóle potrzebne
    const canGoPrev = startIndex > 0;
    const canGoNext = startIndex + itemsPerPage < games.length;
    const displayArrows = showArrows && games.length > itemsPerPage;

    // Gry, które aktualnie powinny wyświetlać się na ekranie
    const visibleGames = games.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="row mx-4 my-5 p-4 box-idk text-start position-relative">
            {title && (
                <h3 className={`font mb-4 border-bottom border-secondary pb-2 text-uppercase ${titleColorClass}`}>
                    {title}
                </h3>
            )}

            <div className="d-flex align-items-center position-relative px-2">

                {/* LEWA STRZAŁKA */}
                {displayArrows && (
                    <button
                        className="btn btnCarousel noRound border border-3 position-absolute start-0 h-50 d-flex align-items-center justify-content-center"
                        style={{ zIndex: 10, opacity: canGoPrev ? 1 : 0, width: '40px', transform: 'translateX(-15px)' }}
                        onClick={handlePrev}
                        disabled={!canGoPrev}
                    >
                        ‹
                    </button>
                )}

                {/* SIATKA ELEMENTÓW */}
                <div className="row g-3 w-100 m-0 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 flex-grow-1 justify-content-start transition-all">
                    {visibleGames.map((game) => (
                        <div key={game.id} className="col">
                            <div className="card h-100 border border-3 rounded-0 overflow-hidden shadow custom-game-card" onClick={() => onGameClick && onGameClick(game.id)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                                <div className="w-100 position-relative overflow-hidden bg-secondary" style={{ aspectRatio: '7/4', display: 'block' }}>
                                    <img src={game.cover_img} alt={game.title} className="w-100 h-100" style={{ objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                                <div className="card-body cardText p-2 border-3 border-top text-center">
                                    <p className="card-text text-truncate font fw-bold m-0 small">
                                        {game.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PRAWA STRZAŁKA */}
                {displayArrows && (
                    <button
                        className="btn btnCarousel noRound border border-3 position-absolute end-0 h-50 d-flex align-items-center justify-content-center"
                        style={{ zIndex: 10, opacity: canGoNext ? 1 : 0, width: '40px', transform: 'translateX(15px)' }}
                        onClick={handleNext}
                        disabled={!canGoNext}
                    >
                        ›
                    </button>
                )}

            </div>
        </div>
    );
}