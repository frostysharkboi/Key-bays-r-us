import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './root.css';

export default function Root(){

  const [game, setGame] = useState([]);               // Dane gier z bazy danych
  const [tags, setTags] = useState([]);                 // Dane tagów z bazy danych
  const [connectedTags, uptadeTags] = useState([]);   // Lista tagów gier.
  const [reviews, updateReviews] = useState([]);      // Lista Recenzji

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

  const getAllTags = () => {
    axios.get("http://localhost:3000/tags").then((res) => {
      setTags(res.data);
    });
  };

  const getSomeTags = () => {
    axios.get("http://localhost:3000/game_tags").then((res) => {
      uptadeTags(res.data);
    });
  };

  const getAllReviews = () => {
    axios.get("http://localhost:3000/ratings").then((res) => {
      updateReviews(res.data);
    });
  };

  function WypiszTagi(){
    var powiązaneTagi = [];
    if(connectedTags){
      connectedTags.map(e => {
        tags.map(f => {
          if(e.game_id == GameId){
            if(e.tag_id == f.id){
              powiązaneTagi.push(f.tag);
            }
          }
        })
      })
    }
    console.log("Powiązane Tagi")
    console.log(powiązaneTagi)

    return (<>
      {powiązaneTagi.map(e => (
        <i> {e} | </i>
      ))}
    </>);
  }

  function WypiszRecenzje(){
    var powiązaneRecenzje = [];
    if(reviews){
      reviews.map(e => {
        if(e.game_id == GameId){
          powiązaneRecenzje.push("Ocena: ", e.rating, " | Opis: ", e.other);
        }
      })
    }
    console.log("Powiązane Recenzje")
    console.log(powiązaneRecenzje)

    if(powiązaneRecenzje.length > 0){
      return (<>
        {powiązaneRecenzje.map(e => (
          <i> {e} </i>
        ))}
      </>)
    } else {
      return (<>
        <p>BRAK RECENZJI</p>
      </>)
    }
  }

  function SredniaRecenzji(){
    var sumaRecenzji = 0;
    var liczbaPetli = 0;

    if(reviews){
      reviews.map(e => {
        if(e.game_id == GameId){
          sumaRecenzji += e.rating;
          liczbaPetli += 1;
        }
      })
    }

    if(liczbaPetli > 0){
      sumaRecenzji /= liczbaPetli;
      return (<>
        <p>Oceny: {sumaRecenzji} / 5</p>
      </>)
    } else {
      return(<>
        <p>BRAK RECENZJI</p>
      </>)
    }
  }

  
  React.useEffect(() => {
    getGame();
    getAllTags();
    getSomeTags();
    getAllReviews();
  }, []);

  const [SearchThisTitle, changeTitle] = useState(null);
  function RedirectToSeaching(e) {
    if(e == null){
      navigate(-1, {state: {Title: SearchThisTitle}});
    } else {
      navigate(-1, {state: {GenreId: e}});
    }
  }

    return (
    <>
    {console.log(tags)}
    {console.log(connectedTags)}
    {console.log(reviews)}
    <div className="container-fluid">
      {/*Nagłówek Strony*/}
      <div className="row m-3 p-3 text-center">

        {/* Wyszukiwarka */}
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...'/>
          <button onClick={() => RedirectToSeaching(null)}>SZUKAJ</button>
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
              <p>{SredniaRecenzji()}</p>
              {/* Dodawnanie recenzji będzie działało na nested podstronie */}
            </div>
            <br/>
            {/* Tagi */}
            <div>
              <p>Tagi</p>
              <p>|{WypiszTagi()}</p>
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
        <h3>TBD</h3>
      </div>

      {/* Recenzje - Szczegóły */}
      <div className='row m-3 p-3 text-center'>
        <p>Szcegółowe Recenzje</p>
        <p>{WypiszRecenzje()}</p>
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