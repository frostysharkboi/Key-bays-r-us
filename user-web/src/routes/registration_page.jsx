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
  
  const navigate = useNavigate();

  // Pobranie danych z tabeli
  const LoadUsersData = () => {
    axios.get("http://localhost:3000/users").then((res) => {
      GetAllUsersData(res.data);
    });
  };

  

  React.useEffect(() => {
    LoadUsersData();
  }, []);

  const [inputMail, changeInputMail] = useState(null);
  const [inputPass, changeInputPass] = useState(null); 
  const [inputLogin, changeInputLogin] = useState(null);
  const [inputPhone, changeInputPhone] = useState(null);
  const [inputDiscord, changeInputDiscord] = useState(null); 

  const [newUser, changeUserData] = useState({
    mail: null,
    pass: null,
    login: null,
    phone: null,
    discord: null
  });

  React.useEffect(() => {
    changeUserData({
    mail: inputMail,
    pass: inputPass,
    login: inputLogin,
    phone: inputPhone,
    discord: inputDiscord
  });

  console.log(newUser);
  }, [inputMail, inputPass, inputLogin, inputPhone, inputDiscord]);

  const [ifRegistrationWasSuccseful, CreateNewUser] = useState(null);

  function AddUserToService(){
    document.getElementById("Error_box").innerHTML = "";
    let duplicate = false;

    Users.forEach(user => {
        if(user.login == newUser.login || user.email == newUser.mail || user.phone == newUser.phone || user.discord_tag == newUser.discord){
            duplicate = true;
        }
    });

    if(duplicate == false){
        if(newUser.login != null && newUser.login.length > 0 && newUser.pass != null  && newUser.pass.length > 0 && newUser.mail != null && newUser.mail.length > 0){
            axios.post("http://localhost:3000/users/adduser",{ login: newUser.login, email: newUser.mail, pass: newUser.pass, phone: newUser.phone, discord_tag: newUser.discord });
            console.log("Udało się?");
        } else {
            document.getElementById("Error_box").innerHTML =
            "Email lub hasło są nieprawidłowe.\nFormularz nie został wypełniony.";
        }
    } else {
        document.getElementById("Error_box").innerHTML =
        "Email lub hasło są nieprawidłowe.\nDane się powtarzają.";
    }
  }

  function CheckIfDataIsGood(){
    
  }
  

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
            <label>E-mail</label>
            <br></br>
            <input type="email" placeholder='. . .' onChange={(e) => changeInputMail(e.target.value)}/>
            <br></br>
            <label></label>
          </div>
          <br></br>
          <div>
            <label>Hasło</label>
            <br></br>
            <input type="password" placeholder='. . .' onChange={(e) => changeInputPass(e.target.value)}/>
            <br></br>
          </div>
          <br></br>
          <div>
            <label>Nick</label>
            <br></br>
            <input type="text" placeholder='. . .' onChange={(e) => changeInputLogin(e.target.value)}/>
            <br></br>
            <label></label>
          </div>
          <br></br>
          <div>
            <label>Numer telefonu</label>
            <br></br>
            <input type="text" placeholder='. . .' onChange={(e) => changeInputPhone(e.target.value)}/>
            <br></br>
            <label></label>
          </div>
          <br></br>
          <div>
            <label>Tag discord</label>
            <br></br>
            <input type="text" placeholder='. . .' onChange={(e) => changeInputDiscord(e.target.value)}/>
            <br></br>
            <label></label>
          </div>
          <br></br>
          <div>
            <p id="Error_box" className='text-center fs-3 text-danger'></p>
          </div>
          <br></br>
          <button onClick={() => AddUserToService()}>ZAREJESTRUJ SIĘ</button>
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