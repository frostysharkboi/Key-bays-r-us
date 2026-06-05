import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../user-context/UserContext";
import axios from 'axios';

export default function Header({ showAccountMenu = true, axiosPath }) {
    const navigate = useNavigate();
    const { userData, logout } = useContext(UserContext);
    const [searchThisTitle, changeTitle] = useState("");
    const [games, setGames] = useState([]);// Dane gier z bazy danych

    function redirectToSearching(genreId) {
        if (genreId == null) {
            navigate("/Search", { state: { Title: searchThisTitle } });
        } else {
            navigate("/Search", { state: { GenreId: genreId } });
        }
    }

    function logOutUser() {
        logout();
        navigate("/", { replace: true });
    }

    React.useEffect(() => {
        const outputTags = "";
        
        axios.get(`${axiosPath}/games/tagsort`, { 
            params: { tags: outputTags }
            })
        .then((res) => {
            setGames(res.data);
            })
        .catch(err => console.error("Błąd pobierania gier:", err));
    }, []);

    return (
        <div className="row m-3 p-3 text-center">
            {/* Wyszukiwarka */}
            <div className='col-4'>
                <input
                    type="text"
                    id="wyszukiwarka"
                    name="wyszukiwarka"
                    placeholder='szukaj...'
                    list="availableGames"
                    onChange={(e) => changeTitle(e.target.value)}
                />
                <datalist id="availableGames">
                    {games.map((game) => (
                        <option key={game.id} value={game.title}/>
                    ))}
                </datalist>
                <button className='border border-3 btnsrch' onClick={() => redirectToSearching(null)}>
                    SZUKAJ
                </button>
            </div>

            {/* Logo */}
            <div className='col-4 fw-bolder logo'>
                <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Keys &apos;R&apos; Us</h1>
            </div>

            {/* Menu konta - warunkowe renderowanie na podstawie propsa */}
            <div className='col-4'>
                {showAccountMenu && (
                    <div className="dropdown">
                        <button className="dropbtn font" id="nick">
                            {userData.isLogged ? userData.login : "Gosc"}
                        </button>
                        <div className="dropdown-content fw-bold">
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