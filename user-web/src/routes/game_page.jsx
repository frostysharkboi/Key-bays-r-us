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
          <h2>{(game[0])?  game[0].title : "Nie znaleziono"}</h2>
        </div>
      </div>

      {/* Wiersz z media, tagami, recenzjami i etc */}
      <div className='row m-3 p-3 text-center'>
        {/* Media */}
        <div className='col-7'>
          <img src={(game[0])?  game[0].cover_img : "Nie znaleziono"}/>
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
              <p>Data Wydania: {(game[0])?  game[0].release_date : "Nie znaleziono"}</p>
              <p>Developer: {(game[0])?  game[0].publisher : "Nie znaleziono"}</p>
            </div>
        </div>
      </div>

      {/* Opis Gry i wymagania */}
      <div className='row m-3 p-3 text-center'>
        {/* Opis Gry */}
        <div className='col-7'>
          <p>{(game[0])?  game[0].about : "Nie znaleziono"}</p>
        </div>
        {/* Div z obydwoma wymaganiami */}
        <div className='col-5 d-flex'>
          {/* Zalecane */}
          <div className='m-4'>
            <h3>Zalecane Wymagania</h3>
            <p>
              System Operacyjny: {(game[0])?  game[0].opt_os : "Nie znaleziono"}<br/>
              Karta Graficzna: {(game[0])?  game[0].opt_gpu : "Nie znaleziono"}<br/>
              Procesor: {(game[0])?  game[0].opt_cpu : "Nie znaleziono"}<br/>
              Pamięć ram: {(game[0])?  game[0].opt_ram : "Nie znaleziono"} GB<br/>
              Potrzebne miejsce: {(game[0])?  game[0].opt_size : "Nie znaleziono"} GB
            </p>
          </div>

          <br/>

          {/* Minimalne */}
          <div className='m-4'>
            <h3>Minimalne Wymagania</h3>
            <p>
              System Operacyjny: {(game[0])?  game[0].min_os : "Nie znaleziono"}<br/>
              Karta Graficzna: {(game[0])?  game[0].min_gpu : "Nie znaleziono"}<br/>
              Procesor: {(game[0])?  game[0].min_cpu : "Nie znaleziono"}<br/>
              Pamięć ram: {(game[0])?  game[0].min_ram : "Nie znaleziono"} GB<br/>
              Potrzebne miejsce: {(game[0])?  game[0].min_size : "Nie znaleziono"} GB
            </p>
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