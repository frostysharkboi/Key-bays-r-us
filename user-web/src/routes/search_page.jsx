import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './root.css'

export default function SearchPage(){
    // UseState do operacji na danych
  const [globalFilter, setGlobalFilter] = useState(""); // Filtry
  const [sorting, setSorting] = useState([]);           // Sortowanie
  const [pagination, setPagination] = useState({        // Wybrana strona:
    pageIndex: 0,                                       //    aktualna strona
    pageSize: 5,                                        //    ilośc rekordów na strone
  });

  const [games, setGames] = useState([]);               // Dane gier z bazy danych
  const [tags, setTags] = useState([]);                 // Dane tagów z bazy danych
  const [gamesData, setGamesData] = useState({          // Dane obecnie wybranej gry
    title:"",
    about:""
  });

  // Pobranie danych z tabeli
  const getAllGames = () => {
    axios.get("http://localhost:3000/games").then((res) => {
    //axios.get("http://localhost:3000/games/tagsort", {params: { name: "RPG" }}).then((res) => { by filtrować
      setGames(res.data);
    });
  };
  const getAllTags = () => {
    axios.get("http://localhost:3000/tags").then((res) => {
      setTags(res.data);
    });
  };
  React.useEffect(() => {
    getAllTags();
    getAllGames();
  }, []);



  // Wygenerowanie tabeli w html z danymi
  const columns = React.useMemo(() => [
    { header: "ID", accessorKey: "id", enableSorting: true,
      cell: (info)=>{ return <b>{info.getValue()}</b> }
     },
    { header: "Title", accessorKey: "title", enableSorting: true},
    { header: "About", accessorKey: "about", enableSorting: false},
    { header: "Image", accessorKey: "cover_img", enableSorting: false,
      cell: (info)=>{
        var alt_text = "Cover Art of " + info.row.original.title;
        return(<img src={info.getValue()} alt={alt_text} width={200} />)
      }
    }
  ],[]);

  

  // Obsługa funkcji tabeli (tu większośc rzeczy po prostu wklejałem wdg zapotrzebowań innych funkcji np. wyszukiwanie, sortowanie i filtrowanie)
  const table = useReactTable({
    data: games,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: (newSorting) => {  setSorting(newSorting);},
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });
  // Czyszczenie danych po zatwierdzeniu 
  const clearAll=()=>{
    setGamesData({
      title:"",
      about:""
    });
    getAllGames();
  }
  const rows = table.getRowModel().rows;
  const emptyRowCount = 5 - rows.length;

  const navigate = useNavigate();
  const location = useLocation();

  function RedirectToStorefront(e){
    navigate('GamePage-Test',{state:{GameId: e}});
  }

  //Tu jest wyszukiwanie gry z tego paska na górze.
  var Title = location.state.Title;
  var GenreId = location.state.GenreId;
  
  console.log(Title + "\n" + GenreId);
  

  return (
    <>
        <div className="container-fluid">
              {/*Nagłówek Strony*/}
              <div className="row m-3 p-3 text-center">
        
                {/* Wyszukiwarka */}
                <div className='col-4'>
                  <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...'/>
                </div>
        
                {/* Logo, wiadomo */}
                <div className='col-4 fw-bolder logo'>
                  <a href="/"><h1>Keys &apos;R&apos; Us</h1></a>
                </div>
        
                {/* Dropdown menu konta */}
                <div className='col-4'>
                  <div className="dropdown">
                  <button className="dropbtn font">Dropdown</button>
                    <div className="dropdown-content fw-bold">
                      <a href="#">Link 1</a>
                      <a href="#">Link 2</a>
                      <a href="#">Link 3</a>
                    </div>
                  </div> 
                </div>
              </div>
            
              <h3 className='mx-4 mt-4 p-4 font'>Wyniki Wyszukiwania</h3>
                <div className="row px-4 pb-4">
                  <div className="col-12 col-lg-4 custom-border border-dark">
                    <h3 className='mx-4 mt-4 p-3 text-center font'>Filtry</h3>
                    <div className="addpanel">
                      <div className="addpaneldiv row p-2 pe-4">
                        <h2>Tytuł</h2>
                        <input className='col p-2' type="text" name='search' id='search' value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder='Search...'/>
                        
                      </div>
                      <div className='addpaneldiv row p-2 pe-4'>
                        <h2>Gatunki</h2>
                        {/* TODO: Zoptymalizować radiogroup, by tworzyło radio za pomocą .map() tabeli tag*/}
                        <div><input type="Checkbox" name="Gat_1" id="Gat_1" value="1"/><label htmlFor="Gat_1" className='p-2 m-0'>RPG</label></div>
                        <div><input type="Checkbox" name="Gat_2" id="Gat_2" value="2"/><label htmlFor="Gat_2" className='p-2 m-0'>Action</label></div>
                        <div><input type="Checkbox" name="Gat_3" id="Gat_3" value="3"/><label htmlFor="Gat_3" className='p-2 m-0'>Open World</label></div>
                        <div><input type="Checkbox" name="Gat_4" id="Gat_4" value="4"/><label htmlFor="Gat_4" className='p-2 m-0'>FPS</label></div>
                        <div><input type="Checkbox" name="Gat_5" id="Gat_5" value="5"/><label htmlFor="Gat_5" className='p-2 m-0'>Adventure</label></div>
                        <div><input type="Checkbox" name="Gat_6" id="Gat_6" value="6"/><label htmlFor="Gat_6" className='p-2 m-0'>Multiplayer</label></div>
                        <div><input type="Checkbox" name="Gat_7" id="Gat_7" value="7"/><label htmlFor="Gat_7" className='p-2 m-0'>Strategy</label></div>
                        <div><input type="Checkbox" name="Gat_8" id="Gat_8" value="8"/><label htmlFor="Gat_8" className='p-2 m-0'>Simulation</label></div>
                        <div><input type="Checkbox" name="Gat_9" id="Gat_9" value="9"/><label htmlFor="Gat_9" className='p-2 m-0'>Horror</label></div>
                        <div><input type="Checkbox" name="Gat_10" id="Gat_10" value="10"/><label htmlFor="Gat_10" className='p-2 m-0'>Indie</label></div>
                        <div><input type="Checkbox" name="Gat_11" id="Gat_11" value="11"/><label htmlFor="Gat_11" className='p-2 m-0'>Survival</label></div>
                        <div><input type="Checkbox" name="Gat_12" id="Gat_12" value="12"/><label htmlFor="Gat_12" className='p-2 m-0'>Sandbox</label></div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <table className='table border border-3 table-sm table-striped table-hover ms-3'>
                      <thead>
                        {table.getHeaderGroups().map(hg => (
                            <tr className='table-primary border border-3' key={hg.id}>
                              {hg.headers.map(header => (
                                <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}>
                                  {header.column.getIsSorted() === "desc" ? "⬆️ " : (header.column.getIsSorted() === "asc" ? "⬇️ " : "")}
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getIsSorted() === "desc" ? " ⬆️" : (header.column.getIsSorted() === "asc" ? " ⬇️" : "")}
                                </th>
                              ))}
                            </tr>
                        ))}
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id} onClick={() => RedirectToStorefront(parseInt(row.id) + 1)}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                          </tr>
                        ))}
                        {Array.from({ length: emptyRowCount }).map((_, idx) => (
                          <tr key={`empty-${idx}`} className="empty-row">
                            <td colSpan={columns.length} style={{ height: "48px", opacity: 0 }}>
                            </td>
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
  )
}