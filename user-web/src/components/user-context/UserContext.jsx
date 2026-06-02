import React, { createContext, useState, useEffect } from 'react';

// Inicjalizacja kontekstu użytkownika
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Stan inicjalizuje się wartościami z localStorage, 
  // dodaliśmy domyślne pole type: null
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem('user_session');
    return savedUser ? JSON.parse(savedUser) : { id: null, login: null, isLogged: false, discordTag: null, type: null };
  });

  // Automatyczna synchronizacja nowego stanu z pamięcią podręczną przeglądarki
  useEffect(() => {
    localStorage.setItem('user_session', JSON.stringify(userData));
  }, [userData]);

  // Funkcja czyszcząca sesję podczas wylogowania - tutaj też resetujemy type
  const logout = () => {
    setUserData({ id: null, login: null, isLogged: false, discordTag: null, type: null });
    localStorage.removeItem('user_session');
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, logout }}>
      {children}
    </UserContext.Provider>
  );
};