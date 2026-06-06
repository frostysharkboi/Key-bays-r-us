import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";
import { UserContext } from '../components/user-context/UserContext';
import { main } from '@popperjs/core';
import Header from '../components/header/Header';

export default function Root() {
  const navigate = useNavigate();
  const [Users, GetAllUsersData] = useState([]);

  // Stany dla komunikatów walidacji i sukcesu
  const [errorBoxText, setErrorBoxText] = useState("");
  const [successBoxText, setSuccessBoxText] = useState("");
  const [Changed, setChanged] = useState(0);

  const [allUsers, getAllUsers] = useState(null);
  const [mainUser, GetMainUser] = useState(null);
  const { userData, logout } = useContext(UserContext);

  // Zunifikowany obiekt danych nowego użytkownika
  const [newUser, changeUserData] = useState(null);

  // Pobranie danych użytkowników z bazy w celu lokalnej weryfikacji duplikatów
  const LoadUsersData = () => {
    axios.get(`${axiosPath}/users`).then((res) => {
      GetAllUsersData(res.data);
    });
  };

  React.useEffect(() => {
    LoadUsersData();

    axios.get(`${axiosPath}/users`).then((res) => {
      getAllUsers(res.data);
    });

    console.log(userData);
  }, []);

  useEffect(() => {
    if (allUsers != null) {
      allUsers.forEach(user => {
        if (user.id == userData.id) {
          GetMainUser(user);
        }
      });
    }
  }, [allUsers]);

  useEffect(() => {
    if (mainUser != null) {
      console.log(mainUser);
      changeUserData({
        id: mainUser.id,
        mail: mainUser.email,
        pass: mainUser.pass,
        login: mainUser.login,
        phone: mainUser.phone,
        discord: mainUser.discord_tag,
        type: mainUser.type
      })
    }
  }, [mainUser]);

  // Uniwersalny handler dla wszystkich pól formularza
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    changeUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Główna funkcja rejestrująca użytkownika w systemie
  function AddUserToService() {
    setErrorBoxText("");
    setSuccessBoxText("");

    const currentValidationResult = CheckIfDataIsGood();

    if (currentValidationResult == true) {
      console.log("Chyba pasi");
      axios.post(`${axiosPath}/users/updateUser`, { id: newUser.id, login: newUser.login, pass: newUser.pass, phone: newUser.phone, discord_tag: newUser.discord, email: newUser.mail })
        .then(() => {
          console.log("Chyba przeszło?");
          alert("Dane użytkownika zostały zaktualizowane");
          const newSessionData = {
            id: newUser.id,
            login: newUser.login,
            isLogged: true,
            discord_tag: newUser.discord,
            type: newUser.type
          }
          const jsonData = JSON.stringify(newSessionData);
          localStorage.setItem("user_session", jsonData);
          window.location.reload();
        }).catch((err) => {
          alert("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
          console.error(err);
        });
    }

  }

  // Funkcja walidująca poprawność wprowadzonych danych (E-mail, Login, Siła hasła)
  function CheckIfDataIsGood() {
    if (Changed == 1) {
      console.log(Changed);
      if (newUser.login.length < 5) {
        setErrorBoxText("Nick musi mieć co najmniej pięć znaków.");
        return false;
      } else if (newUser.login == mainUser.login) {
        setErrorBoxText("Nowy nick nie może być identyczny do starego.");
        return false;
      }
      return true;
    } else if (Changed == 2) {
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
        if (/[A-Z]/.test(char)) passwordStrenght.uppercase = true;
        if (/[a-z]/.test(char)) passwordStrenght.lowercase = true;
        if (char.charCodeAt(0) > 47 && char.charCodeAt(0) < 58) passwordStrenght.number = true;
        if (char.charCodeAt(0) > 32 && char.charCodeAt(0) < 44) passwordStrenght.otherChar = true;
      });

      if (newUser.pass.length >= 8) passwordStrenght.isLongEnought = true;

      if (passwordStrenght.isLongEnought && passwordStrenght.otherChar && passwordStrenght.number && passwordStrenght.lowercase && passwordStrenght.uppercase && newUser.pass != mainUser.pass) {
        passwordStrenght.isPasswordStrongEnought = true;
      } else {
        if (newUser.pass == mainUser.pass) {
          setErrorBoxText("Nowe hasło nie może być identyczne do starego.");
        } else {
          setErrorBoxText("Hasło musi mieć co najmniej osiem znaków, zawierać jedną dużą i małą literę, cyfrę oraz znak specjalny.");
        }
        return false;
      }

      return true;
    } else if (Changed == 3) {

      const mailArr = newUser.mail.split("");
      let ifMailIsGood = { itHasAt: false, itHasCom: false, isItEmail: false };

      mailArr.forEach(char => {
        if (char === "@") ifMailIsGood.itHasAt = true;
        if (char === ".") ifMailIsGood.itHasCom = true;
      });

      if (ifMailIsGood.itHasAt && ifMailIsGood.itHasCom && newUser.mail != mainUser.email) {
        ifMailIsGood.isItEmail = true;
      }

      if (!ifMailIsGood.isItEmail) {
        if (newUser.mail == mainUser.email) {
          setErrorBoxText("Nowy email nie może być identyczny do starego");
        } else {
          setErrorBoxText("Email jest nieprawidłowy");
        }
        return false;
      }

      return true;
    } else if (Changed == 4) {
      if (newUser.phone != null && newUser.phone != mainUser.phone) {
        return true;
      }
      if (newUser.phone == mainUser.phone) {
        setErrorBoxText("Nowy numer telefonu nie może być identyczny do starego");
      }
      return false;
    } else if (Changed == 5) {
      if (newUser.discord != null && newUser.discord != mainUser.discord_tag) {
        return true;
      }
      if (newUser.discord == mainUser.discord_tag) {
        setErrorBoxText("Nowy tag na discordzie nie może być identyczny do starego");
      }
      return false;
    }
  }

  function LogOutUser() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <>
      <div className="container-fluid">
        <Header />

        {/* Formularz Rejestracji */}
        <div className='row m-1 text-center font'>
          <h3>EDYCJA KONTA</h3>
          <div>
            <h4>Wybierz, co chcesz zmienić</h4>
            <select value={Changed} onChange={(e) => { setChanged(e.target.value); console.log(e.target.value) }}>
              <option value>Wybierz jaką chcesz wykonać akcję</option>
              <option value="1" name="login">Nick</option>
              <option value="2" name="pass">Hasło</option>
              <option value="3" name="mail">E-mail</option>
              <option value="4" name="phone">Numer telefonu</option>
              <option value="5" name="discord">Tag discord</option>
            </select>
          </div>
          {Changed == 1 && (
            <div>
              <label>Nick</label>
              <br />
              <input type="text" name="login" value={newUser.login} placeholder='. . .' onChange={handleInputChange} />
            </div>
          )}
          {Changed == 2 && (
            <div>
              <label>Haslo</label>
              <br />
              <input type="password" name="pass" value={newUser.pass} placeholder='. . .' onChange={handleInputChange} />
            </div>
          )}
          {Changed == 3 && (
            <div>
              <label>E-mail</label>
              <br />
              <input type="email" name="mail" value={newUser.mail} placeholder='. . .' onChange={handleInputChange} />
            </div>
          )}
          {Changed == 4 && (
            <div>
              <label>Numer telefonu</label>
              <br />
              <input type="text" name="phone" value={newUser.phone} placeholder='. . .' onChange={handleInputChange} />
            </div>
          )}
          {Changed == 5 && (
            <div>
              <label>Tag discord</label>
              <br />
              <input type="text" name="discord" value={newUser.discord} placeholder='. . .' onChange={handleInputChange} />
            </div>
          )}
          {Changed > 0 && (
            <div>
              <div>
                {errorBoxText && <p id="Error_box" className='text-center fs-3 text-danger'>{errorBoxText}</p>}
                {successBoxText && <p id="Success_box" className='text-center fs-3 text-success'>{successBoxText}</p>}
              </div>
              <br />
              <button className='border border-3 btnsrch' onClick={AddUserToService}>ZAPISZ ZMIANY</button>
            </div>
          )}
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
  );
}