import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import './root.css';
import { axiosPath } from "../App";
import { UserContext } from '../components/user-context/UserContext';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';

// --- DEFINICJE KOLUMN (Zachowujemy prostotę i czyste dane, zachowanie celi definiujemy w tbody) ---
const transactionColumns = [
  { header: "Sprzedawca", accessorKey: "login", id: "seller_login" },
  { header: "Gra", accessorKey: "title", id: "game_title" },
  { header: "Opis", accessorKey: "other", id: "description" },
  { header: "Odbiorca", accessorKey: "receiver_login", id: "reciever_login" },
  {
    header: "Status",
    accessorKey: "status",
    id: "status",
    cell: (info) => (
      <span className={`badge ${info.getValue() === 'Success' ? 'bg-success' : 'bg-warning'}`}>
        {info.getValue()}
      </span>
    )
  }
];

const reviewColumns = [
  {
    header: "Ocena",
    accessorKey: "rating",
    id: "rating",
    cell: (info) => <strong>{info.getValue()}/5</strong>
  },
  { header: "Gra", accessorKey: "title", id: "game_title_rev" },
  { header: "Opis", accessorKey: "other", id: "description_rev" }
];

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = location.state?.uId || null;

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserTrans, setSelectedUserTrans] = useState([]);
  const [selectedUserReviews, setSelectedUserReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Stan dla filtra wyszukiwania tekstowego
  const [globalFilter, setGlobalFilter] = useState("");
  // Stały limit wierszy na stronę
  const PAGE_SIZE = 10;

  const { userData } = useContext(UserContext);

  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);

    axios.get(`${axiosPath}/users`)
      .then((res) => {
        const usersList = res.data;
        const foundUser = usersList.find(u => u.id == currentUserId);

        if (foundUser) {
          setSelectedUser(foundUser);
          return Promise.all([
            axios.get(`${axiosPath}/transactions/getByUser`, { params: { id: foundUser.id } }),
            axios.get(`${axiosPath}/ratings/getByUser`, { params: { id: foundUser.id } })
          ]);
        } else {
          console.error("Nie znaleziono użytkownika o podanym ID");
        }
      })
      .then((responses) => {
        if (responses) {
          const [transRes, ratingsRes] = responses;
          setSelectedUserTrans(transRes.data || []);
          setSelectedUserReviews(ratingsRes.data || []);
        }
      })
      .catch((err) => console.error("Błąd ładowania profilu:", err))
      .finally(() => setLoading(false));

  }, [currentUserId]);

  const handleUserClick = (userId) => {
    if (!userId) return;
    navigate(`/User/${userId}`, { replace: true, state: { uId: userId } });
  };

  const redirectToGamePage = (gameId) => {
    if (!gameId) return;
    navigate(`/Game/${gameId}`, { state: { GameId: gameId } });
  };

  const toggleView = () => {
    setShowReviews(prev => !prev);
    setGlobalFilter(""); // Czyszczenie szukajki przy zmianie karty
  };

  // --- INICJALIZACJA STRUKTURY TANSTACK DLA TRANSAKCJI ---
  const transTable = useReactTable({
    data: selectedUserTrans,
    columns: transactionColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } }
  });

  // --- INICJALIZACJA STRUKTURY TANSTACK DLA RECENZJI ---
  const reviewsTable = useReactTable({
    data: selectedUserReviews,
    columns: reviewColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } }
  });

  // Pobieramy przetworzone wiersze dla aktualnego widoku
  const activeTable = showReviews ? reviewsTable : transTable;
  const activeRows = activeTable.getRowModel().rows;
  const activeColumnsLength = showReviews ? reviewColumns.length : transactionColumns.length;

  // Logika dopełniania pustych rekordów (Padding)
  const emptyRowsCount = PAGE_SIZE - activeRows.length;

  if (loading) {
    return (
      <div className="container-fluid">
        <Header axiosPath={axiosPath} />
        <div className="text-center my-5"><h5>Ładowanie profilu użytkownika...</h5></div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid">
        <Header axiosPath={axiosPath} />

        {selectedUser && (
          <div>
            <div className='row my-4'>
              {/* Lewy panel informacyjny (Menu w stylu TransactionsPage) */}
              <div className='col-4'>
                <div className="profile-sidebar p-3 border rounded">
                  <h2>{selectedUser.login}</h2>
                  <span className="badge bg-secondary mb-3">{selectedUser.type}</span>
                  <p><strong>Discord:</strong> {selectedUser.discord_tag || 'Brak'}</p>
                  <p><strong>Telefon:</strong> {selectedUser.phone || 'Brak'}</p>
                  <button className='btn btn-primary w-100 mt-2 mb-4' onClick={toggleView}>
                    {showReviews ? "Pokaż Transakcje" : "Pokaż Recenzje"}
                  </button>

                  {/* Dynamiczny input wyszukiwania tekstowego wpięty pod TanStack GlobalFilter */}
                  <div className="border-top pt-3">
                    <h5 className="mb-2">Wyszukaj w tabeli</h5>
                    <input
                      type="text"
                      className="form-control rounded-0"
                      placeholder="Wpisz frazę..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Prawy panel z zaawansowaną tabelą TanStack */}
              <div className='col-8'>
                <h3>{showReviews ? "Historia recenzji" : "Historia transakcji"}</h3>

                <table className="table table-striped table-hover mb-2">
                  <thead>
                    {activeTable.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {/* 1. Wyświetlanie właściwych danych z filtrów/paginacji */}
                    {activeRows.map(row => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => {
                          const columnId = cell.column.id;
                          const rowData = row.original;

                          let cellClickHandler = null;
                          let isClickable = false;

                          // Dopasowanie akcji kliknięcia w celę (td) dla obu widoków
                          if (columnId === 'seller_login') {
                            cellClickHandler = (e) => { e.stopPropagation(); handleUserClick(rowData.seller_id); };
                            isClickable = true;
                          } else if (columnId === 'game_title' || columnId === 'game_title_rev') {
                            cellClickHandler = (e) => { e.stopPropagation(); redirectToGamePage(rowData.game_id || rowData.id); };
                            isClickable = true;
                          } else if (columnId === 'reciever_login') {
                            cellClickHandler = (e) => { e.stopPropagation(); handleUserClick(rowData.reciever_id); };
                            isClickable = true;
                          }

                          return (
                            <td
                              key={cell.id}
                              className={`align-middle ${isClickable ? 'text-primary text-decoration-underline' : ''}`}
                              style={{ cursor: isClickable ? 'pointer' : 'inherit' }}
                              onClick={cellClickHandler}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* 2. Wymuszenie pustych rekordów (Dopełnienie tabeli pustymi wierszami) */}
                    {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '49px' }}>
                        {Array.from({ length: activeColumnsLength }).map((_, colIndex) => (
                          <td key={`empty-cell-${colIndex}`} className="align-middle text-muted">&nbsp;</td>
                        ))}
                      </tr>
                    ))}

                    <tr className="table-light border-top">
                      <td colSpan={activeColumnsLength}>
                        <div className="d-flex justify-content-between align-items-center p-1">
                          <button className="btn btn-secondary rounded-0 border border-3 fw-bold" onClick={() => activeTable.setPageIndex(0)} disabled={!activeTable.getCanPreviousPage()}>First</button>
                          <button className="btn btn-secondary rounded-0 border border-3 fw-bold" onClick={() => activeTable.previousPage()} disabled={!activeTable.getCanPreviousPage()}>Previous</button>
                          <span className="text-muted small">Page <strong>{activeTable.getState().pagination.pageIndex + 1}</strong> of <strong>{Math.max(activeTable.getPageCount(), 1)}</strong></span>
                          <button className="btn btn-secondary rounded-0 border border-3 fw-bold" onClick={() => activeTable.nextPage()} disabled={!activeTable.getCanNextPage()}>Next</button>
                          <button className="btn btn-secondary rounded-0 border border-3 fw-bold" onClick={() => activeTable.setPageIndex(activeTable.getPageCount() - 1)} disabled={!activeTable.getCanNextPage()}>Last</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}