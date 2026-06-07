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

  const [SelectedUser, SetMainUser] = useState(null);
  const [SelectedUserTrans, SetUsersTrans] = useState(null);
  const [SelectedUserReviews, SetUsersReviews] = useState(null);
  const [whatToShow, changeShowing] = useState(0);

  const [AppTable, setTable] = useState(null);
  const [reason, changeReason] = useState(null);

  // Stany dla komunikatów walidacji i sukcesu
  const [errorBoxText, setErrorBoxText] = useState("");
  const [successBoxText, setSuccessBoxText] = useState("");
  const [Changed, setChanged] = useState(0);
  const [mainUser, GetMainUser] = useState(null);
  const { userData, logout } = useContext(UserContext);
  const [MeinUsser, isUserLogged] = useState(false);
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

  //Dla Admina
  const [AdminTable, getAdminTable] = useState(null);
  const [AdminTableFiltred, setTableRight] = useState(null);

  // Pobranie danych użytkowników z bazy w celu lokalnej weryfikacji duplikatów
  const LoadUsersData = () => {
    axios.get(`${axiosPath}/users`).then((res) => {
      GetAllUsersData(res.data);
    });
  };

  React.useEffect(() => {
    LoadUsersData();
    console.log(location.state.uId);
    axios.get("http://localhost:3000/applications").then((res) => {setTable(res.data)});
    axios.get("http://localhost:3000/applications/getAll").then((res) => {getAdminTable(res.data)});
  }, []);

  useEffect(() => {
    if(Users != null){
      Users.forEach(user => {
        if(user.id == location.state.uId){
          SetMainUser(user);
          if(user.id == userData.id){
            isUserLogged(true);
          }
          console.log(user);
          axios.get(`${axiosPath}/transactions/getByUser`, {params: {id: user.id}} ).then((res) => {
            SetUsersTrans(res.data);
            console.log(res.data);
          });
          axios.get(`${axiosPath}/ratings/getByUser`, {params: {id: user.id}} ).then((res) => {
            SetUsersReviews(res.data);
            console.log(res.data);
          });
        };
      });
    }
  }, [Users]);

  useEffect(() => {
    let arr = [];
    if(AdminTable != null && AdminTable.length > 0){
      AdminTable.forEach(element => {
        if(element.status == "awaiting"){
          arr.push(element);
        }
      });
    };
    setTableRight(arr);
  }, [AdminTable]);

  function RedirectToGamePage(gameId) {
    navigate('/Game', { state: { GameId: gameId } });
  }

  function BecomeSeller(){
    let AppInBase = false;
    if(SelectedUser.type == "normal"){
      
      if(AppTable != null){
        AppTable.forEach(element => {
          console.log(element);
          if(element.sender_id == SelectedUser.id){
            AppInBase = true;
          }
        });
      }

      if(AppInBase == false && reason != null){
        axios.post(`${axiosPath}/applications/addAplication`, {sender_id: SelectedUser.id, request: reason})
          .then(() => {
            setSuccessBoxText("Twój wniosek został dodany.");
            window.location.reload();
          })
          .catch((err) => {
            setErrorBoxText("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
            console.error(err);
          });
        alert("Twój wniosek został przesłany do rozpatrzenia");
      } else {
        if(reason == null){
          alert("Proszę podać powód.");
        }
        alert("Twój wniosek został już wcześniej przesłany.\nProszę już ich więcej nie przesyłać.");
      }
    }
  }

  function AcceptRequest(App_id, senderId){
    axios.put(`${axiosPath}/applications/AcceptApp`, {id: App_id, handler_id: SelectedUser.id})
      .then(() => {
        axios.get("http://localhost:3000/applications/getAll").then((res) => {getAdminTable(res.data)});
        console.log(`Wniosek ${App_id} został potwierdzony`);
      })
      .catch((err) => {
        setErrorBoxText("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
        console.error(err);
      });
    axios.put(`${axiosPath}/users/PromoteToSeller`, {id: senderId})
      .then(() => {
        console.log(`User ${senderId} został sprzedawcą`);
        alert(`Wniosek #${App_id} został potwierdzony`);
      })
      .catch((err) => {
        setErrorBoxText("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
        console.error(err);
      });
  }

  function DenialRequest(App_id){
    axios.put(`${axiosPath}/applications/DenialApp`, {id: App_id, handler_id: SelectedUser.id})
      .then(() => {
        axios.get("http://localhost:3000/applications/getAll").then((res) => {getAdminTable(res.data)});
        alert(`Wniosek #${App_id} został odrzucony`);
      })
      .catch((err) => {
        setErrorBoxText("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
        console.error(err);
      });
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
                <div className='d-flex flex-column mb-3 p-2'>
                  <h2>{SelectedUser.login}</h2>
                  <h3>{SelectedUser.type}</h3>
                  <h4>{SelectedUser.discord_tag}</h4>
                  <h4>{SelectedUser.phone}</h4>
                  <button className='m-3' onClick={() => changeShowing(0)}>Pokaż transkacje</button>
                  <button className='m-3' onClick={() => changeShowing(1)}>Pokaż Recenzje</button>
                  {MeinUsser == true && SelectedUser.type == "normal" && (
                    <button className='m-3' onClick={() => changeShowing(2)}>Aplikuj na sprzedawcę</button>
                  )}
                  {MeinUsser == true && SelectedUser.type == "admin" && (
                    <button className='m-3' onClick={() => {changeShowing(3); console.log(AppTable)}}>Sprawdź wnioski o zmianę statusu</button>
                  )}
                  {MeinUsser == true && (
                    <button className='m-3' onClick={() => navigate("/Edit-Account")}>Edytuj Konto</button>
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
                <div>
                  {whatToShow == 0 && (
                    <div className="overflow-auto">
                      {SelectedUserTrans != null && SelectedUserTrans.length > 0 ? (
                        <table className='mw-90 mh-50'>
                          <thead>
                            <tr>
                              <th>Sprzedawca</th><th>Gra</th><th>Opis</th><th>Odbiorca</th><th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SelectedUserTrans.map((trans) => (
                              <tr>
                                <td onClick={() => {navigate(`/User/${trans.seller_id}`, {replace: true, state: {uId: trans.seller_id}}); window.location.reload()}}>{trans.login}</td>
                                <td onClick={() => RedirectToGamePage(trans.game_id)}>{trans.title}</td>
                                <td>{trans.other}</td>
                                <td onClick={() => {navigate(`/User/${trans.reciever_id}`, {replace: true, state: {uId: trans.reciever_id}}); window.location.reload()}}>{trans.receiver_login}</td>
                                <td>{trans.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>użytkownik nie ma żadnej historii transakcji</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  {whatToShow == 1 && (
                    <div>
                      {SelectedUserReviews != null && SelectedUserReviews.length > 0  ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Ocena</th><th>Gra</th><th>Opis</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SelectedUserReviews.map((rev) => (
                              <tr>
                                <td>{rev.rating}</td>
                                <td onClick={() => RedirectToGamePage(rev.id)}>{rev.title}</td>
                                <td>{rev.other}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>użytkownik nie ma żadnej historii receznji</p>
                      )}
                    </div>
                  )}
                  {whatToShow == 2 && (
                    <div>
                      <h3>Proszę podaj powód, dla którego chcesz zostać sprzedawcą?</h3>
                      <input type="text" onChange={(e) => changeReason(e.target.value)}/>
                      <button onClick={() => BecomeSeller()}>DODAJ WNIOSEK</button>
                    </div>
                  )}
                  {whatToShow == 3 && (
                    <div>
                      <h2>WNIOSKI</h2>
                      {(AdminTableFiltred.length > 0)? (
                        <table>
                          <thead>
                            <tr>
                              <th>Użytkownik</th><th rowSpan={2}>Wniosek</th><th>Status oczekiwania wniosku</th><th>Dostępne operacje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {AdminTableFiltred.map((App) => (
                              <tr key={App.id} className='p-4'>
                                <td>{App.login}</td>
                                <td>{App.request}</td>
                                <td>{App.status}</td>
                                <td><button onClick={() => {console.log(App, "\n", SelectedUser); AcceptRequest(App.id, App.sender_id)}}>Zatwierdź</button>
                                <button onClick={() => {console.log(App, "\n", SelectedUser); DenialRequest(App.id)}}>Odrzuć</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>Brak wniosków.</p>
                      )}
                    </div>
                  )}
                </div>
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