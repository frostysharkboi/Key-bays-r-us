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

  const [whatToShowText, changeShowingText] = useState("Pokaż Recenzje");
  const [whatToShow, changeShowing] = useState(false);

  const [RecieversLogins, getLogins] = useState(null);

  // Stany dla komunikatów walidacji i sukcesu
  const [errorBoxText, setErrorBoxText] = useState("");
  const [successBoxText, setSuccessBoxText] = useState("");
  const [Changed, setChanged] = useState(0);
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
    console.log(location.state.uId);
  }, []);

  useEffect(() => {
    if(Users != null){
      Users.forEach(user => {
        if(user.id == location.state.uId){
          SetMainUser(user);
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

  function changeWhatToShow(){
    if(!whatToShow == false){
      changeShowingText("Pokaż Recenzje");
    } else {
      changeShowingText("Pokaż Transkacje");
    }
    changeShowing(!whatToShow);
    console.log(whatToShow, "\n", whatToShowText);
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
                <div>
                  <h2>{SelectedUser.login}</h2>
                  <h3>{SelectedUser.type}</h3>
                  <h4>{SelectedUser.discord_tag}</h4>
                  <h4>{SelectedUser.phone}</h4>
                  <button className='m-3' onClick={() => changeWhatToShow()}>{whatToShowText}</button>
                </div>
              </div>
              <div className='col-8'>
                <div>
                  {whatToShow == false && (
                    <div>
                      {SelectedUserTrans != null && SelectedUserTrans.length > 0 ? (
                        <table>
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
                  {whatToShow == true && (
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