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

  let isDataGood = false;

  React.useEffect(() => {
    changeUserData({
    mail: inputMail,
    pass: inputPass,
    login: inputLogin,
    phone: inputPhone,
    discord: inputDiscord
  });
  }, [inputMail, inputPass, inputLogin, inputPhone, inputDiscord]);

  const [ifRegistrationWasSuccseful, CreateNewUser] = useState(null);

  function AddUserToService(){
    CheckIfDataIsGood();
    let duplicate = false;

    Users.forEach(user => {
        if(user.login == newUser.login || user.email == newUser.mail || user.phone == newUser.phone || user.discord_tag == newUser.discord){
            duplicate = true;
        }
    });

    if(isDataGood == true){
        console.log("Czy weryfikacja przeszła: ", isDataGood);
        if(duplicate == false){
            console.log("Dane się nie powtarzają w bazie");
            axios.post("http://localhost:3000/users/adduser",{ login: newUser.login, email: newUser.mail, pass: newUser.pass, phone: newUser.phone, discord_tag: newUser.discord });
            console.log("Udało się?");
            navigate("/", {
                      replace: true,
                      state: {
                        login: newUser.login,
                        isLogged: true,
                        discordTag: newUser.discord
                      }
                    });
        } else {
            document.getElementById("Error_box").innerHTML =
            "Użytkownik o istniejącym mailu bądź nicku już istnieje.";
        }
    }
  }

  function CheckIfDataIsGood(){
    document.getElementById("Error_box").innerHTML = "";
    if(newUser.mail != null && newUser.pass != null && newUser.login != null){
        console.log("Dane nie są puste");
        const mailArr = newUser.mail.split("");
        let ifMailIsGood = {
            itHasAt: false,
            itHasCom: false,
            isItEmail: false
        };
        mailArr.forEach(char => {
            if(char === "@"){
                ifMailIsGood.itHasAt = true;
            }

            if(char === "."){
                ifMailIsGood.itHasCom = true;
            }
        });
        if(ifMailIsGood.itHasAt == true && ifMailIsGood.itHasCom == true){
            ifMailIsGood.isItEmail = true;
        }


        let passwordStrenght = {
            uppercase: false,
            lowercase: false,
            number: false,
            otherChar: false,
            isLongEnought: false,
            isPasswordStrongEnought: false
        };
        const passArr = newUser.pass.split("");
        passArr.forEach(char => {
            if(/[A-Z]/.test(char)){
                passwordStrenght.uppercase = true;
            }

            if(/[a-z]/.test(char)){
                passwordStrenght.lowercase = true;
            }

            if(char.charCodeAt(0) > 47 && char.charCodeAt(0) < 58){
                passwordStrenght.number = true;
            }

            if(char.charCodeAt(0) > 32 && char.charCodeAt(0) < 44){
                passwordStrenght.otherChar = true;
            }
        });
        if(newUser.pass.length >= 8){
            passwordStrenght.isLongEnought = true;
        }

        if(ifMailIsGood.isItEmail == false){
            document.getElementById("Error_box").innerHTML =
            "Email jest nieprawidłowy";
        }

        if(newUser.login.length < 5){
            document.getElementById("Error_box").innerHTML =
            "Nick musi mieć conajmniej osiem znaków.";
        }

        if(passwordStrenght.isLongEnought == true && passwordStrenght.otherChar == true && passwordStrenght.number == true 
            && passwordStrenght.lowercase == true && passwordStrenght.uppercase == true
        ){
            passwordStrenght.isPasswordStrongEnought = true;
        } else {
            document.getElementById("Error_box").innerHTML =
            "Hasło musi mieć conajmniej osiem znaków, zawierać jedną dużą i małą literę, cyfrę oraz znak specjalny.";
        }

        if(ifMailIsGood.isItEmail == true && newUser.login.length >= 5 && passwordStrenght.isPasswordStrongEnought == true){
            isDataGood = true;
        }
    } else {
        document.getElementById("Error_box").innerHTML =
        "Formularz nie został wypełniony.";
    }
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
            <label>Nick</label>
            <br></br>
            <input type="text" placeholder='. . .' onChange={(e) => changeInputLogin(e.target.value)}/>
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