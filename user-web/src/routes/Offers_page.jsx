import { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { UserContext } from "../components/user-context/UserContext";
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "../components/header/Header";
import './root.css';
import { axiosPath } from "../App";
import Footer from '../components/footer/Footer';

export default function OffersPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userData } = useContext(UserContext);

    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        if (!userData || userData.type === 'user') {
            console.warn("Wykryto próbę nieautoryzowanego dostępu. Przekierowanie...");
            navigate('/'); // Przekierowanie na stronę główną
        }
    }, [userData, navigate]);

    // Inicjalizacja filtra początkowego (jeśli nawigujemy z wyszukiwarki)
    useEffect(() => {
        if (location.state?.Title) {
            setGlobalFilter(location.state.Title);
        }
    }, [location.state]);

    // Pobranie ofert z backendu
    useEffect(() => {
        // Jeśli userData jeszcze się ładuje lub rola jest niepoprawna, przerywamy strzał
        if (!userData || userData.type === 'user') return;

        axios.get(`${axiosPath}/key_offers/allOffers`, { params: { userId: userData.id, userRole: userData.type } })
            .then((res) => {
                console.log("Oferty załadowane dla roli:", userData.type, res.data);
                setOffers(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Błąd pobierania dedykowanych ofert:", err);
                if (err.response?.status === 403) {
                    navigate('/');
                }
            });
    }, [userData, axiosPath, navigate]);

    const handleStatusChange = (offerId, newStatus) => {
        // 1. Szukamy oferty w obecnym stanie, żeby wiedzieć, jaki miała status PRZED zmianą
        const currentOffer = offers.find(o => o.id === offerId);
        const oldStatus = currentOffer ? currentOffer.status : 'Active';

        // 2. BLOKADA DLA SPRZEDAWCY: Jeśli sprzedawca próbuje ustawić 'Closed', wyrzucamy alert i cofamy zmianę
        if (userData?.role === 'seller' && newStatus === 'Closed') {
            alert("Jako sprzedawca nie masz uprawnień do ręcznego ustawiania statusu 'Closed'.");

            // Wymuszamy ponowne ustawienie starego statusu w stanie (reset wizualny selektu)
            setOffers(prevOffers => [...prevOffers]);
            return;
        }

        // 3. ALERT DLA ADMINISTRATORA: Jeśli status zmienia się na 'Closed', pytamy o potwierdzenie
        if (newStatus === 'Closed') {
            const isConfirmed = window.confirm(
                `Czy na pewno chcesz zmienić status oferty ID: ${offerId} na "Closed"?\nTej operacji nie można cofnąć.`
            );

            // Jeśli kliknął "Anuluj" (false)
            if (!isConfirmed) {
                console.log("Zmiana statusu na Closed anulowana przez użytkownika.");

                // Odświeżamy stan tą samą referencją, co zmusi Reacta do powrotu do poprzedniego statusu w <select>
                setOffers(prevOffers => [...prevOffers]);
                return; // Przerywamy funkcję, Axios się nie wykona
            }
        }

        // 4. Jeśli przeszło walidacje i potwierdzenia -> wysyłamy standardowy strzał do bazy
        axios.patch(`${axiosPath}/key_offers/updateStatus`, {
            offerId: offerId,
            newStatus: newStatus
        })
            .then(() => {
                console.log(`Status oferty ${offerId} pomyślnie zmieniony na ${newStatus}`);

                // Aktualizujemy stan nową wartością
                setOffers(prevOffers =>
                    prevOffers.map(offer =>
                        offer.id === offerId ? { ...offer, status: newStatus } : offer
                    )
                );
            })
            .catch(err => {
                console.error("Błąd zmiany statusu:", err);
                alert("Nie udało się zapisać zmiany w bazie danych.");
                // W razie błędu sieciowego również cofamy zmianę wizualną
                setOffers(prevOffers => [...prevOffers]);
            });
    };

    const columns = useMemo(() => [
        { header: "Tytuł gry", accessorKey: "title", cell: (info) => info.getValue() || <span className="text-muted">Brak tytułu</span> },
        { header: "Sprzedawca", accessorKey: "seller", cell: (info) => info.getValue() || `User ID: ${info.row.original.seller_id}` },
        { header: "Proponowana Cena", accessorKey: "suggested_price", cell: (info) => <span className="text-success fw-bold">{info.getValue()} zł</span> },
        {
            header: "Status",
            accessorKey: "status",
            cell: (info) => {
                let currentStatus = info.getValue();
                if (Array.isArray(currentStatus)) currentStatus = currentStatus[0];
                if (typeof currentStatus === 'object' && currentStatus !== null) currentStatus = currentStatus.value || currentStatus.toString();

                // 3. Zabezpieczenie zanim się załaduje
                if (!currentStatus) currentStatus = 'Active';

                const offerId = info.row.original.id;

                return (
                    <select className={`form-select form-select-sm fw-bold ${currentStatus === 'Active' ? 'text-primary' : currentStatus === 'Closed' ? 'text-danger' : 'text-secondary'}`}
                        value={currentStatus} onClick={(e) => e.stopPropagation()} onChange={(e) => handleStatusChange(offerId, e.target.value)}
                        style={{ width: "130px", cursor: "pointer" }} disabled={userData.type === 'seller' ? (currentStatus === "Closed" ? true : false) : false}
                    >
                        <option value="Active">Active</option>
                        <option value="Closed" disabled={userData.type === 'seller'}>Closed</option>
                        <option value="Other">Other</option>
                    </select>
                );
            }
        }
    ], [offers]);

    const table = useReactTable({
        data: offers,
        columns,
        state: { sorting, globalFilter, pagination },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    const rows = table.getRowModel().rows;
    const emptyRowCount = pagination.pageSize - rows.length;

    function RedirectToGamePage(gameId) {
        if (!gameId) return;
        navigate('/Game', { state: { GameId: gameId } });
    }

    return (
        <div className="container-fluid">
            <Header />

            <h3 className='mx-4 mt-4 p-4 font'>Baza Wystawionych Ofert</h3>
            <div className="row px-4 pb-4">
                <div className="col-12 col-lg-4 custom-border border-dark">
                    <h3 className='mx-4 mt-4 p-3 text-center font'>Filtruj oferty:</h3>
                    <div className="addpanel box-idk">
                        <div className="addpaneldiv row p-2 pe-4">
                            <h2 className='font'>Szukaj (Tytuł / Sprzedawca)</h2>
                            <input
                                className='col p-2 inp-srch'
                                type="text"
                                value={globalFilter ?? ""}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder='Wpisz frazę...'
                            />
                        </div>
                    </div>
                </div>

                <div className="col">
                    <table className='table border border-3 table-sm table-striped table-hover ms-3'>
                        <thead>
                            {table.getHeaderGroups().map(hg => (
                                <tr className='table-part-top border border-3' key={hg.id}>
                                    {hg.headers.map(header => (
                                        <th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                                        >
                                            {header.column.getIsSorted() === "desc" ? "↑ " : (header.column.getIsSorted() === "asc" ? "↓ " : "")}
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() === "desc" ? " ↑" : (header.column.getIsSorted() === "asc" ? " ↓" : "")}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        onClick={() => RedirectToGamePage(parseInt(row.original.game_id))}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4 text-muted">
                                        Brak dostępnych ofert do wyświetlenia.
                                    </td>
                                </tr>
                            )}

                            {emptyRowCount > 0 && Array.from({ length: emptyRowCount }).map((_, idx) => (
                                <tr key={`empty-${idx}`} className="empty-row">
                                    <td colSpan={columns.length} style={{ height: "48px", opacity: 0 }}></td>
                                </tr>
                            ))}

                            <tr>
                                <td colSpan={columns.length}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}> First </button>
                                        <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}> Previous </button>
                                        <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}</span>
                                        <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
                                        <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>Last</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <Footer />
        </div>
    );
}