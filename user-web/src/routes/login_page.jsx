import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { UserContext } from '../components/user-context/UserContext';
import { BrowserRouter, Routes, Route, Link, replace, useNavigate, useLocation } from 'react-router-dom';
import './root.css'
import { axiosPath } from "../App";
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';

export default function Root() {
  const navigate = useNavigate();
  const { setUserData } = useContext(UserContext);

  const [globalFilter, setGlobalFilter] = useState(""); // Filtry
  const [sorting, setSorting] = useState([]);           // Sortowanie
  const [pagination, setPagination] = useState({        // Wybrana strona:
    pageIndex: 0,                                       //    aktualna strona
    pageSize: 5,                                        //    ilość rekordów na strone
  });

  const [Users, GetAllUsersData] = useState([]);

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
        discordTag: foundUser.discord_tag,
        type: foundUser.type
      });

      navigate("/", { replace: true });

    } else {
      setErrorBoxText("Email lub hasło są nieprawidłowe.");
    }
  }

  function RedirectToStorefront() {
    navigate('/');
  }

  return (
    <>
      <div className="container-fluid">
        {/* Nagłówek Strony */}
        <Header showAccountMenu={false} />

        {/* Box z loginem */}
        <div className='row m-1 text-center font'>
          <h3>LOGOWANIE</h3>
          <div>
            <label>Email</label>
            <br></br>
            <input type="text" name='input_login' id="input_login" value={Input_Login} placeholder='. . .' onChange={(e) => changeInputLogin(e.target.value)} />
            <br></br>
            <label></label>
          </div>
          <br></br>
          <div>
            <label>Haslo</label>
            <br></br>
            <input type="password" name='input_pass' id="input_pass" value={Input_Pass} placeholder='. . .' onChange={(e) => changeInputPass(e.target.value)} />
            <br></br>
          </div>
          <div>
            {/* Wyświetlanie błędu zarządzane przez React Context / State */}
            <p id="Error_box" className='text-center fs-3 text-danger'>{errorBoxText}</p>
          </div>
          <br></br>
          <button className='border border-3' onClick={CheckIfLoginIsInDb}>ZALOGUJ SIE</button>
          <h5 className='noaccount' onClick={() => navigate("/Register", { replace: true })}>Nie mam konta</h5>
        </div>

        {/* Stopka */}
        <Footer />
      </div>
    </>
  )
}