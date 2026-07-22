import {
  createContext,
  useEffect,
  useState,
} from "react";

export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", label: "INR ₹" },
  USD: { code: "USD", symbol: "$", label: "USD $" },
  EUR: { code: "EUR", symbol: "€", label: "EUR €" },
};

export const CurrencyContext = createContext();

function CurrencyProvider({ children }) {

  const [currencyCode, setCurrencyCode] =
    useState(() => {

      const saved = localStorage.getItem("currencyCode");

      return CURRENCIES[saved] ? saved : "INR";
    });

  useEffect(() => {

    localStorage.setItem("currencyCode", currencyCode);

  }, [currencyCode]);

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
