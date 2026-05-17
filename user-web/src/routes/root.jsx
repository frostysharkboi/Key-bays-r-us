import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './root.css'

export default function Root(){

  // UseState do operacji na danych

  const [games, setGames] = useState([]);               // Dane gier z bazy danych
  const [formatedGames, setFormatedGames] = useState([]);               // Dane gier z bazy danych
  const [tags, setTags] = useState([]);                 // Dane tagów z bazy danych

  // Pobranie danych z tabeli
  const getGames = () => {
    axios.get("http://localhost:3000/games/cover").then((res) => {
      setGames(res.data);

      const mapped = res.data.map(e => ({
        id: e.id,
        title: e.title,
        about: e.about,
        cover_img: e.cover_img,
      }));

      setFormatedGames(mapped);
    });
  };
  const getAllTags = () => {
    axios.get("http://localhost:3000/tags").then((res) => {
      setTags(res.data);
    });
  };

  React.useEffect(() => {
    getGames();
  }, []);
  React.useEffect(() => {
    if (formatedGames.length > 0) {
      getAllTags();
    }
  }, [formatedGames]);

  const [SearchThisTitle, changeTitle] = useState(null);
  const navigate = useNavigate();

  function RedirectToSeaching(e) {
    if(e == null){
      navigate("Wyszukiwarka-Test", {state: {Title: SearchThisTitle}});
    } else {
      navigate("Wyszukiwarka-Test", {state: {GenreId: e}});
    }
  }

  function RedirectToGamePage(e){
    navigate('Wyszukiwarka-Test/GamePage-Test',{state:{GameId: e}});
  }

  function RedirectToStorefront(e){
    navigate('/');
  }
  
  function GoToLoginPage(){
    navigate("LoginPage-Test", {replace: true})
  }

    return (
    <>
    <div className="container-fluid">
      {/*Nagłówek Strony*/}
      <div className="row m-3 p-3 text-center">

        {/* Wyszukiwarka */}
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...' onChange={(e) => changeTitle(e.target.value)}/>
          <button className='border border-3 btnsrch' onClick={() => RedirectToSeaching(null)}>SZUKAJ</button>
        </div>

        {/* Logo, wiadomo */}
        <div className='col-4 fw-bolder logo'>
          <h1 onClick={RedirectToStorefront}>Keys &apos;R&apos; Us</h1>
        </div>

         {/* Dropdown menu konta */}
        <div className='col-4'>
          <div className="dropdown">
          <button className="dropbtn font">Dropdown</button>
            <div className="dropdown-content fw-bold">
              <a href="#" onClick={() => GoToLoginPage()}>Link 1</a>
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

            {formatedGames.map(e=>{
              return(
                <div className={(e == formatedGames[0])? "carousel-item active":"carousel-item"} data-bs-interval="300" onClick={() => RedirectToGamePage(e.id)}>
                  <img src={e.cover_img} className="mx-auto d-block w-25 h-25" alt="..."/>
                  <div className="carousel-caption d-none d-md-block">
                    <h5 className="font">{e.title}</h5>
                    <p className='discount'>{e.about}</p>
                  </div>
                </div>
              )
            })}

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
      */}

      {tags.map((row)=>(
        <a onClick={() => RedirectToSeaching(parseInt(row.id))}>
          <div className="card rounded-0 border border-3 font col p-4 m-3" key={row.id}>
              <div className="card-body w-40">
                {/*<img src={row.icon} alt={row.tag}/>*/}
                <p className="card-text w-40 fw-bold">{row.tag}</p>
              </div>
          </div>
        </a>
        ))
      }
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