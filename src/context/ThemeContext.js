import {
  createContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase/firebase";

import {
  getUserProfile,
  saveUserProfile,
} from "../services/firestoreData";

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

  // LOAD REAL PREFERENCE FROM FIRESTORE ONCE LOGGED IN
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {

        if (!user) return;

        try {

          const profile = await getUserProfile();

          if (
            profile &&
            typeof profile.darkMode === "boolean"
          ) {
            setDarkMode(profile.darkMode);
          }

        } catch (error) {
          // keep local value if Firestore read fails
        }
      }
    );

    return unsubscribe;

  }, []);

  // MIRROR TO LOCALSTORAGE FOR INSTANT PAINT BEFORE AUTH RESOLVES

  useEffect(() => {

    localStorage.setItem(
      "darkMode",
      darkMode
    );

  }, [darkMode]);

  // TOGGLE THEME

  const toggleTheme = () => {

    const next = !darkMode;

    setDarkMode(next);

    if (auth.currentUser) {
      saveUserProfile({ darkMode: next }).catch(() => {});
    }

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
