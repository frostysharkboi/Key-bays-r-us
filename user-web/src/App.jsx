import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
//export const axiosPath = "https://keysrus-backend.onrender.com";
export const axiosPath = "http://localhost:3000";

//import './App.css'

// NAJPIERW ZRÓB DZIAŁANIA Z config.txt
// Ważny pliki do operacji na bazie: server.js (nazwa bazy danych) i db.js (tabela i jej używane kolumny)
// Modyfikacja wartości w funkcjach zmienia wartości, ten plik jest dobry do bawienia się z wyświetlaniem

function App() {
  
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
    axios.get(`${axiosPath}/games`).then((res) => {
    //axios.get(`${axiosPath}/games/tagsort`, {params: { name: "RPG" }}).then((res) => { by filtrować
      setGames(res.data);
    });
  };
  const getAllTags = () => {
    axios.get(`${axiosPath}/tags`).then((res) => {
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
          <h1>Keys &apos;R&apos; Us</h1>
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
    
      {/* Baner */}
      <div className="row m-3 p-3 text-center">
        <img src="https://store-images.s-microsoft.com/image/apps.5012.65806558541457305.a0ff0982-eced-4bfd-bb78-5ba7a73376c4.069fcd98-6d14-48a3-82a3-074b07fb3acb?q=90&w=480&h=270" className='mx-auto w-25 h-25 rounded'/>
      </div>

      {/* Karulezela */}
      <div className="row m-3 p-3 text-center">
        <div id="carouselExampleSlidesOnly" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-touch="false">
          <div className="carousel-inner">
            <div className="carousel-item active" data-bs-interval="60">
              <img src="https://store-images.s-microsoft.com/image/apps.5012.65806558541457305.a0ff0982-eced-4bfd-bb78-5ba7a73376c4.069fcd98-6d14-48a3-82a3-074b07fb3acb?q=90&w=480&h=270" className="mx-auto d-block w-25 h-25" alt="..."/>
              <div className="carousel-caption d-none d-md-block">
                <h5 className="font">TEMP GAME #1</h5>
                <p className='discount'>Some representative placeholder content for the first slide.</p>
              </div>
            </div>
            <div className="carousel-item" data-bs-interval="60">
              <img src="https://store-images.s-microsoft.com/image/apps.5012.65806558541457305.a0ff0982-eced-4bfd-bb78-5ba7a73376c4.069fcd98-6d14-48a3-82a3-074b07fb3acb?q=90&w=480&h=270" className="mx-auto d-block w-25 h-25" alt="..."/>
              <div className="carousel-caption d-none d-md-block ">
                <h5 className="font">TEMP GAME #2</h5>
                <p className='discount'>Some representative placeholder content for the first slide.</p>
              </div>
            </div>
            <div className="carousel-item" data-bs-interval="60">
              <img src="https://store-images.s-microsoft.com/image/apps.5012.65806558541457305.a0ff0982-eced-4bfd-bb78-5ba7a73376c4.069fcd98-6d14-48a3-82a3-074b07fb3acb?q=90&w=480&h=270" className="mx-auto d-block w-25 h-25" alt="..."/>
              <div className="carousel-caption d-none d-md-block">
                <h5 className="font">TEMP GAME #3</h5>
                <p className='discount'>Some representative placeholder content for the first slide.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gatunki */}
      <div className='row m-1 text-center font'>
          <h2>GATUNKI</h2>
      </div>
      <div className="row row-cols-4 justify-content-md-center m-3 p-3 text-center">
      {/* 
      Ignacy----> Myślałem, żeby wrzucić tu pętle, która by przeszukiwała baze w poszukiwaniu gatunków gier i na podstawie znalezionych gatunków wypisywała je w kartach poniżej. 
      Dominik----> Zrobi się w dalszej części.
      Jakub----> Zrobiłem =) ale chyba jeszcze przekierowania trzeba zrobić
      */}
        {tags.map((row)=>(
          <div className="card rounded-0 border border-3 font col p-4 m-3" key={row.id}>
              <div className="card-body w-40">
                {/*<img src={row.icon} alt={row.tag}/>*/}
                <p className="card-text w-40 fw-bold">{row.tag}</p>
              </div>
          </div>
        ))}

      </div>

      {/* Stopka */}
      <div className="row m-3 p-3 text-center">
        <div className='col'>
          <p>Kontakt</p>
          <p>Mail: biurokeysrus@gmail.com</p>          
        </div>
      </div>
    </div>

    <hr class="border border-black border-3 opacity-75"/>

    <div className="container-fluid">
      {/*Nagłówek Strony*/}
      <div className="row m-3 p-3 text-center">

        {/* Wyszukiwarka */}
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...'/>
        </div>

        {/* Logo, wiadomo */}
        <div className='col-4 logo'>
          <h1>Keys &apos;R&apos; Us</h1>
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
                <input className='col p-2' type="text" name='search' id='search' value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder='Search...'/>
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
                  <tr key={row.id}>
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

export default App
