import React, { createContext, useState, useEffect } from 'react';
import { useContext } from 'react';
import { useAuth } from './AuthContext'

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const {user} = useAuth();
  const username = user?.username
  if(!username) return
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(`${username}'s theme`) || 'dark';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem(`${username}'s theme`, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

 // const current = () => [`${username}'s theme`, theme]

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);