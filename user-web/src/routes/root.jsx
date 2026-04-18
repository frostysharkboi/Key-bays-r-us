import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './root.css'

export default function Root(){

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

  const [SearchThisTitle, changeTitle] = useState(null);
  const navigate = useNavigate();

  function RedirectToSeaching(e) {
    navigate("Wyszukiwarka-Test", {state: {Title: SearchThisTitle, GenreId: e}});
  }

    return (
    <>
    <div className="container-fluid">
      {/*Nagłówek Strony*/}
      <div className="row m-3 p-3 text-center">

        {/* Wyszukiwarka */}
        <div className='col-4'>
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...' onChange={(e) => changeTitle(e.target.value)}/>
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
      */}
      
        <a onClick={() => RedirectToSeaching("1")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
              <div className="card-body w-40">
                <p className="card-text w-40 fw-bold">RPG</p>
              </div>
          </div>
        </a>
        
        <a onClick={() => RedirectToSeaching("2")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
              <div className="card-body w-40">
                <p className="card-text w-40 fw-bold">Action</p>
              </div>
          </div>
        </a>
        
        <a onClick={() => RedirectToSeaching("3")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Open World</p>
            </div>
          </div>
        </a>
        
        <a onClick={() => RedirectToSeaching("4")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">FPS</p>
            </div>
          </div>
        </a>
        
        <a onClick={() => RedirectToSeaching("5")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Adventure</p>
            </div>
          </div>
        </a>
        
        <a onClick={() => RedirectToSeaching("6")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Multiplayer</p>
            </div>
          </div>
        </a>
        
        <a onClick={() => RedirectToSeaching("7")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Strategy</p>
            </div>
          </div>
        </a>
        
        <a onClick={() => RedirectToSeaching("8")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Simulation</p>
            </div>
          </div>
        </a>
        
        <a onClick={() => RedirectToSeaching("9")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Horror</p>
            </div>
          </div>
        </a>

        <a onClick={() => RedirectToSeaching("10")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Indie</p>
            </div>
          </div>
        </a>

        <a onClick={() => RedirectToSeaching("11")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Survival</p>
            </div>
          </div>
        </a>

        <a onClick={() => RedirectToSeaching("12")}>
          <div className="card rounded-0 border border-3 font col p-4 m-3">
            <div className="card-body w-40">
              <p className="card-text w-40 fw-bold">Sandbox</p>
            </div>
          </div>
        </a>
        

      {/*
      
      {data.map((tags) => (
          <div className="card col p-4 m-3" key={tags.id}>
            <div className="card-body w-40">
              <p className="card-text w-40">{tags.tag}</p>
            </div>
          </div>
      ))}
      
      */}
        

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