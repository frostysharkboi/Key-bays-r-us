import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
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
  const { userData } = useContext(UserContext);

  const { id } = useParams();
  const currentUserId = id;

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserTrans, setSelectedUserTrans] = useState([]);
  const [selectedUserReviews, setSelectedUserReviews] = useState([]);
  const [applicationsTable, setApplicationsTable] = useState([]);
  const [adminTableFiltered, setAdminTableFiltered] = useState([]);

  const [activeView, setActiveView] = useState(0); // 0: Transakcje, 1: Recenzje, 2: Formularz, 3: Admin
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [reason, changeReason] = useState("");

  const PAGE_SIZE = 10;

  const isOwnProfile = userData && currentUserId ? String(userData.id) === String(currentUserId) : false;

  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);

    axios.get(`${axiosPath}/applications`)
      .then((res) => {
        setApplicationsTable(res.data || [])
        const awaitingApps = applicationsTable.filter(app => app.status === "awaiting");
        setAdminTableFiltered(awaitingApps);
      })
      .catch((err) => console.error("Błąd pobierania wniosków dla admina:", err));

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
    setActiveView(0); // Reset widoku do transakcji przy zmianie profilu
    setGlobalFilter("");
    navigate(`/User/${userId}`, { replace: true, state: { uId: userId } });
  };

  const redirectToGamePage = (gameId) => {
    if (!gameId) return;
    navigate(`/Game/${gameId}`, { state: { GameId: gameId } });
  };

  // Zgłoszenie kandydatury na sprzedawcę
  function BecomeSeller() {
    if (selectedUser.type !== "normal") return;

    let appInBase = applicationsTable.some(element => String(element.sender_id) === String(selectedUser.id));

    if (!reason.trim()) {
      alert("Proszę podać powód.");
      return;
    }

    if (!appInBase) {
      axios.post(`${axiosPath}/applications/addAplication`, { sender_id: selectedUser.id, request: reason })
        .then(() => {
          alert("Twój wniosek został przesłany do rozpatrzenia");
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
          alert("Wystąpił błąd serwera podczas wysyłania wniosku.");
        });
    } else {
      alert("Twój wniosek został już wcześniej przesłany.\nProszę już ich więcej nie przesyłać.");
    }
  }

  // Akceptacja wniosku (Dla Admina)
  function AcceptRequest(appId, senderId) {
    axios.put(`${axiosPath}/applications/AcceptApp`, { id: appId, handler_id: userData.id })
      .then(() => {
        return axios.get(`${axiosPath}/applications`);
      })
      .then((res) => {
        const awaitingApps = (res.data || []).filter(app => app.status === "awaiting");
        setAdminTableFiltered(awaitingApps);
      })
      .catch((err) => console.error("Błąd podczas akceptacji w bazie wniosków:", err));

    axios.put(`${axiosPath}/users/PromoteToSeller`, { id: senderId })
      .then(() => {
        alert(`Wniosek #${appId} został potwierdzony. Użytkownik został sprzedawcą.`);
      })
      .catch((err) => console.error("Błąd promowania użytkownika:", err));
  }

  // Odrzucenie wniosku (Dla Admina)
  function DenialRequest(appId) {
    axios.put(`${axiosPath}/applications/DenialApp`, { id: appId, handler_id: userData.id })
      .then(() => {
        alert(`Wniosek #${appId} został odrzucony`);
        return axios.get(`${axiosPath}/applications`);
      })
      .then((res) => {
        const awaitingApps = (res.data || []).filter(app => app.status === "awaiting");
        setAdminTableFiltered(awaitingApps);
      })
      .catch((err) => console.error("Błąd podczas odrzucania wniosku:", err));
  }

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

  const activeTable = activeView === 1 ? reviewsTable : transTable;
  const activeRows = activeTable.getRowModel().rows;
  const activeColumnsLength = activeView === 1 ? reviewColumns.length : transactionColumns.length;
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
              {/* LEWY PANEL SIDEBAR */}
              <div className='col-4'>
                <div className="profile-sidebar p-3 border rounded d-flex flex-column">
                  <h2>{selectedUser.login}</h2>
                  <span className="badge bg-secondary mb-3 align-self-start">{selectedUser.type}</span>
                  <a href={`https://discord.com/users/${selectedUser.discord_tag || 'Brak'}`}><p><strong>Discord:</strong> {selectedUser.discord_tag || 'Brak'}</p></a>
                  <p><strong>Telefon:</strong> {selectedUser.phone || 'Brak'}</p>

                  {/* Przyciski nawigacji widoków */}
                  <button className={`btn w-100 mt-2 mb-2 ${activeView === 0 ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => { setActiveView(0); setGlobalFilter(""); }}>
                    Pokaż Transakcje
                  </button>
                  <button className={`btn w-100 mb-2 ${activeView === 1 ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => { setActiveView(1); setGlobalFilter(""); }}>
                    Pokaż Recenzje
                  </button>

                  {/* Widoczne tylko dla zwykłych użytkownikóww */}
                  {isOwnProfile && selectedUser.type === "normal" && (
                    <button className={`btn w-100 mb-2 ${activeView === 2 ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveView(2)}>
                      Aplikuj na sprzedawcę
                    </button>
                  )}

                  {/* Widoczne dla Admina */}
                  {selectedUser.type === "admin" && (
                    <button className={`btn w-100 mb-2 ${activeView === 3 ? 'btn-warning fw-bold' : 'btn-outline-warning fw-bold'}`} onClick={() => setActiveView(3)}>
                      Zarządzaj Wnioskami
                    </button>
                  )}

                  {isOwnProfile && (
                    <button className='btn btn-outline-secondary w-100 mb-4 mt-2' onClick={() => navigate("/Edit-Account")}>
                      Edytuj Konto
                    </button>
                  )}

                  {/* Wyszukiwarka dynamiczna TanStack */}
                  {(activeView === 0 || activeView === 1) && (
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

              {/* PRAWY PANEL DYNAMICZNY */}
              <div className='col-8'>

                {/* WIDOK 2: Formularz zgłoszeniowy sprzedawcy */}
                {activeView === 2 && (
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
                )}

                {/* WIDOK 3: Lista wniosków (Widok Administratora) */}
                {activeView === 3 && (
                  <div>
                    <h3 className="mb-3">Wnioski oczekujące na rozpatrzenie</h3>
                    {adminTableFiltered.length > 0 ? (
                      <table className="table table-bordered table-striped align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th>Użytkownik</th>
                            <th>Wniosek / Uzasadnienie</th>
                            <th>Status</th>
                            <th>Dostępne operacje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminTableFiltered.map((app) => (
                            <tr key={app.id}>
                              <td className="fw-bold">{app.login}</td>
                              <td>{app.request}</td>
                              <td><span className="badge bg-warning text-dark">{app.status}</span></td>
                              <td>
                                <button className="btn btn-sm btn-success me-2 fw-bold" onClick={() => AcceptRequest(app.id, app.sender_id)}>Zatwierdź</button>
                                <button className="btn btn-sm btn-danger fw-bold" onClick={() => DenialRequest(app.id)}>Odrzuć</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="alert alert-info">Brak oczekujących wniosków w systemie.</div>
                    )}
                  </div>
                )}

                {/* WIDOK 0 i 1: Zaawansowane tabele TanStack */}
                {(activeView === 0 || activeView === 1) && (
                  <div>
                    <h3>{activeView === 1 ? "Historia recenzji" : "Historia transakcji"}</h3>
                    <table className="w-100 table-sm ms-3">
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
                              <td key={`empty-cell-${colIndex}`} className="align-middle">&nbsp;</td>
                            ))}
                          </tr>
                        ))}

                        <tr className="table-light border-top">
                          <td colSpan={activeColumnsLength}>
                            <div className="d-flex justify-content-between align-items-center p-1">
                              <button className="rounded-0 border border-3 fw-bold" onClick={() => activeTable.setPageIndex(0)} disabled={!activeTable.getCanPreviousPage()}>First</button>
                              <button className="rounded-0 border border-3 fw-bold" onClick={() => activeTable.previousPage()} disabled={!activeTable.getCanPreviousPage()}>Previous</button>
                              <span className=" small">Page <strong>{activeTable.getState().pagination.pageIndex + 1}</strong> of <strong>{Math.max(activeTable.getPageCount(), 1)}</strong></span>
                              <button className="rounded-0 border border-3 fw-bold" onClick={() => activeTable.nextPage()} disabled={!activeTable.getCanNextPage()}>Next</button>
                              <button className="rounded-0 border border-3 fw-bold" onClick={() => activeTable.setPageIndex(activeTable.getPageCount() - 1)} disabled={!activeTable.getCanNextPage()}>Last</button>
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