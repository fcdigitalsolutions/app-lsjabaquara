import React, { createContext, useContext, useState } from 'react';

// Cria o contexto
const ThemeContext = createContext();

// Provedor do contexto
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para acessar o contexto
export const useTheme = () => {
  return useContext(ThemeContext);
};
