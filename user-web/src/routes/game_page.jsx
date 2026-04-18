import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './root.css';

export default function Root(){

  // UseState do operacji na danych
  const [globalFilter, setGlobalFilter] = useState(""); // Filtry
  const [sorting, setSorting] = useState([]);           // Sortowanie
  const [pagination, setPagination] = useState({        // Wybrana strona:
    pageIndex: 0,                                       //    aktualna strona
    pageSize: 5,                                        //    ilośc rekordów na strone
  });

  const [games, setGames] = useState([]);               // Dane gier z bazy danych
  const [gamesData, setGamesData] = useState({          // Dane obecnie wybranej gry
    title:"",
    about:""
  });

  // Pobranie danych z tabeli
  const getAllGames = () => {
    axios.get("http://localhost:3000/games").then((res) => {
      setGames(res.data);
    });
  };
  React.useEffect(() => {
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

  var GameId = location.state.GameId;
  console.log(GameId);

    return (
    <>
    <div className="container-fluid">
      {/*Nagłówek Strony*/}
      <div className="row m-3 p-3 text-center">

        {/* Wyszukiwarka */}
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...'/>
          <button>szukaj</button>
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

      {/* Początek zawartości "Storefront" */}

      {/* Tytuł Gry */}
      <div className='row m-3 p-3 text-center'>
        <div className='col'>
          <h2>Tytuł gry</h2>
        </div>
      </div>

      {/* Wiersz z media, tagami, recenzjami i etc */}
      <div className='row m-3 p-3 text-center'>
        {/* Media */}
        <div className='col-7'>
          <iframe src="https://www.youtube.com/watch?v=Yr4Skj4Gc4E" width="800px" heigth="600px"/>
        </div>
        <div className='col-5'>
            {/* Recenzje - średnia w gwiazdkach */}
            <div>
              <p>Recenzje</p>
              {/* Dodawnanie recenzji będzie działało na nested podstronie */}
            </div>
            <br/>
            {/* Tagi */}
            <div>
              <p>Tagi</p>
            </div>
            <br/>
            {/* Producent */}
            <div>
              <p>Producent</p>
            </div>
        </div>
      </div>

      {/* Opis Gry i wymagania */}
      <div className='row m-3 p-3 text-center'>
        {/* Opis Gry */}
        <div className='col-7'>
          <p>Opis gry</p>
        </div>
        {/* Div z obydwoma wymaganiami */}
        <div className='col-5'>
          {/* Zalecane */}
          <div>
            <p>Zalecane wymagania</p>
          </div>

          <br/>

          {/* Minimalne */}
          <div>
            <p>Minimalne wymagania</p>
          </div>
        </div>
      </div>

      {/* Oferty */}
      <div className='row m-3 p-3 text-center'>
        <p>Oferty</p>
      </div>

      {/* Recenzje - Szczegóły */}
      <div className='row m-3 p-3 text-center'>
        <p>Szcegółowe Recenzje</p>
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