import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';

export default function Root() {
  const navigate = useNavigate();
  const [Users, GetAllUsersData] = useState([]);

  // Stany dla komunikatów walidacji i sukcesu
  const [errorBoxText, setErrorBoxText] = useState("");
  const [successBoxText, setSuccessBoxText] = useState("");

  // Zunifikowany obiekt danych nowego użytkownika
  const [newUser, changeUserData] = useState({
    mail: '',
    pass: '',
    login: '',
    phone: '',
    discord: ''
  });

  // Pobranie danych użytkowników z bazy w celu lokalnej weryfikacji duplikatów
  const LoadUsersData = () => {
    axios.get(`${axiosPath}/users`).then((res) => {
      GetAllUsersData(res.data);
    });
  };

  React.useEffect(() => {
    LoadUsersData();
  }, []);

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
    let duplicate = false;

    // Sprawdzanie czy podane dane nie dublują istniejących rekordów w bazie
    Users.forEach(user => {
      if (user.login == newUser.login || user.email == newUser.mail || user.phone == newUser.phone || user.discord_tag == newUser.discord) {
        duplicate = true;
      }
    });

    if (currentValidationResult === true) {
      if (duplicate == false) {
        axios.post(`${axiosPath}/users/adduser`, {
          login: newUser.login,
          email: newUser.mail,
          pass: newUser.pass,
          phone: newUser.phone,
          discord_tag: newUser.discord
        })
          .then(() => {
            setSuccessBoxText("Rejestracja zakończona sukcesem! Za chwilę nastąpi przekierowanie do logowania...");

            changeUserData({ mail: '', pass: '', login: '', phone: '', discord: '' });
            setTimeout(() => {
              navigate("/Login", { replace: true });
            }, 2000);
          })
          .catch((err) => {
            setErrorBoxText("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
            console.error(err);
          });
      } else {
        setErrorBoxText("Użytkownik o istniejącym mailu bądź nicku już istnieje.");
      }
    }
  }

  // Funkcja walidująca poprawność wprowadzonych danych (E-mail, Login, Siła hasła)
  function CheckIfDataIsGood() {
    if (newUser.mail && newUser.pass && newUser.login) {
      const mailArr = newUser.mail.split("");
      let ifMailIsGood = { itHasAt: false, itHasCom: false, isItEmail: false };

      mailArr.forEach(char => {
        if (char === "@") ifMailIsGood.itHasAt = true;
        if (char === ".") ifMailIsGood.itHasCom = true;
      });

      if (ifMailIsGood.itHasAt && ifMailIsGood.itHasCom) {
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
        if (/[A-Z]/.test(char)) passwordStrenght.uppercase = true;
        if (/[a-z]/.test(char)) passwordStrenght.lowercase = true;
        if (char.charCodeAt(0) > 47 && char.charCodeAt(0) < 58) passwordStrenght.number = true;
        if (char.charCodeAt(0) > 32 && char.charCodeAt(0) < 44) passwordStrenght.otherChar = true;
      });

      if (newUser.pass.length >= 8) passwordStrenght.isLongEnought = true;

      if (!ifMailIsGood.isItEmail) {
        setErrorBoxText("Email jest nieprawidłowy");
        return false;
      }

      if (newUser.login.length < 5) {
        setErrorBoxText("Nick musi mieć co najmniej pięć znaków.");
        return false;
      }

      if (passwordStrenght.isLongEnought && passwordStrenght.otherChar && passwordStrenght.number && passwordStrenght.lowercase && passwordStrenght.uppercase) {
        passwordStrenght.isPasswordStrongEnought = true;
      } else {
        setErrorBoxText("Hasło musi mieć co najmniej osiem znaków, zawierać jedną dużą i małą literę, cyfrę oraz znak specjalny.");
        return false;
      }

      return true;
    } else {
      setErrorBoxText("Formularz nie został wypełniony.");
      return false;
    }
  }

  return (
    <>
      <div className="container-fluid">
        {/* Nagłówek Strony */}
        <Header showAccountMenu={false} />

        {/* Formularz Rejestracji */}
        <div className='row m-1 text-center font'>
          <h3>REJESTRACJA</h3>
          <div>
            <label>E-mail</label>
            <br />
            <input type="email" name="mail" value={newUser.mail} placeholder='. . .' onChange={handleInputChange} />
          </div>
          <br />
          <div>
            <label>Nick</label>
            <br />
            <input type="text" name="login" value={newUser.login} placeholder='. . .' onChange={handleInputChange} />
          </div>
          <br />
          <div>
            <label>Haslo</label>
            <br />
            <input type="password" name="pass" value={newUser.pass} placeholder='. . .' onChange={handleInputChange} />
          </div>
          <br />
          <div>
            <label>Numer telefonu</label>
            <br />
            <input type="text" name="phone" value={newUser.phone} placeholder='. . .' onChange={handleInputChange} />
          </div>
          <br />
          <div>
            <label>Tag discord</label>
            <br />
            <input type="text" name="discord" value={newUser.discord} placeholder='. . .' onChange={handleInputChange} />
          </div>
          <br />
          <div>
            {errorBoxText && <p id="Error_box" className='text-center fs-3 text-danger'>{errorBoxText}</p>}
            {successBoxText && <p id="Success_box" className='text-center fs-3 text-success'>{successBoxText}</p>}
          </div>
          <br />
          <button className='border border-3 btnsrch' onClick={AddUserToService}>ZAREJESTRUJ SIE</button>
        </div>

        {/* Stopka */}
        <Footer />
      </div>
    </>
  );
}