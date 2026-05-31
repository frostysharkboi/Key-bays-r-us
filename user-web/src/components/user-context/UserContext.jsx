import React, { createContext, useState, useEffect } from 'react';

// Inicjalizacja kontekstu użytkownika
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Trzecioosobowy opis działania: Stan inicjalizuje się wartościami z localStorage, 
  // dzięki czemu sesja użytkownika zostaje zachowana po odświeżeniu strony (F5).
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem('user_session');
    return savedUser ? JSON.parse(savedUser) : { id: null, login: null, isLogged: false, discordTag: null };
  });

  // Trzecioosobowy opis działania: Hook monitoruje każdą zmianę obiektu userData 
  // i automatycznie synchronizuje nowy stan z pamięcią podręczną przeglądarki.
  useEffect(() => {
    localStorage.setItem('user_session', JSON.stringify(userData));
  }, [userData]);

  // Funkcja czyszcząca sesję podczas wylogowania
  const logout = () => {
    setUserData({ id: null, login: null, isLogged: false, discordTag: null });
    localStorage.removeItem('user_session');
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, logout }}>
      {children}
    </UserContext.Provider>
  );
};