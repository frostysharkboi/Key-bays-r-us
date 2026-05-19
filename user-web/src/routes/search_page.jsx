import { useState } from 'react';
import axios from 'axios';
import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './root.css'

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

  const navigate = useNavigate();
  const location = useLocation();
  
  //Tu jest wyszukiwanie gry z tego paska na górze.
  var Title = location.state.Title;
  var GenreId = location.state.GenreId;
  
  console.log(Title + "\n" + GenreId);

  function RedirectToGamePage(e){
    navigate('GamePage-Test',{state:{GameId: e, login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
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

  const [SearchThisTitle, changeTitle] = useState(null);
  function RedirectToSeaching(e) {
    if(e == null){
      navigate(0, {state: {Title: SearchThisTitle, login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
    } else {
      navigate(0, {state: {GenreId: e, login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
    }
  }

  function RedirectToStorefront(){
    navigate('/', {state: {login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}});
  }

  function GoToLoginPage(){
    navigate("LoginPage-Test", {replace: true , state: {login: UserData.login, isLogged: UserData.isLogged, discordTag: UserData.discordTag}})
  }


  //Kod odpowiedzialny za logowanie.
    
    const [UserData, GetUserData] = useState({
        login: null,
        isLogged: false,
        discordTag: null
      });
    
      React.useEffect(() => {
    
        if(location.state != null){
          console.log("Przed pobraniem danych z loginu");
          if(location.state.isLogged == true){
            console.log("Pobieranie danych z loginu");
            GetUserData({
            login: location.state.login,
            isLogged: location.state.isLogged,
            discordTag: location.state.discordTag
          });
          }
        }
    
      }, [location.state]);
    
    React.useEffect(() => {
            if(UserData.login == null){
              document.getElementById("nick").innerHTML = "Gosc";
            } else {
              document.getElementById("nick").innerHTML = UserData["login"];
            }
      }, [UserData])
  
    console.log("SEARCH_PAGE.JSX\nOTRZYMANE DANE:\n", location.state);
    //console.log(UserData["login"]);
  
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
                  <input type="text" id="wyszukiwarka" name="wyszukiwarka" placeholder='szukaj...'/>
                  <button className='border border-3 btnsrch' onClick={() => RedirectToSeaching()}>SZUKAJ</button>
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
                          <a onClick={GoToLoginPage}>
                            Zaloguj sie
                          </a>
                        )}
                      {UserData?.isLogged && (
                        <>
                          <a>Zarzadzaj kontem</a>

                          <a onClick={LogOut}>
                            Wyloguj sie
                          </a>
                        </>
                      )}
                    </div>
                  </div> 
                </div>
              </div>
            
              <h3 className='mx-4 mt-4 p-4 font'>Wyniki Wyszukiwania</h3>
                <div className="row px-4 pb-4">
                  <div className="col-12 col-lg-4 custom-border border-dark">
                    <h3 className='mx-4 mt-4 p-3 text-center font'>Filtry:</h3>
                    <div className="addpanel box-idk">
                      <div className="addpaneldiv row p-2 pe-4">
                        <h2 className='font'>Tytul</h2>
                        <input className='col p-2 inp-srch' type="text" name='search' id='search' value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder='Search...'/>
                      </div>
                      <div className='addpaneldiv col p-2 pe-4'>
                        <h2 className='font'>Gatunki</h2>
                        {filterTags.map((t) => (
                          <div className='row' key={t.id}>
                            <input className='btn-check col' type="checkbox" name={`Gat_${t.id}`} id={`Gat_${t.id}`} checked={t.isSelected}
                              onChange={(e) => {setFilterTags(prev => prev.map(
                                tag => tag.id === t.id ? { ...tag, isSelected: e.target.checked } : tag
                              ));}}
                            />
                            <label htmlFor={`Gat_${t.id}`}
                              className={`p-2 m-1 btn-kirk border border-6 ${ t.isSelected || !anySelected ? "btn-zaz" : "btn-odz" }`}
                            >{t.tag}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <table className='table border border-3 table-sm table-striped table-hover ms-3'>
                      <thead>
                        {table.getHeaderGroups().map(hg => (
                          <tr className='table-part-top border border-3' key={hg.id}>
                            {hg.headers.map(header => (
                              <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}>
                                {header.column.getIsSorted() === "desc" ? "↑ " : (header.column.getIsSorted() === "asc" ? "↓ " : "")}
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === "desc" ? " ↑" : (header.column.getIsSorted() === "asc" ? " ↓" : "")}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr className='' key={row.id} onClick={() => RedirectToGamePage(parseInt(row.getVisibleCells()[0].getValue()))}>
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {Array.from({ length: emptyRowCount }).map((_, idx) => (
                          <tr key={`empty-${idx}`} className="empty-row">
                            <td colSpan={columns.length} style={{ height: "48px", opacity: 0 }}>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={columns.length}>
                            <div className="d-flex justify-content-between align-items-center">
                              <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}> First </button>
                              <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}> Previous </button>
                              <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
                              <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
                              <button className="btn btn-secondary rounded-0 border border-3" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>Last</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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