import { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as React from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender
} from "@tanstack/react-table";
import { UserContext } from "../components/user-context/UserContext";
import { useNavigate } from 'react-router-dom';
import Header from "../components/header/Header";
import './root.css';
import { axiosPath } from "../App";
import Footer from '../components/footer/Footer';

export default function TransactionsPage() {
    const navigate = useNavigate();
    const { userData } = useContext(UserContext);

    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([{ id: 'suggested_price', desc: false }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });
    const [transactions, setTransactions] = useState([]);

    const [activeTransactionInput, setActiveTransactionInput] = useState(null);
    const [enteredKey, setEnteredKey] = useState("");

    const [statusFilters, setStatusFilters] = useState([
        { id: 'Pending', label: 'Oczekujące', isSelected: true },
        { id: 'Success', label: 'Zakończone', isSelected: false },
        { id: 'Cancelled', label: 'Anulowane', isSelected: false }
    ]);

    // Ochrona routingu - wyrzucenie niezalogowanych na stronę głowną
    useEffect(() => {
        if (userData && userData.isLogged === false) {
            console.warn("Niezalogowany użytkownik nie ma dostępu do transakcji. Przekierowanie...");
            navigate('/');
        }
    }, [userData, navigate]);

    // Wydzielona funkcja pobierania transakcji (wywoływana na start i po zatwierdzeniu klucza)
    const fetchTransactions = () => {
        if (!userData || !userData.isLogged || !userData.id) return;

        axios.get(`${axiosPath}/transactions/transactionsByBuyer`, { params: { id: userData.id } })
            .then((res) => {
                const rawData = Array.isArray(res.data) ? res.data : [];

                // Mapujemy tablicę, aby jawnie przekonwertować typy danych na liczbowe
                const formattedData = rawData.map(item => ({ ...item, suggested_price: parseFloat(item.suggested_price) || 0, transaction_id: parseInt(item.transaction_id, 10) || 0 }));

                setTransactions(formattedData);
            })
            .catch(err => {
                console.error("Błąd pobierania transakcji:", err);
            });
    };

    useEffect(() => {
        fetchTransactions();
    }, [userData]);

    // Obsługa wysyłki formularza z kluczem do backendu
    const handleConfirmSubmit = (transactionId) => {
        if (!enteredKey.trim()) {
            alert("Wpisz klucz gry przed zatwierdzeniem!");
            return;
        }

        axios.post(`${axiosPath}/transactions/confirm`, {
            transactionId,
            enteredKey: enteredKey.trim()
        })
            .then((res) => {
                if (res.data.success) {
                    alert(res.data.message);
                    setActiveTransactionInput(null); // Zamknij input
                    setEnteredKey(""); // Wyczyść wpisany tekst
                    fetchTransactions(); // Pobierz świeże statusy z bazy danych
                }
            })
            .catch((err) => {
                const errorMsg = err.response?.data?.error || "Wystąpił błąd podczas zatwierdzania.";
                alert(errorMsg);
            });
    };

    const anyStatusSelected = statusFilters.some(sf => sf.isSelected);

    // Definicja kolumn tabeli TanStack
    const columns = useMemo(() => [
        {
            header: "Tytul gry", accessorKey: "game_title",
            cell: (info) => info.getValue() || <span className="text-muted">Nieznany tytuł</span>
        },
        {
            header: "Sprzedawca", accessorKey: "seller_login",
            cell: (info) => info.getValue() || <span className="text-muted">Brak danych</span>
        },
        {
            header: "Cena", accessorKey: "suggested_price",
            cell: (info) => <span className="text-success fw-bold">{info.getValue()} zł</span>
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
            cell: (info) => {
                const transaction = info.row.original;
                const id = transaction.transaction_id;
                const status = String(transaction.transaction_status || 'Pending').trim();

                if (status !== 'Pending') return <span className="text-muted">-</span>;

                const isInputActive = activeTransactionInput === id;

                if (isInputActive) {
                    return (
                        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="password"
                                className="form-control form-control-sm rounded-0"
                                placeholder="Klucz gry..."
                                value={enteredKey}
                                onChange={(e) => setEnteredKey(e.target.value)}
                                // BLOKADA: Zabezpieczenie przed wpychaniem zapisanych haseł przez przeglądarkę
                                autoComplete="new-password"
                                style={{ width: "130px" }}
                            />
                            <button
                                className="btn btn-primary btn-sm rounded-0 fw-bold"
                                onClick={() => handleConfirmSubmit(id)}
                            >
                                OK
                            </button>
                            <button
                                className="btn btn-secondary btn-sm rounded-0 text-white"
                                onClick={() => {
                                    setActiveTransactionInput(null);
                                    setEnteredKey("");
                                }}
                            >
                                X
                            </button>
                        </div>
                    );
                }

                return (
                    <button
                        className="btn btn-success btn-sm fw-bold rounded-0 border border-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEnteredKey("");
                            setActiveTransactionInput(id);
                        }}
                    >
                        Zatwierdź
                    </button>
                );
            }
        }
    ], [activeTransactionInput, enteredKey]);

    // Wyciąganie tablicy aktywnych statusow z checkboxow
    const selectedStatuses = useMemo(() => {
        return statusFilters.filter(sf => sf.isSelected).map(sf => sf.id);
    }, [statusFilters]);

    // Przekazanie filtrow do pamięci tabeli
    const columnFilters = useMemo(() => {
        return selectedStatuses.length > 0
            ? [{ id: 'transaction_status', value: selectedStatuses }]
            : [];
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
            <Header axiosPath={axiosPath}/>

            <h3 className='mx-4 mt-4 p-4 font'>Twoje Zamowienia i Transakcje</h3>
            <div className="row px-4 pb-4">

                {/* Lewy panel filtrow bocznych */}
                <div className="col-12 col-lg-4 custom-border border-dark">
                    <h3 className='mx-4 mt-4 p-3 text-center font'>Filtry transakcji:</h3>
                    <div className="addpanel box-idk">

                        {/* Filtr wyszukiwania tekstowego */}
                        <div className="addpaneldiv row p-2 pe-4">
                            <h2 className='font'>Szukaj (Gra / Sprzedawca)</h2>
                            <input
                                className='col p-2 inp-srch'
                                type="text"
                                value={globalFilter ?? ""}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder='Wpisz frazę...'
                            />
                        </div>

                        {/* Filtry checkboxow (statusy) */}
                        <div className='addpaneldiv col p-2 pe-4'>
                            <h2 className='font'>Statusy</h2>
                            {statusFilters.map((sf) => (
                                <div className='row' key={sf.id}>
                                    <input
                                        className='btn-check col'
                                        type="checkbox"
                                        name={`Stat_${sf.id}`}
                                        id={`Stat_${sf.id}`}
                                        checked={sf.isSelected}
                                        onChange={(e) => {
                                            setStatusFilters(prev => prev.map(
                                                item => item.id === sf.id ? { ...item, isSelected: e.target.checked } : item
                                            ));
                                        }}
                                    />
                                    <label
                                        htmlFor={`Stat_${sf.id}`}
                                        className={`p-2 m-1 btn-kirk border border-6 ${sf.isSelected || !anyStatusSelected ? "btn-zaz" : "btn-odz"}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {sf.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Prawa strona: Tabela */}
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
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="align-middle">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4 text-muted">
                                        Brak transakcji spełniających kryteria.
                                    </td>
                                </tr>
                            )}

                            {emptyRowCount > 0 && Array.from({ length: emptyRowCount }).map((_, idx) => (
                                <tr key={`empty-${idx}`} className="empty-row">
                                    <td colSpan={columns.length} style={{ height: "48px", opacity: 0 }}></td>
                                </tr>
                            ))}

                            {/* Panel nawigacji stronami (Paginacja) */}
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