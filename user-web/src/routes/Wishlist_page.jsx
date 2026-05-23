import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './root.css';

export default function SearchPage(){
  // UseState do operacji na danych
  const [globalFilter, setGlobalFilter] = useState(""); // Filtry
  const [sorting, setSorting] = useState([]);           // Sortowanie
  const [pagination, setPagination] = useState({        // Wybrana strona:
    pageIndex: 0,                                       //    aktualna strona
    pageSize: 8,                                        //    ilośc rekordów na strone
  });

  const [games, setGames] = useState([]);               // Dane gier z bazy danych
  const [tags, setTags] = useState([]);                 // Dane tagów z bazy danych
  const [filterTags, setFilterTags] = useState([]);     // Dane tagów do filtrów z bazy danych
  const [gamesData, setGamesData] = useState({          // Dane obecnie wybranej gry
    title:"",
    about:""
  });

  const [SearchThisTitle, changeTitle] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [UserData, GetUserData] = useState({
      id: null,
      login: null,
      isLogged: false,
      discordTag: null
  });

  const [wishlistGamesData, GetGameData] = useState([]);

  useEffect(()=>{if(location.state.Title != null)setGlobalFilter(location.state.Title)},[]);
  
  //Tu jest wyszukiwanie gry z tego paska na górze.
  var Title = location.state.Title;
  var GenreId = location.state.GenreId;

  function RedirectToGamePage(e){
    navigate('/Game',{state:{GameId: e, userId: UserData.id}});
  }

  // Pobranie danych z tabeli
  const getFilteredGames = () => {
    const outputTags = filterTags.filter(tag => tag.isSelected).map(tag=>tag.id);
    console.log(outputTags);
    axios.get("http://localhost:3000/games/tagsort", { params: { tags: outputTags }, paramsSerializer: params => {return "tags=" + params.tags.join("&tags=");}}).then((res) => {
      setGames(res.data);
    });
  }
  const getAllTags = () => {
    axios.get("http://localhost:3000/tags").then((res) => {
      setTags(res.data);

      const mapped = res.data.map(e => ({
        id: e.id,
        tag: e.tag,
        isSelected: e.id == GenreId,
      }));

      setFilterTags(mapped);
    });
  };
  const anySelected = filterTags.some(t=>t.isSelected);
  React.useEffect(() => {
    getAllTags();
  }, []);
  //inaczej by poczekało na wykonanie poprzedniego
  React.useEffect(() => {
    if (filterTags.length > 0) {
      getFilteredGames();
    }
  }, [filterTags]);



  // Wygenerowanie tabeli w html z danymi
  const columns = React.useMemo(() => [
    { header: "ID", accessorKey: "id", enableSorting: true,
      cell: (info)=>{ return <b>{info.getValue()}</b> }
     },
    { header: "Title", accessorKey: "title", enableSorting: true},
    { header: "About", accessorKey: "about", enableSorting: false},
    { header: "Image", accessorKey: "cover_img", enableSorting: false,
      cell: (info)=>{
        var alt_text = "Cover Art of " + info.row.original.title;
        return(<img src={info.getValue()} alt={alt_text} width={200} />)
      }
    }
  ],[]);

  

  // Obsługa funkcji tabeli (tu większośc rzeczy po prostu wklejałem wdg zapotrzebowań innych funkcji np. wyszukiwanie, sortowanie i filtrowanie)
  const table = useReactTable({
    data: games,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: (newSorting) => {  setSorting(newSorting);},
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });
  /*
  // Czyszczenie danych po zatwierdzeniu 
  const clearAll=()=>{
    setGamesData({
      title:"",
      about:""
    });
    getAllGames();
  }
  */
  const rows = table.getRowModel().rows;
  const emptyRowCount = pagination.pageSize - rows.length;

  async function RedirectToSeaching(e) {
    if(e == null){
      setGlobalFilter(SearchThisTitle);
      navigate("/Search", {state: {Title: globalFilter, userId: UserData.id, isLogged: UserData.isLogged}});
    } else {
      navigate("/Search", {state: {GenreId: e, userId: UserData.id, isLogged: UserData.isLogged}});
    }
  }

  function RedirectToStorefront(){
    navigate('/', {state: {userId: UserData.id, isLogged: UserData.isLogged}});
  }

  function GoToLoginPage(){
    navigate("Login", {replace: true , state: {userId: UserData.id, isLogged: UserData.isLogged}})
  }


  //Pobieranie info o użytkowniku i o jego liście życzeń.
    React.useEffect(() => {
    if(location.state != null){
      console.log("Pobieranie danych użytkownika");
      axios.get("http://localhost:3000/users/byid", {params: {id: location.state.userId}}).then((res) => {
        console.log(res.data);
        GetUserData({
          id: res.data[0].id,
          login: res.data[0].login,
          isLogged: true,
          discordTag: res.data[0].discord_tag
        })
      });
    }
  }, [location.state]);
    
    React.useEffect(() => {
            if(UserData.login == null){
              document.getElementById("nick").innerHTML = "Gość";
            } else {
              document.getElementById("nick").innerHTML = UserData["login"];
            }

            if(UserData.id != null){
              console.log("Pobieranie danych z wishlisty");
              axios.get("http://localhost:3000/wishlist/wishlistData", {params: {id: UserData.id}}).then((res) => {
                console.log(res.data);
                console.log("Sprawdzanie czy dane są.", JSON.stringify(res.data, null, 0));
                GetGameData(
                  res.data.map(game => ({
                  gameId: game.game_id,
                  title: game.title,
                  gameCover: game.cover_img,
                  gameDev: game.developer
                }))
              );
            });
            }
      }, [UserData])
  
    console.log("SEARCH_PAGE.JSX\nOTRZYMANE DANE:\n", location.state);
    //console.log(UserData["login"]);
  
    console.log("CONSOLE LOGI", UserData, "\n", wishlistGamesData, "\n", `Tytuł: ${wishlistGamesData[0].title} | Dev: ${wishlistGamesData[0].gameDev}`);
    function LogOut(){
      GetUserData(null);
  
      navigate("/", {
        replace: true,
        state: null
      });
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
        
                {/* Logo, wiadomo */}
                <div className='col-4 fw-bolder logo'>
                  <h1 onClick={RedirectToStorefront}>Keys &apos;R&apos; Us</h1>
                </div>
        
                {/* Dropdown menu konta */}
                <div className='col-4'>
                  <div className="dropdown">
                  <button className="dropbtn font" id="nick"></button>
                    <div className="dropdown-content fw-bold">
                      {!UserData?.isLogged && (
                        <h5 onClick={GoToLoginPage}>
                          Zaloguj się
                        </h5>
                      )}
                    {UserData?.isLogged && (
                      <>
                        <h5>Zarządzaj kontem</h5>

                        <h5 onClick={LogOut}>
                          Wyloguj się
                        </h5>
                      </>
                    )}
                    </div>
                  </div> 
                </div>
              </div>

              {/* Box z tabelą i filtrami */}
              <div>

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
  };