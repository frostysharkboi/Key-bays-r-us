import { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { UserContext } from '../components/user-context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";
import Header from '../components/header/Header';

import { useDebounce } from '../hooks/UseDebounce';
import Footer from '../components/footer/Footer';

export default function SearchPage() {
  const { userData, logout } = useContext(UserContext);

  const [searchInputValue, setSearchInputValue] = useState("");
  const debouncedSearchValue = useDebounce(searchInputValue, 400);
  const globalFilter = debouncedSearchValue;

  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });

  const [games, setGames] = useState([]);
  const [tags, setTags] = useState([]);
  const [filterTags, setFilterTags] = useState([]);


  const navigate = useNavigate();
  const location = useLocation();

  // Inicjalizacja filtra początkowego, jeśli przyszedł z innej podstrony przez stan nawigacji
  useEffect(() => {
    if (location.state?.Title) {
      setSearchInputValue(location.state.Title);
    }
  }, [location.state]);

  const GenreId = location.state?.GenreId;

  // Pobranie przefiltrowanej listy gier z backendu
  const getFilteredGames = () => {
    const outputTags = filterTags.filter(tag => tag.isSelected).map(tag => tag.id);

    axios.get(`${axiosPath}/games/tagsort`, { params: { tags: outputTags }, paramsSerializer: params => "tags=" + params.tags.join("&tags=") })
      .then((res) => {
        setGames(res.data);
      })
      .catch(err => console.error("Błąd pobierania gier:", err));
  };

  // Pobranie listy wszystkich tagów/gatunków z bazy danych
  const getAllTags = () => {
    axios.get(`${axiosPath}/tags`).then((res) => {
      setTags(res.data);

      const mapped = res.data.map(e => ({
        id: e.id,
        tag: e.tag,
        isSelected: e.id == GenreId,
      }));

      setFilterTags(mapped);
    });
  };

  const anySelected = filterTags.some(t => t.isSelected);

  useEffect(() => {
    getAllTags();
  }, [GenreId]);

  useEffect(() => {
    if (filterTags.length > 0) {
      getFilteredGames();
    }
  }, [filterTags]);

  // Struktura kolumn tabeli (Kolumna ID została pomyślnie usunięta z widoku)
  const columns = useMemo(() => [
    { header: "Title", accessorKey: "title" },
    { header: "About", accessorKey: "about", enableSorting: false },
    {
      header: "Image",
      accessorKey: "cover_img",
      enableSorting: false,
      cell: (info) => <img src={info.getValue()} alt={`Cover of ${info.row.original.title}`} width={200} />
    }
  ], []);

  // Konfiguracja instancji TanStack Table
  const table = useReactTable({
    data: games,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchInputValue,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const rows = table.getRowModel().rows;
  const emptyRowCount = pagination.pageSize - rows.length;

  function RedirectToGamePage(gameId) {
    navigate(`/Game/${gameId}`, { state: { GameId: gameId } });
  }

  function RedirectToSeaching(genreId) {
    if (genreId == null) {
      setSearchInputValue(searchInputValue);
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
        <Header />

        {/* Główna sekcja z tabelą i panelami bocznymi */}
        < h3 className='mx-4 mt-4 p-4 font' > Wyniki Wyszukiwania</h3 >
        <div className="row px-4 pb-4">
          <div className="col-12 col-lg-4 custom-border border-dark">
            <h3 className='mx-4 mt-4 p-3 text-center font'>Filtry:</h3>
            <div className="addpanel box-idk">
              <div className="addpaneldiv row p-2 pe-4">
                <h2 className='font'>Tytul</h2>
                <input
                  className='col p-2 inp-srch'
                  type="text"
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  placeholder='Search...'
                />
              </div>
              <div className='addpaneldiv col p-2 pe-4'>
                <h2 className='font'>Gatunki</h2>
                {filterTags.map((t) => (
                  <div className='row' key={t.id}>
                    <input className='btn-check col' type="checkbox" name={`Gat_${t.id}`} id={`Gat_${t.id}`} checked={t.isSelected}
                      onChange={(e) => {
                        setFilterTags(prev => prev.map(
                          tag => tag.id === t.id ? { ...tag, isSelected: e.target.checked } : tag
                        ));
                      }}
                    />
                    <label htmlFor={`Gat_${t.id}`}
                      className={`p-2 m-1 btn-kirk border border-6 ${t.isSelected || !anySelected ? "btn-zaz" : "btn-odz"}`}
                    >{t.tag}</label>
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
                  /* MODYFIKACJA: id wyciągamy bezpośrednio z surowego obiektu row.original, a nie z widoku HTML */
                  <tr key={row.id} onClick={() => RedirectToGamePage(row.original.id)} style={{ cursor: 'pointer' }}>
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

        {/* Stopka */}
        <Footer />
      </div >
    </>
  );
}