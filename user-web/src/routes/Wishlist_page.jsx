import { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { UserContext } from '../components/user-context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";

export default function WishlistPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userData, logout } = useContext(UserContext);

  const [globalFilter, setGlobalFilter] = useState(""); 
  const [sorting, setSorting] = useState([]);           
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });
  const [games, setGames] = useState([]);

  const [SearchThisTitle, changeTitle] = useState("");

  // Inicjalizacja filtra początkowego, jeśli przyszedł z innej podstrony
  useEffect(() => {
    if (location.state?.Title) {
      setGlobalFilter(location.state.Title);
    }
  }, [location.state]);

  // Pobranie listy życzen
  useEffect(() => {
    if (userData.id) {
      axios.get(`${axiosPath}/wishlist/wishlistData`, { params: { id: userData.id } })
        .then((res) => {
          setGames(res.data);
        })
        .catch(err => console.error("Błąd pobierania listy życzeń:", err));
    }
  }, [userData.id]);

  // Definicja kolumn tabeli gier
  const columns = useMemo(() => [
    { 
      header: "ID", 
      accessorKey: "id", 
      cell: (info) => <b>{info.getValue()}</b> 
    },
    { header: "Title", accessorKey: "title" },
    { header: "About", accessorKey: "about", enableSorting: false },
    { 
      header: "Image", 
      accessorKey: "cover_img", 
      enableSorting: false,
      cell: (info) => <img src={info.getValue()} alt={`Cover of ${info.row.original.title}`} width={200} />
    }
  ], []);

  // Konfiguracja instancji tabeli
  const table = useReactTable({
    data: games,
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
    navigate('/Game', { state: { GameId: gameId } });
  }

  function RedirectToSeaching(genreId) {
    if (genreId == null) {
      navigate("/Search", { state: { Title: SearchThisTitle } });
    } else {
      navigate("/Search", { state: { GenreId: genreId } });
    }
  }

  function LogOutUser() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <>
      <div className="container-fluid">
        {/* Nagłówek Strony */}
        <div className="row m-3 p-3 text-center">
          {/* Wyszukiwarka */}
          <div className='col-4'>
            <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...' onChange={(e) => changeTitle(e.target.value)}/>
            <button className='border border-3 btnsrch' onClick={() => RedirectToSeaching(null)}>SZUKAJ</button>
          </div>

          {/* Logo */}
          <div className='col-4 fw-bolder logo'>
            <h1 onClick={() => navigate('/')}>Keys &apos;R&apos; Us</h1>
          </div>

          {/* Menu konta */}
          <div className='col-4'>
            <div className="dropdown">
              {/* Dynamiczne wstrzyknięcie nicku zalogowanego użytkownika bezpośrednio z kontekstu */}
              <button className="dropbtn font" id="nick">
                {userData.isLogged ? userData.login : "Konto"}
              </button>
              <div className="dropdown-content fw-bold">
                {!userData.isLogged ? (
                  <h5 onClick={() => navigate("/Login", { replace: true })}>Zaloguj się</h5>
                ) : (
                  <>
                    <h5 onClick={() => navigate("/Wishlist")}>Moja Lista Życzeń</h5>
                    <h5 onClick={LogOutUser}>Wyloguj się</h5>
                  </>
                )}
              </div>
            </div> 
          </div>
        </div>

        {/* Sekcja tabeli listy życzeń */}
        <h3 className='mx-4 mt-4 p-4 font'>Twoja Lista Życzeń</h3>
        <div className="row px-4 pb-4">
          <div className="col-12 col-lg-4 custom-border border-dark">
            <h3 className='mx-4 mt-4 p-3 text-center font'>Filtruj listę:</h3>
            <div className="addpanel box-idk">
              <div className="addpaneldiv row p-2 pe-4">
                <h2 className='font'>Tytuł gier</h2>
                <input className='col p-2 inp-srch' type="text" value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder='Wpisz nazwę...'/>
              </div>
            </div>
          </div>
          
          <div className="col">
            <table className='table border border-3 table-sm table-striped table-hover ms-3'>
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr className='table-part-top border border-3' key={hg.id}>
                    {hg.headers.map(header => (
                      <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}>
                        {header.column.getIsSorted() === "desc" ? "↑ " : (header.column.getIsSorted() === "asc" ? "↓ " : "")}
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "desc" ? " ↑" : (header.column.getIsSorted() === "asc" ? " ↓" : "")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} onClick={() => RedirectToGamePage(parseInt(row.getVisibleCells()[0].getValue()))} style={{cursor: 'pointer'}}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {Array.from({ length: emptyRowCount }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="empty-row">
                    <td colSpan={columns.length} style={{ height: "48px", opacity: 0 }}></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={columns.length}>
                    <div className="d-flex justify-content-between align-items-center">
                      <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}> First </button>
                      <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}> Previous </button>
                      <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
                      <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
                      <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>Last</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Stopka */}
        <div className="row m-3 p-3 text-center">
          <div className='col'>
            <p>Kontakt</p>
            <p>Mail: biurokeysrus@gmail.com</p>          
          </div>
        </div>
      </div>
    </>
  );
}