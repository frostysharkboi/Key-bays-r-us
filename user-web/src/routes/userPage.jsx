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

// --- DEFINICJE KOLUMN ---
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

  // NOWOŚĆ: Stan dla widoku formularza rekrutacyjnego na sprzedawcę
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [reason, changeReason] = useState("");
  const [applicationsTable, setApplicationsTable] = useState([]);

  const [globalFilter, setGlobalFilter] = useState("");
  const PAGE_SIZE = 10;

  const { userData } = useContext(UserContext);

  // DYNAMICZNY WARUNEK: Sprawdzenie, czy zalogowany użytkownik przegląda własną stronę
  const isOwnProfile = userData && currentUserId ? String(userData.id) === String(currentUserId) : false;

  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);

    // Pobranie listy aplikacji w celu późniejszej weryfikacji duplikatów wniosków
    axios.get("http://localhost:3000/applications")
      .then((res) => setApplicationsTable(res.data || []))
      .catch((err) => console.error("Błąd pobierania wniosków:", err));

    axios.get(`${axiosPath}/users`)
      .then((res) => {
        const usersList = res.data;
        const foundUser = usersList.find(u => String(u.id) === String(currentUserId));

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
    // Resetujemy stany widoków przed przejściem na inny profil
    setShowApplicationForm(false);
    setShowReviews(false);
    navigate(`/User/${userId}`, { replace: true, state: { uId: userId } });
  };

  const redirectToGamePage = (gameId) => {
    if (!gameId) return;
    navigate(`/Game/${gameId}`, { state: { GameId: gameId } });
  };

  const toggleView = () => {
    setShowApplicationForm(false); // Wyłącza formularz, jeśli przełączamy na tabele
    setShowReviews(prev => !prev);
    setGlobalFilter("");
  };

  // --- TANSTACK CONFIG ---
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

  const activeTable = showReviews ? reviewsTable : transTable;
  const activeRows = activeTable.getRowModel().rows;
  const activeColumnsLength = showReviews ? reviewColumns.length : transactionColumns.length;
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
              {/* Lewy panel informacyjny */}
              <div className='col-4'>
                <div className="profile-sidebar p-3 border rounded">
                  <h2>{selectedUser.login}</h2>
                  <span className="badge bg-secondary mb-3">{selectedUser.type}</span>
                  <p><strong>Discord:</strong> {selectedUser.discord_tag || 'Brak'}</p>
                  <p><strong>Telefon:</strong> {selectedUser.phone || 'Brak'}</p>

                  {/* Przyciski zmiany widoków tabel */}
                  <button className={`btn w-100 mt-2 mb-2 ${(!showReviews && !showApplicationForm) ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => { setShowReviews(false); setShowApplicationForm(false); setGlobalFilter(""); }}>
                    Pokaż Transakcje
                  </button>
                  <button className={`btn w-100 mb-2 ${(showReviews && !showApplicationForm) ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => { setShowReviews(true); setShowApplicationForm(false); setGlobalFilter(""); }}>
                    Pokaż Recenzje
                  </button>

                  {isOwnProfile && (
                    <button className='btn btn-outline-secondary w-100 mb-4' onClick={() => navigate("/Edit-Account")}>
                      Edytuj Konto
                    </button>
                  )}

                  {/* Wyszukiwarka – ukrywana, kiedy wyświetlamy formularz zgłoszeniowy */}
                  {!showApplicationForm && (
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
                  )}
                </div>
              </div>

              {/* Prawy panel dynamiczny (Tabela lub Formularz) */}
              <div className='col-8'>
                {showApplicationForm ? (
                  // WIDOK 2: Formularz aplikowania na sprzedawcę
                  <div>
                    <h3>Aplikacja na sprzedawcę</h3>
                    <div className="p-4 border rounded bg-light mt-3">
                      <h5 className="mb-3">Proszę podaj powód, dla którego chcesz zostać sprzedawcą?</h5>
                      <textarea
                        className="form-control mb-3"
                        rows="4"
                        placeholder="Wpisz uzasadnienie..."
                        value={reason}
                        onChange={(e) => changeReason(e.target.value)}
                      />
                      <button className="btn btn-success fw-bold px-4" onClick={BecomeSeller}>DODAJ WNIOSEK</button>
                    </div>
                  </div>
                ) : (
                  // WIDOK 0 i 1: Tabele TanStack
                  <div>
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
                        {activeRows.map(row => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map(cell => {
                              const columnId = cell.column.id;
                              const rowData = row.original;

                              let cellClickHandler = null;
                              let isClickable = false;

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
                )}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}