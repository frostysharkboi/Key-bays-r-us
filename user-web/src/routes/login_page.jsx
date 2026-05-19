import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, replace, useNavigate, useLocation  } from 'react-router-dom';
import './root.css'

export default function Root(){

  // UseState do operacji na danych
  const [globalFilter, setGlobalFilter] = useState(""); // Filtry
  const [sorting, setSorting] = useState([]);           // Sortowanie
  const [pagination, setPagination] = useState({        // Wybrana strona:
    pageIndex: 0,                                       //    aktualna strona
    pageSize: 5,                                        //    ilośc rekordów na strone
  });

  const [Users, GetAllUsersData] = useState([]);
  const [LoggedUser, ChangeLoggedUser] = useState([]);

  const [IsUserLogged, setIsUserLogged] = useState(false);
  const [SearchThisTitle, changeTitle] = useState(null);

  const [UserData, GetUserData] = useState({
      login: null,
      isLogged: false,
      discordTag: null
    });
  
  const navigate = useNavigate();

  // Pobranie danych z tabeli
  const LoadUsersData = () => {
    axios.get("http://localhost:3000/users").then((res) => {
      GetAllUsersData(res.data);
    });
  };

  function CheckIfLoginIsInDb() {

    const user = Users.find(
      (temp) =>
        temp.email === Input_Login &&
        temp.pass === Input_Pass
    );

    if(user){

      document.getElementById("Error_box").innerHTML = "";

      setIsUserLogged(true);

      axios.get("http://localhost:3000/users/byemail", {
        params: {
          email: Input_Login
        }
      })
      .then((res) => {
        navigate("/", {
          replace: true,
          state: {
            userId: res.data[0].id
          }
        });

        //console.log(res.data);

      });

    } else {

      document.getElementById("Error_box").innerHTML =
        "Email lub hasło są nieprawidłowe.";

      setIsUserLogged(false);
    }
}
  function RedirectToStorefront(){
    navigate('/', {state: {login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
  }

  function RedirectToSeaching(e) {
    if(e == null){
      navigate("/Search", {state: {Title: SearchThisTitle, login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
    } else {
      navigate("/Search", {state: {GenreId: e, login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
    }
  }

  function RedirectToSeaching(e) {
    if(e == null){
      navigate("/Search", {state: {Title: SearchThisTitle, login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
    } else {
      navigate("/Search", {state: {GenreId: e, login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
    }
  }

  React.useEffect(() => {
    LoadUsersData();
  }, []);

  const [Input_Login, changeInputLogin] = useState(""); 
  const [Input_Pass, changeInputPass] = useState(""); 

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
      </div>

      {/* Box z loginem */}
      <div className='row m-1 text-center font'>
          <h3>LOGOWANIE</h3>
          <div>
            <label>Email</label>
            <br></br>
            <input type="text" name='input_login' id="input_login" placeholder='. . .' onChange={(e) => changeInputLogin(e.target.value)}/>
            <br></br>
            <label></label>
          </div>
          <br></br>
          <div>
            <label>Hasło</label>
            <br></br>
            <input type="password" name='input_pass' id="input_pass" placeholder='. . .' onChange={(e) => changeInputPass(e.target.value)}/>
            <br></br>
          </div>
          <div>
            <p id="Error_box" className='text-center fs-3 text-danger'></p>
          </div>
          <br></br>
          <button onClick={() => CheckIfLoginIsInDb()}>ZALOGUJ SIĘ</button>
          <h5 onClick={() => navigate("/Register", {replace: true})}>Nie mam konta</h5>
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