import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
//Od tego momentu są importowane podstrony
import Root from "./routes/root.jsx";
import SearchPage from './routes/search_page.jsx';
import ErrorPage from "./routes/error-page.jsx";
import GamePage from "./routes/game_page.jsx";
import LoginPage from "./routes/login_page.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path:"Wyszukiwarka-Test",
    element: <SearchPage />,
    errorElement: <ErrorPage />,
  },
  {
    path:"Wyszukiwarka-Test/GamePage-Test",
    element: <GamePage />,
    errorElement: <ErrorPage />,
  },
  {
    path:"LoginPage-Test",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
