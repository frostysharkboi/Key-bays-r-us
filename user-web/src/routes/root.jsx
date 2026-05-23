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
  const location = useLocation();

  function RedirectToSeaching(e) {
    if(e == null){
      navigate("/Search", {state: {Title: SearchThisTitle, userId: UserData.id, isLogged: UserData.isLogged}});
    } else {
      navigate("/Search", {state: {GenreId: e, userId: UserData.id, isLogged: UserData.isLogged}});
    }
  }

  function RedirectToGamePage(e){
    navigate('/Game',{state:{GameId: e, userId: UserData.id, isLogged: UserData.isLogged}});
  }

  function RedirectToStorefront(){
    navigate('/', {state: {userId: UserData.id, isLogged: UserData.isLogged}});
  }
  
  function GoToLoginPage(){
    navigate("Login", {replace: true})
  }

  //Kod odpowiedzialny za logowanie.
  
  const [UserData, GetUserData] = useState({
    id: null,
    login: null,
    isLogged: false,
    discordTag: null
  });

  React.useEffect(() => {
    if(location.state != null){
      console.log("Przed pobraniem danych z loginu");
      axios.get("http://localhost:3000/users/byid", {params: {id: location.state.userId}}).then((res) => {
        console.log(res.data);
        GetUserData({
          id: res.data[0].id,
          login: res.data[0].login,
          isLogged: true,
          discordTag: res.data[0].discord_tag
        })
      });
    }
    console.log("UseEffect miał już miejsce");
  }, [location.state]);

  React.useEffect(() => {
    console.log("ROOT.JSX\nOTRZYMANE DANE:\n", UserData);
        if(UserData.login == null){
          document.getElementById("nick").innerHTML = "Gosc";
        } else {
          document.getElementById("nick").innerHTML = UserData["login"];
        }
  }, [UserData])

  
  //console.log(UserData["login"]);

  function LogOut(){
    GetUserData(null);

    navigate("/", {
      replace: true,
      state: null
    });
  }

//Test
  
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
          <button className="dropbtn font" id="nick"></button>
            <div className="dropdown-content fw-bold">
               {!UserData?.isLogged && (
                  <h5 onClick={GoToLoginPage}>
                    Zaloguj sie
                  </h5>
                )}
              {UserData?.isLogged && (
                <>
                  <h5 onClick={() => navigate('Wishlist', {state: {userId: UserData.id, isLogged: UserData.isLogged}})}>Lista życzeń</h5>

                  <h5>Zarządzaj kontem</h5>

                  <h5 onClick={LogOut}>
                    Wyloguj sie
                  </h5>
                </>
              )}
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
      Jakub----> Zrobiłem =) ale chyba jeszcze przekierowania trzeba zrobić.
      */}

      {tags.map((row)=>(
        <a onClick={() => RedirectToSeaching(parseInt(row.id))}>
          <div className="card rounded-0 border tag border-3 font col p-4 m-3" key={row.id}>
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