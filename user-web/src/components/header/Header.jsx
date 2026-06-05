import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../user-context/UserContext";
import axios from 'axios';
import { useDebounce } from '../../hooks/UseDebounce';

export default function Header({ showAccountMenu = true, axiosPath }) {
    const navigate = useNavigate();
    const { userData, logout } = useContext(UserContext);

    const [searchThisTitle, changeTitle] = useState("");
    const debouncedSearchTitle = useDebounce(searchThisTitle, 400);

    const [games, setGames] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    function redirectToSearching(forcedTitle) {
        setIsDropdownOpen(false);
        const finalTitle = forcedTitle !== null ? forcedTitle : searchThisTitle;
        navigate("/Search", { state: { Title: finalTitle } });
    }

    function logOutUser() {
        logout();
        navigate("/", { replace: true });
    }

    // Przywracamy Twój oryginalny, działający useEffect, który pobiera gry na starcie
    useEffect(() => {
        const outputTags = "";
        axios.get(`${axiosPath}/games/tagsort`, { params: { tags: outputTags } })
            .then((res) => {
                setGames(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => console.error("Błąd pobierania gier:", err));
    }, [axiosPath]);

    // Zamykanie podglądu po kliknięciu poza obszar wyszukiwarki
    useEffect(() => {
        function handleClickOutside(event) { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false); }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrowanie i ograniczanie do 10 pozycji na podstawie stabilnej, opóźnionej frazy
    const displayedGames = React.useMemo(() => {
        if (!debouncedSearchTitle.trim()) return [];
        return games
            .filter(game => game.title && game.title.toLowerCase().includes(debouncedSearchTitle.toLowerCase()))
            .slice(0, 5); // Ograniczenie do maksymalnie 5 pozycji
    }, [debouncedSearchTitle, games]);

    return (
        <div className="row m-3 p-3 text-center align-items-center">
            {/* Wyszukiwarka */}
            <div className='col-4 text-center' ref={dropdownRef}>

                {/* Ten kontener dopasowuje się idealnie do naturalnego rozmiaru Twojego inputa i przycisku */}
                <div className="position-relative d-inline-block">
                    <div className="d-flex">
                        <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...' autoComplete="off"
                            value={searchThisTitle}
                            onChange={(e) => {
                                changeTitle(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                        /* Twój oryginalny input - bez żadnych klas form-control */
                        />
                        <button className='border border-3 btnsrch ms-2' onClick={() => redirectToSearching(null)}>
                            SZUKAJ
                        </button>
                    </div>

                    {/* Panel podglądu - dzięki d-inline-block powyżej, w-100 rozciągnie go IDEALNIE na szerokość (input + button + margines) */}
                    {isDropdownOpen && displayedGames.length > 0 && (
                        <div
                            className="position-absolute bg-white border border-secondary text-start mt-1 w-100 shadow-lg custom-search-dropdown"
                            style={{ zIndex: 999, maxHeight: '400px', overflowY: 'auto', borderRadius: '4px', left: 0, right: 0 }}
                        >
                            {displayedGames.map((game) => (
                                <div key={game.id} className="d-flex bg-dark align-items-center p-2 border-bottom search-item" style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        changeTitle(game.title);
                                        redirectToSearching(game.title);
                                    }}
                                >
                                    {game.cover_img ? (<img src={game.cover_img} alt={game.title} style={{ width: '35px', height: '45px', objectFit: 'cover', marginRight: '12px', borderRadius: '2px' }} />
                                    ) : (
                                        <div style={{ width: '35px', height: '45px', backgroundColor: '#e0e0e0', marginRight: '12px', borderRadius: '2px' }} />
                                    )}
                                    <span className="fw-bold text-danger">{game.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Logo */}
            <div className='col-4 fw-bolder logo'>
                <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Keys &apos;R&apos; Us</h1>
            </div>

            {/* Menu konta */}
            <div className='col-4'>
                {showAccountMenu && (
                    <div className="dropdown">
                        <button className="dropbtn font" id="nick">
                            {userData.isLogged ? userData.login : "Gosc"}
                        </button>
                        <div className="dropdown-content fw-bold" style={{ zIndex: 999 }}>
                            {!userData.isLogged ? (
                                <h5 onClick={() => navigate("/Login", { replace: true })}>Zaloguj się</h5>
                            ) : (
                                <>
                                    <h5 onClick={() => navigate("/Edit-Account")}>Konto</h5>
                                    <h5 onClick={() => navigate("/Wishlist")}>Lista Życzeń</h5>
                                    {userData.type != "normal" ? <h5 onClick={() => navigate("/Offers")}>Oferty Sprzedaży</h5> : ""}
                                    <h5 onClick={() => navigate("/Transactions")}>Aktualne Transakcje</h5>
                                    <h5 onClick={logOutUser}>Wyloguj się</h5>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}