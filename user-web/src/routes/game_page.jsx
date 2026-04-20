import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './root.css';

export default function Root(){

  const [game, setGame] = useState([]);               // Dane gier z bazy danych

  const navigate = useNavigate();
  const location = useLocation();

  var GameId = location.state.GameId;
  console.log(GameId);

  // Pobranie danych z tabeli
  const getGame = () => {
    console.log("getgame 1");
    axios.get("http://localhost:3000/games/alldata", { params: { game_id: GameId }}).then((res) => {
      setGame(res.data);
    });
  };
  React.useEffect(() => {
    getGame();
  }, []);

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
          <h2>{(game[0])?  game[0].title : "Title"}</h2>
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