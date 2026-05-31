import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { UserContext } from '../../public/user-context/UserContext';
import { BrowserRouter, Routes, Route, Link, replace, useNavigate, useLocation  } from 'react-router-dom';
import './root.css'
import { axiosPath } from "../App";

export default function Root(){
  const navigate = useNavigate();
  const { setUserData } = useContext(UserContext);
  
  const [globalFilter, setGlobalFilter] = useState(""); // Filtry
  const [sorting, setSorting] = useState([]);           // Sortowanie
  const [pagination, setPagination] = useState({        // Wybrana strona:
    pageIndex: 0,                                       //    aktualna strona
    pageSize: 5,                                        //    ilość rekordów na strone
  });

  const [Users, GetAllUsersData] = useState([]);
  const [SearchThisTitle, changeTitle] = useState(null);
  
  const [errorBoxText, setErrorBoxText] = useState("");

  const LoadUsersData = () => {
    axios.get(`${axiosPath}/users`).then((res) => {
      GetAllUsersData(res.data);
    });
  };

  React.useEffect(() => {
    LoadUsersData();
  }, []);

  const [Input_Login, changeInputLogin] = useState(""); 
  const [Input_Pass, changeInputPass] = useState(""); 

  function CheckIfLoginIsInDb() {
    setErrorBoxText("");

    const foundUser = Users.find(
      (temp) =>
        temp.email === Input_Login &&
        temp.pass === Input_Pass
    );

    if (foundUser) {
      setUserData({
        id: foundUser.id,
        login: foundUser.login,
        isLogged: true,
        discordTag: foundUser.discord_tag
      });

      navigate("/", { replace: true });

    } else {
      setErrorBoxText("Email lub hasło są nieprawidłowe.");
    }
  }

  function RedirectToStorefront(){
    navigate('/');
  }

  function RedirectToSeaching(e) {
    if(e == null){
      navigate("/Search", {state: {Title: SearchThisTitle}});
    } else {
      navigate("/Search", {state: {GenreId: e}});
    }
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

        {/* Logo */}
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
            <input type="text" name='input_login' id="input_login" value={Input_Login} placeholder='. . .' onChange={(e) => changeInputLogin(e.target.value)}/>
            <br></br>
            <label></label>
          </div>
          <br></br>
          <div>
            <label>Hasło</label>
            <br></br>
            <input type="password" name='input_pass' id="input_pass" value={Input_Pass} placeholder='. . .' onChange={(e) => changeInputPass(e.target.value)}/>
            <br></br>
          </div>
          <div>
            {/* Wyświetlanie błędu zarządzane przez React Context / State */}
            <p id="Error_box" className='text-center fs-3 text-danger'>{errorBoxText}</p>
          </div>
          <br></br>
          <button className='border border-3' onClick={CheckIfLoginIsInDb}>ZALOGUJ SIĘ</button>
          <h5 className='noaccount' onClick={() => navigate("/Register", {replace: true})}>Nie mam konta</h5>
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