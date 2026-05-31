import {
  createContext,
  useEffect,
  useState,
} from "react";

export const ThemeContext =
  createContext();

function ThemeProvider({
  children,
}) {

  const [darkMode, setDarkMode] =
    useState(() => {

      const savedTheme =
        localStorage.getItem(
          "darkMode"
        );

      return savedTheme === "true";
    });

  // SAVE THEME

  useEffect(() => {

    localStorage.setItem(
      "darkMode",
      darkMode
    );

  }, [darkMode]);

  // TOGGLE THEME

  const toggleTheme = () => {

    setDarkMode(!darkMode);

  };

  return (

    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
      }}
    >

      {children}

    </ThemeContext.Provider>
  );
}

export default ThemeProvider;