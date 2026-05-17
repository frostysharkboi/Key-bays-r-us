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

  var IsUserLogged = false;
  
  const navigate = useNavigate();

  // Pobranie danych z tabeli
  const LoadUsersData = () => {
    axios.get("http://localhost:3000/users").then((res) => {
      GetAllUsersData(res.data);
    });
  };

  function CheckIfLoginIsInDb(){
    //Foreach nie wie, co to break, więc zajebałem to z StackOverflow
    for (const temp of Users){
      if(temp.email == Input_Login && temp.pass == Input_Pass){
        document.getElementById("Error_box").innerHTML = "";
        console.log("Zgadza się.");
        IsUserLogged = true;
        break;
      } else {
        console.log("Nie zgadza się.");
        document.getElementById("Error_box").innerHTML = "Email lub hasło są nieprawidłowe.";
        IsUserLogged = false;
      }
    }
  }
  

  function TryToLogIn(){
    //Sprawdź, czy dane z form są git
    CheckIfLoginIsInDb();

    if(IsUserLogged == true){
      //Jeżeli się one zgadzają, to pobierz dane tego użytkownika i wyjeb spowrotem na strone główną.
      axios.get("https://localhost:3000/users/byemail", {params: {email: Input_Login}}).then((res) => {
        ChangeLoggedUser(res.data);
      });
      //navigate("/", {replace: true}, {state: {Login: LoggedUser.login, IsLogged: IsUserLogged, Discord: LoggedUser.discord_tag}})
      console.log(LoggedUser.login);
      
    }

    console.log(Users);
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
          <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...'/>
          <button>szukaj</button>
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

      {/* Box z loginem */}
      <div className='row m-1 text-center font'>
          <h3>LOGOWANIE</h3>
          <div>
            <label>Login</label>
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
            <p id="Error_box" className='text-center fs-3 text-danger'></p>
          </div>
          <button onClick={() => TryToLogIn()}>ZALOGUJ SIĘ</button>
          <a href="">Nie mam konta</a>
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