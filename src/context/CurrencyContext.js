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

export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", label: "INR ₹" },
  USD: { code: "USD", symbol: "$", label: "USD $" },
  EUR: { code: "EUR", symbol: "€", label: "EUR €" },
};

export const CurrencyContext = createContext();

function CurrencyProvider({ children }) {

  const [currencyCode, setCurrencyCodeState] =
    useState(() => {

      const saved = localStorage.getItem("currencyCode");

      return CURRENCIES[saved] ? saved : "INR";
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
            CURRENCIES[profile.currencyCode]
          ) {
            setCurrencyCodeState(profile.currencyCode);
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

    localStorage.setItem("currencyCode", currencyCode);

  }, [currencyCode]);

  const setCurrencyCode = (code) => {

    setCurrencyCodeState(code);

    if (auth.currentUser) {
      saveUserProfile({ currencyCode: code }).catch(() => {});
    }

  };

  const symbol = CURRENCIES[currencyCode].symbol;

  return (

    <CurrencyContext.Provider
      value={{
        currencyCode,
        setCurrencyCode,
        symbol,
      }}
    >

      {children}

    </CurrencyContext.Provider>
  );
}

export default CurrencyProvider;
