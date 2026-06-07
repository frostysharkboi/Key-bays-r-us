import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './root.css';
import { axiosPath } from "../App";
import { UserContext } from '../components/user-context/UserContext';
import { main } from '@popperjs/core';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation()
  const [Users, GetAllUsersData] = useState(null);

  const [SelectedUser, SetMainUser] = useState(null);
  const [SelectedUserTrans, SetUsersTrans] = useState(null);
  const [SelectedUserReviews, SetUsersReviews] = useState(null);
  const [whatToShow, changeShowing] = useState(0);

  const [AppTable, setTable] = useState(null);
  const [reason, changeReason] = useState(null);

  // Stany dla komunikatów walidacji i sukcesu
  const [errorBoxText, setErrorBoxText] = useState("");
  const [successBoxText, setSuccessBoxText] = useState("");
  const [Changed, setChanged] = useState(0);
  const [mainUser, GetMainUser] = useState(null);
  const { userData, logout } = useContext(UserContext);
  const [MeinUsser, isUserLogged] = useState(false);

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
    console.log(location.state.uId);
    axios.get("http://localhost:3000/applications").then((res) => {setTable(res.data)})
  }, []);

  useEffect(() => {
    if(Users != null){
      Users.forEach(user => {
        if(user.id == location.state.uId){
          SetMainUser(user);
          if(user.id == userData.id){
            isUserLogged(true);
          }
          console.log(user);
          axios.get(`${axiosPath}/transactions/getByUser`, {params: {id: user.id}} ).then((res) => {
            SetUsersTrans(res.data);
            console.log(res.data);
          });
          axios.get(`${axiosPath}/ratings/getByUser`, {params: {id: user.id}} ).then((res) => {
            SetUsersReviews(res.data);
            console.log(res.data);
          });
        };
      });
    }
  }, [Users]);

  function RedirectToGamePage(gameId) {
    navigate('/Game', { state: { GameId: gameId } });
  }

  function BecomeSeller(){
    let AppInBase = false;
    if(SelectedUser.type == "normal"){
      
      if(AppTable != null){
        AppTable.forEach(element => {
          console.log(element);
          if(element.sender_id == SelectedUser.id){
            AppInBase = true;
          }
        });
      }

      if(AppInBase == false && reason != null){
        axios.post(`${axiosPath}/applications/addAplication`, {sender_id: SelectedUser.id, request: reason})
          .then(() => {
            setSuccessBoxText("Twój wniosek został dodany.");
            window.location.reload();
          })
          .catch((err) => {
            setErrorBoxText("Wystąpił błąd serwera podczas rejestracji. Spróbuj ponownie później.");
            console.error(err);
          });
        alert("Twój wniosek został przesłany do rozpatrzenia");
      } else {
        if(reason == null){
          alert("Proszę podać powód.");
        }
        alert("Twój wniosek został już wcześniej przesłany.\nProszę już ich więcej nie przesyłać.");
      }
    }
  }

  return (
    <>
      <div className="container-fluid">
        <Header axiosPath={axiosPath}/>

        {SelectedUser != null && (
          <div>
            {/* Header */}
            <div className='row'>
              <div className='col-4'>
                <div className='d-flex flex-column mb-3 p-2'>
                  <h2>{SelectedUser.login}</h2>
                  <h3>{SelectedUser.type}</h3>
                  <h4>{SelectedUser.discord_tag}</h4>
                  <h4>{SelectedUser.phone}</h4>
                  <button className='m-3' onClick={() => changeShowing(0)}>Pokaż transkacje</button>
                  <button className='m-3' onClick={() => changeShowing(1)}>Pokaż Recenzje</button>
                  {MeinUsser == true && SelectedUser.type == "normal" && (
                    <button className='m-3' onClick={() => changeShowing(2)}>Aplikuj na sprzedawcę</button>
                  )}
                  {MeinUsser == true && (
                    <button className='m-3' onClick={() => navigate("/Edit-Account")}>Edytuj Konto</button>
                  )}
                </div>
              </div>
              <div className='col-8'>
                <div>
                  {whatToShow == 0 && (
                    <div className="overflow-auto">
                      {SelectedUserTrans != null && SelectedUserTrans.length > 0 ? (
                        <table className='mw-90 mh-50'>
                          <thead>
                            <tr>
                              <th>Sprzedawca</th><th>Gra</th><th>Opis</th><th>Odbiorca</th><th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SelectedUserTrans.map((trans) => (
                              <tr>
                                <td onClick={() => {navigate(`/User/${trans.seller_id}`, {replace: true, state: {uId: trans.seller_id}}); window.location.reload()}}>{trans.login}</td>
                                <td onClick={() => RedirectToGamePage(trans.game_id)}>{trans.title}</td>
                                <td>{trans.other}</td>
                                <td onClick={() => {navigate(`/User/${trans.reciever_id}`, {replace: true, state: {uId: trans.reciever_id}}); window.location.reload()}}>{trans.receiver_login}</td>
                                <td>{trans.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>użytkownik nie ma żadnej historii transakcji</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  {whatToShow == 1 && (
                    <div>
                      {SelectedUserReviews != null && SelectedUserReviews.length > 0  ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Ocena</th><th>Gra</th><th>Opis</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SelectedUserReviews.map((rev) => (
                              <tr>
                                <td>{rev.rating}</td>
                                <td onClick={() => RedirectToGamePage(rev.id)}>{rev.title}</td>
                                <td>{rev.other}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>użytkownik nie ma żadnej historii receznji</p>
                      )}
                    </div>
                  )}
                  {whatToShow == 2 && (
                    <div>
                      <h3>Proszę podaj powód, dla którego chcesz zostać sprzedawcą?</h3>
                      <input type="text" onChange={(e) => changeReason(e.target.value)}/>
                      <button onClick={() => BecomeSeller()}>DODAJ WNIOSEK</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}