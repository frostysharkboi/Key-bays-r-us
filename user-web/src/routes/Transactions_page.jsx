import { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { UserContext } from "../components/user-context/UserContext";
import { useNavigate } from 'react-router-dom';
import Header from "../components/header/Header";
import './root.css';
import { axiosPath } from "../App";
import Footer from '../components/footer/Footer';

function TransactionActionCell({ transaction, activeTransactionInput, setActiveTransactionInput, onConfirm, viewMode }) {
    const id = transaction.transaction_id;
    const status = String(transaction.transaction_status || 'Pending').trim();
    const [localKey, setLocalKey] = useState("");

    if (status !== 'Pending' || viewMode !== 'buyer') return <span className="text-muted">-</span>;

    const isInputActive = activeTransactionInput === id;

    if (isInputActive) {
        return (
            <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                <input type="password" className="form-control form-control-sm rounded-0" placeholder="Klucz gry..." value={localKey} onChange={(e) => setLocalKey(e.target.value)} autoComplete="new-password" style={{ width: "130px" }} autoFocus />
                <button className="btn btn-primary btn-sm rounded-0 fw-bold" onClick={() => { onConfirm(id, localKey); setLocalKey(""); }}>
                    OK
                </button>
                <button className="btn btn-secondary btn-sm rounded-0 text-white" onClick={() => { setActiveTransactionInput(null); setLocalKey(""); }}>
                    X
                </button>
            </div>
        );
    }

    return (
        <button className="btn btn-success btn-sm fw-bold rounded-0 border border-2" onClick={(e) => { e.stopPropagation(); setActiveTransactionInput(id); }}>
            Zatwierdz
        </button>
    );
}

export default function TransactionsPage() {
    const navigate = useNavigate();
    const { userData } = useContext(UserContext);

    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([{ id: 'suggested_price', desc: false }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });
    const [transactions, setTransactions] = useState([]);
    const [activeTransactionInput, setActiveTransactionInput] = useState(null);
    const [viewMode, setViewMode] = useState('buyer');

    const [statusFilters, setStatusFilters] = useState([
        { id: 'Pending', label: 'Oczekujace', isSelected: true },
        { id: 'Success', label: 'Zakończone', isSelected: false },
        { id: 'Cancelled', label: 'Anulowane', isSelected: false }
    ]);

    useEffect(() => {
        if (userData && userData.isLogged === false) {
            console.warn("Niezalogowany uzytkownik nie ma dostepu do transakcji. Przekierowanie...");
            navigate('/');
        }
    }, [userData, navigate]);

    const fetchTransactions = () => {
        if (!userData || !userData.isLogged || !userData.id) {
            console.warn("===[DIAGNOSTYKA AXIOS]=== Przerwano fetch: brak userData lub uzytkownik niezalogowany.");
            return;
        }

        axios.get(`${axiosPath}/transactions/transactionsByType`, { params: { type: viewMode, id: userData.id } })
            .then((res) => {
                let rawData = [];

                if (Array.isArray(res.data)) {
                    rawData = res.data;
                } else if (res.data && Array.isArray(res.data.rows)) {
                    rawData = res.data.rows;
                } else if (res.data && typeof res.data === 'object' && res.data.transaction_id) {
                    // NOWOŚĆ: Jeśli serwer zwrócił pojedynczy obiekt transakcji, pakujemy go w tablicę jednoelementową!
                    console.log("Wykryto pojedynczy obiekt transakcji. Pakuję go w tablicę.");
                    rawData = [res.data];
                }
                console.log(rawData);

                const formattedData = rawData.map(item => ({
                    ...item,
                    suggested_price: parseFloat(item.suggested_price) || 0,
                    transaction_id: parseInt(item.transaction_id, 10) || 0,
                    game_id: parseInt(item.game_id, 10) || null,
                    seller_id: parseInt(item.seller_id, 10) || null,
                    buyer_id: parseInt(item.buyer_id, 10) || null,
                    reciever_id: parseInt(item.reciever_id, 10) || null,
                    transaction_status: String(item.transaction_status || 'Pending').trim()
                }));

                setTransactions(formattedData);
            })
    };

    useEffect(() => {
        fetchTransactions();
        setActiveTransactionInput(null);
    }, [userData, viewMode]);

    const handleConfirmSubmit = (transaction_id, keyToSend) => {
        if (!keyToSend.trim()) {
            alert("Wpisz klucz gry przed zatwierdzeniem!");
            return;
        }

        axios.post(`${axiosPath}/transactions/confirm`, { transaction_id, entered_key: keyToSend.trim() })
            .then((res) => {
                if (res.data.success) {
                    alert(res.data.message);
                    setActiveTransactionInput(null);
                    fetchTransactions();
                }
            })
            .catch((err) => {
                const errorMsg = err.response?.data?.error || "Wystapil blad podczas zatwierdzania.";
                alert(errorMsg);
            });
    };

    const RedirectToGamePage = (gameId) => {
        if (!gameId) {
            alert("Nie znaleziono identyfikatora gry dla tej transakcji.");
            return;
        }
        navigate(`/Game/${gameId}`, { state: { GameId: gameId } });
    };

    // Pomocnicza funkcja przekierowania do użytkownika
    const RedirectToUserPage = (e, userId) => {
        e.stopPropagation(); // Zatrzymuje event, by nie kliknąć całego wiersza (strony gry)
        if (!userId) {
            alert("Nie znaleziono identyfikatora użytkownika.");
            return;
        }
        navigate(`/User/${userId}`, { replace: true, state: { uId: userId } });
    };

    const anyStatusSelected = statusFilters.some(sf => sf.isSelected);

    const columns = useMemo(() => {
        const baseColumns = [
            {
                header: "Tytul gry", accessorKey: "game_title",
                cell: (info) => info.getValue() || <span className="text-muted">Nieznany tytul</span>
            }
        ];

        // Definicje komórek użytkowników z podpiętą funkcją nawigacji i klasą CSS stylującą kursor
        const sellerColumn = {
            header: "Sprzedawca", accessorKey: "seller_login",
            cell: (info) => info.getValue() || <span className="text-muted">Brak danych</span>
        };

        const buyerColumn = {
            header: "Kupujacy", accessorKey: "buyer_login",
            cell: (info) => info.getValue() || <span className="text-muted">Brak danych</span>
        };

        const receiverColumn = {
            header: "Otrzymujacy", accessorKey: "reciever_login",
            cell: (info) => info.getValue() || <span className="text-muted">Brak danych</span>
        };

        if (viewMode === 'buyer') {
            baseColumns.push(sellerColumn, receiverColumn);
        } else if (viewMode === 'reciever') {
            baseColumns.push(sellerColumn, buyerColumn);
        } else if (viewMode === 'seller') {
            baseColumns.push(buyerColumn);
        } else if (viewMode === 'admin') {
            baseColumns.push(
                {
                    header: "Sprzedawca", accessorKey: "seller_login",
                    cell: (info) => {
                        const login = info.getValue();
                        return login ? <span className="text-primary text-decoration-underline" style={{ cursor: 'pointer' }} onClick={(e) => RedirectToUserPage(e, info.row.original.seller_id)}>{login}</span> : <span className="text-muted">-</span>;
                    }
                },
                {
                    header: "Kupujacy", accessorKey: "buyer_login",
                    cell: (info) => {
                        const login = info.getValue();
                        return login ? <span className="text-primary text-decoration-underline" style={{ cursor: 'pointer' }} onClick={(e) => RedirectToUserPage(e, info.row.original.buyer_id)}>{login}</span> : <span className="text-muted">-</span>;
                    }
                },
                {
                    header: "Otrzymujacy", accessorKey: "reciever_login",
                    cell: (info) => {
                        const login = info.getValue();
                        return login ? <span className="text-primary text-decoration-underline" style={{ cursor: 'pointer' }} onClick={(e) => RedirectToUserPage(e, info.row.original.reciever_id)}>{login}</span> : <span className="text-muted">-</span>;
                    }
                }
            );
        }

        baseColumns.push(
            {
                header: "Cena", accessorKey: "suggested_price",
                cell: (info) => <span className="text-success fw-bold">{info.getValue()} zl</span>
            },
            {
                header: "Status", accessorKey: "transaction_status",
                sortingFn: (rowA, rowB, columnId) => {
                    const statusA = String(rowA.getValue(columnId) || 'Pending').trim();
                    const statusB = String(rowB.getValue(columnId) || 'Pending').trim();
                    const statusOrder = { 'Pending': 1, 'Success': 2, 'Cancelled': 3 };
                    return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99);
                },
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue || filterValue.length === 0) return true;
                    const rowStatus = String(row.getValue(columnId) || '').trim();
                    return filterValue.includes(rowStatus);
                },
                cell: (info) => {
                    const status = String(info.getValue() || 'Pending').trim();
                    let badgeClass = "badge bg-secondary";
                    if (status === 'Success') badgeClass = "badge bg-success";
                    if (status === 'Pending') badgeClass = "badge bg-warning text-dark";
                    if (status === 'Cancelled') badgeClass = "badge bg-danger";
                    return <span className={`${badgeClass} p-2 fw-bold`}>{status}</span>;
                }
            },
            {
                header: "Akcja", id: "actions", enableGlobalFilter: false,
                cell: (info) => (
                    <TransactionActionCell
                        transaction={info.row.original}
                        activeTransactionInput={activeTransactionInput}
                        setActiveTransactionInput={setActiveTransactionInput}
                        onConfirm={handleConfirmSubmit}
                        viewMode={viewMode}
                    />
                )
            }
        );

        return baseColumns;
    }, [activeTransactionInput, viewMode]);

    const selectedStatuses = useMemo(() => {
        return statusFilters.filter(sf => sf.isSelected).map(sf => sf.id);
    }, [statusFilters]);

    const columnFilters = useMemo(() => {
        return selectedStatuses.length > 0 ? [{ id: 'transaction_status', value: selectedStatuses }] : [];
    }, [selectedStatuses]);

    const table = useReactTable({
        data: transactions,
        columns,
        state: { sorting, globalFilter, pagination, columnFilters },
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

    return (
        <div className="container-fluid">
            <Header />

            <h3 className='mx-4 mt-4 p-4 font'>
                {viewMode === 'buyer' && "Gry Zamowione"}
                {viewMode === 'reciever' && "Gry Otrzymane"}
                {viewMode === 'seller' && "Gry Sprzedawane"}
                {viewMode === 'admin' && "Panel Administratora: Transakcje"}
            </h3>

            <div className="row px-4 pb-4">
                <div className="col-12 col-lg-4 custom-border border-dark">
                    <h3 className='mx-4 mt-4 p-3 text-center font'>Filtry transakcji:</h3>
                    <div className="addpanel box-idk">

                        <div className="addpaneldiv row p-2 pe-4">
                            <h2 className='font'>Szukaj (Gra / Uzytkownik)</h2>
                            <input
                                className='col p-2 inp-srch'
                                type="text"
                                value={globalFilter ?? ""}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder='Wpisz fraze...'
                            />
                        </div>

                        <div className='addpaneldiv col p-2 pe-4 border-bottom border-secondary pb-3 mb-3'>
                            <h2 className='font mb-2'>Widok</h2>
                            <div className="d-flex flex-column gap-2">
                                <button
                                    className={`btn rounded-0 text-start border ${viewMode === 'buyer' ? 'btn-primary fw-bold' : 'btn-dark'}`}
                                    onClick={() => setViewMode('buyer')}
                                >
                                    Zamowione
                                </button>
                                <button
                                    className={`btn rounded-0 text-start border ${viewMode === 'reciever' ? 'btn-primary fw-bold' : 'btn-dark'}`}
                                    onClick={() => setViewMode('reciever')}
                                >
                                    Otrzymane
                                </button>
                                {(userData && userData.type !== 'normal') && (
                                    <button
                                        className={`btn rounded-0 text-start border ${viewMode === 'seller' ? 'btn-primary fw-bold' : 'btn-dark'}`}
                                        onClick={() => setViewMode('seller')}
                                    >
                                        Sprzedaz
                                    </button>
                                )}
                                {(userData && userData.type === 'admin') && (
                                    <button
                                        className={`btn rounded-0 text-start border ${viewMode === 'admin' ? 'btn-danger fw-bold' : 'btn-dark'}`}
                                        onClick={() => setViewMode('admin')}
                                    >
                                        Wszystkie (Admin)
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className='addpaneldiv col p-2 pe-4'>
                            <h2 className='font'>Statusy</h2>
                            {statusFilters.map((sf) => (
                                <div className='row' key={sf.id}>
                                    <input className='btn-check col' type="checkbox" name={`Stat_${sf.id}`} id={`Stat_${sf.id}`} checked={sf.isSelected} onChange={(e) => { setStatusFilters(prev => prev.map(item => item.id === sf.id ? { ...item, isSelected: e.target.checked } : item)); }} />
                                    <label htmlFor={`Stat_${sf.id}`} className={`p-2 m-1 btn-kirk border border-6 ${sf.isSelected || !anyStatusSelected ? "btn-zaz" : "btn-odz"}`} style={{ cursor: 'pointer' }} >
                                        {sf.label}
                                    </label>
                                </div>
                            ))}
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
                                    <tr key={row.id} onClick={() => RedirectToGamePage(row.original.game_id)} style={{ cursor: 'pointer' }}>
                                        {row.getVisibleCells().map((cell) => {
                                            // 1. Sprawdzamy ID kolumny, aby przypisać odpowiednie zachowanie i ID użytkownika
                                            const columnId = cell.column.id;
                                            const transactionData = row.original;

                                            let cellClickHander = null;
                                            let hasCustomClick = false;

                                            if (columnId === 'seller_login') {
                                                cellClickHander = (e) => RedirectToUserPage(e, transactionData.seller_id);
                                                hasCustomClick = true;
                                            } else if (columnId === 'buyer_login') {
                                                cellClickHander = (e) => RedirectToUserPage(e, transactionData.buyer_id);
                                                hasCustomClick = true;
                                            } else if (columnId === 'reciever_login') {
                                                cellClickHander = (e) => RedirectToUserPage(e, transactionData.reciever_id);
                                                hasCustomClick = true;
                                            } else if (columnId === 'actions') {
                                                // Blokujemy kliknięcie wiersza (grę) przy interakcji z przyciskami akcji/inputem
                                                cellClickHander = (e) => e.stopPropagation();
                                                hasCustomClick = true;
                                            }

                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={`align-middle ${hasCustomClick && columnId !== 'actions' ? 'text-primary text-decoration-underline' : ''}`}
                                                    style={{ cursor: hasCustomClick ? 'pointer' : 'inherit' }}
                                                    onClick={cellClickHander}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4 text-muted">
                                        Brak transakcji spelniajacych kryteria w wybranym widoku.
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
        </div >
    );
}