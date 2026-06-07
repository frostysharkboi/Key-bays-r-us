import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from './components/user-context/UserContext.jsx';

import Root from "./routes/root.jsx";
import SearchPage from './routes/search_page.jsx';
import ErrorPage from "./routes/error-page.jsx";
import GamePage from "./routes/game_page.jsx";
import LoginPage from "./routes/login_page.jsx";
import RegistrationPage from "./routes/registration_page.jsx";
import WishlistPage from "./routes/wishlist_page.jsx";
import CreateOfferPage from "./routes/createOffer_page.jsx";
import EditAccountPage from "./routes/editAccount_page.jsx";
import OffersPage from './routes/Offers_page.jsx';
import TransactionsPage from './routes/Transactions_page.jsx';
import UserPage from './routes/userPage.jsx';

const router = createBrowserRouter([
  { path: "/", element: <Root />, errorElement: <ErrorPage /> },
  { path: "Search", element: <SearchPage />, errorElement: <ErrorPage /> },
  { path: "Game", element: <GamePage />, errorElement: <ErrorPage /> },
  { path: "Login", element: <LoginPage />, errorElement: <ErrorPage /> },
  { path: "Register", element: <RegistrationPage />, errorElement: <ErrorPage /> },
  { path: "Wishlist", element: <WishlistPage />, errorElement: <ErrorPage /> },
  { path: "Create-Offer", element: <CreateOfferPage />, errorElement: <ErrorPage /> },
  { path: "Edit-Account", element: <EditAccountPage />, errorElement: <ErrorPage /> },
  { path: "Offers", element: <OffersPage />, errorElement: <ErrorPage /> },
  { path: "Transactions", element: <TransactionsPage />, errorElement: <ErrorPage /> },
  { path: "User/:id", element: <UserPage />, errorElement: <ErrorPage />}
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>,
);