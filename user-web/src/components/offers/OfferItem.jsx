import React, { useState } from 'react';

export default function OfferItem({ offer, userData, gameId, openedOfferId, setOpenedOfferId }) {
    const isAdmin = userData && userData.type === 'admin';
    const [forWho, setForWho] = useState(userData ? userData.login : '');
    const isVisible = openedOfferId === offer.id;

    if (!isAdmin && offer.status !== 'Active' && offer.status !== 'Other') {
        return null;
    }

    const showButton = () => {
        if (isVisible) {
            setOpenedOfferId(null);
        } else {
            setOpenedOfferId(offer.id);
        }
    };

    const changePerson = (value) => {
        setForWho(value);
    };

    const GetInContact = () => {
        if (!userData) {
            alert("Musisz być zalogowany, aby dokonać zakupu!");
            return;
        }

        const targetName = forWho === 'Other' ? "kogoś innego" : "Ciebie";
        let popup = confirm(`Chcesz kupić grę z oferty sprzedawcy ${offer.login} dla ${targetName}?\nCena: ${offer.suggested_price} zł.`);

        if (popup) {
            console.log("Inicjalizacja transakcji dla oferty o ID:", offer.id);
        }
    };

    return (
        <div className="col-3 border p-3 m-2 bg-light rounded shadow-sm" style={{ minWidth: '250px' }}>
            <h2>{offer.login}</h2>
            <div className="my-2">
                <h5 className="text-secondary">{offer.other || 'Brak opisu'}</h5>
                <h5>Cena: <span className="text-success fw-bold">{offer.suggested_price} zł.</span></h5>

                <h5>
                    Status:{' '}
                    <span className={offer.status === 'Active' ? 'text-primary' : 'text-danger'}>
                        {offer.status}
                    </span>
                </h5>
            </div>

            <button className="btn btn-outline-primary btn-sm w-100" onClick={showButton}>
                {isVisible ? 'Mniej' : 'Wiecej'}
            </button>

            {offer != null && isVisible && (
                <div id={`offer-details-${offer.id}`} className="mt-3 p-2 border-top text-start">
                    <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>Przeznaczenie klucza:</label>
                    <select
                        className="form-select form-select-sm mb-2"
                        onChange={(e) => changePerson(e.target.value)}
                        value={forWho === userData?.login ? userData?.login : 'Other'}
                    >
                        {userData && <option value={userData.login}>Dla mnie</option>}
                        <option value="Other">Dla kogoś innego</option>
                    </select>

                    {forWho !== userData?.login && (
                        <div className="mt-2">
                            <input
                                type="text"
                                className="form-control form-control-sm mb-2"
                                placeholder="Wpisz login lub email obdarowywanego"
                                onChange={(e) => changePerson(e.target.value)}
                            />
                            <button className="btn btn-warning btn-sm w-100" onClick={GetInContact}>
                                Zgiftuj
                            </button>
                        </div>
                    )}

                    {forWho === userData?.login && (
                        <div className="mt-2">
                            <button className="btn btn-success btn-sm w-100" onClick={GetInContact}>
                                Kup teraz
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}