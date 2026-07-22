import {
  useState,
  useContext,
} from "react";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

import {
  ThemeContext,
} from "../context/ThemeContext";

import {
  CurrencyContext,
} from "../context/CurrencyContext";

import useFirestoreCollection from "../hooks/useFirestoreCollection";

function Categories() {

  const {
    darkMode,
    toggleTheme,
  } = useContext(ThemeContext);

  const {
    symbol,
  } = useContext(CurrencyContext);

  const {
    items: transactions,
  } =
    useFirestoreCollection(
      "transactions",
      "transactions"
    );

  const [selectedCategory,
    setSelectedCategory] =
    useState(null);

  const [filterType,
    setFilterType] =
    useState("all");

  // DEFAULT CATEGORIES

  const defaultCategories = [
    "Food",
    "Travel",
    "Shopping",
    "Entertainment",
    "Bills",
    "Health",
    "Education",
    "Salary",
    "Other",
  ];

  // CATEGORY SUMMARY

  const categoryMap = {};

  // INITIALIZE WITH 0 VALUES

  defaultCategories.forEach((category) => {

    categoryMap[category] = {
      totalAmount: 0,
      totalCount: 0,
    };
  });

  // UPDATE VALUES FROM TRANSACTIONS

  transactions.forEach((item) => {

    // IF NEW CATEGORY ENTERED

    if (!categoryMap[item.category]) {

      categoryMap[item.category] = {
        totalAmount: 0,
        totalCount: 0,
      };
    }

    categoryMap[item.category]
      .totalAmount += Number(item.amount);

    categoryMap[item.category]
      .totalCount += 1;
  });

  // SELECTED CATEGORY TRANSACTIONS

  const filteredTransactions =
    transactions.filter((item) =>
      item.category === selectedCategory
    );

  const now = new Date();

  // WEEKLY FILTER

  const weeklyTransactions =
    filteredTransactions.filter((item) => {

      const itemDate =
        new Date(item.date);

      const diff =
        (now - itemDate) /
        (1000 * 60 * 60 * 24);

      return diff <= 7;
    });

  // MONTHLY FILTER

  const monthlyTransactions =
    filteredTransactions.filter((item) => {

      const itemDate =
        new Date(item.date);

      return (
        itemDate.getMonth() ===
          now.getMonth() &&
        itemDate.getFullYear() ===
          now.getFullYear()
      );
    });

  // YEARLY FILTER

  const yearlyTransactions =
    filteredTransactions.filter((item) => {

      const itemDate =
        new Date(item.date);

      return (
        itemDate.getFullYear() ===
        now.getFullYear()
      );
    });

  // DROPDOWN FILTER

  let displayTransactions =
    filteredTransactions;

  if (filterType === "week") {

    displayTransactions =
      weeklyTransactions;

  } else if (
    filterType === "month"
  ) {

    displayTransactions =
      monthlyTransactions;

  } else if (
    filterType === "year"
  ) {

    displayTransactions =
      yearlyTransactions;
  }

  // TOTAL FUNCTION

  const getTotal = (data) => {

    return data.reduce(
      (acc, curr) =>
        acc + Number(curr.amount),
      0
    );
  };

  return (

    <div
      className={
        darkMode
          ? "dashboard dark"
          : "dashboard"
      }
    >

      <Sidebar />

      <div className="main-content">

        <TopNavbar
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        {/* HEADER */}

        <div className="dashboard-header">

          <h1>
            Categories
          </h1>

          <p>
            Category wise expenses
          </p>

        </div>

        {/* CATEGORY TABLE */}

        <div className="table-card">

          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            Category Summary
          </h2>

          <table>

            <thead>

              <tr>

                <th>
                  Category
                </th>

                <th>
                  Total Transactions
                </th>

                <th>
                  Total Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {
                Object.keys(categoryMap)
                  .map((key) => (

                    <tr
                      key={key}
                      onClick={() => {

                        setSelectedCategory(
                          key
                        );

                        setFilterType(
                          "all"
                        );
                      }}
                      style={{
                        cursor: "pointer",
                      }}
                    >

                      <td
                        style={{
                          color: "#2563eb",
                          fontWeight: "600",
                        }}
                      >
                        {key}
                      </td>

                      <td>
                        {
                          categoryMap[key]
                            .totalCount
                        }
                      </td>

                      <td>
                        {symbol} {
                          categoryMap[key]
                            .totalAmount
                        }
                      </td>

                    </tr>

                  ))
              }

            </tbody>

          </table>

        </div>

        {/* CATEGORY DETAILS */}

        {
          selectedCategory && (

            <div
              className="table-card"
              style={{
                marginTop: "30px",
              }}
            >

              {/* TOP SECTION */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >

                <h2>
                  {
                    selectedCategory
                  } Expenses
                </h2>

                {/* FILTER DROPDOWN */}

                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value
                    )
                  }
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border:
                      darkMode
                        ? "1px solid #334155"
                        : "1px solid #d1d5db",
                    background:
                      darkMode
                        ? "#1e293b"
                        : "#ffffff",
                    color:
                      darkMode
                        ? "#ffffff"
                        : "#111827",
                    outline: "none",
                  }}
                >

                  <option value="all">
                    All
                  </option>

                  <option value="week">
                    Weekly
                  </option>

                  <option value="month">
                    Monthly
                  </option>

                  <option value="year">
                    Yearly
                  </option>

                </select>

              </div>

              {/* SUMMARY CARDS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px,1fr))",
                  gap: "20px",
                  marginBottom: "30px",
                }}
              >

                {/* WEEKLY */}

                <div
                  className="summary-card"
                  style={{
                    background:
                      darkMode
                        ? "#1e293b"
                        : "#ffffff",
                    color:
                      darkMode
                        ? "#ffffff"
                        : "#111827",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow:
                      "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >

                  <h3>
                    Weekly
                  </h3>

                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color:
                        darkMode
                          ? "#38bdf8"
                          : "#2563eb",
                    }}
                  >
                    {symbol} {
                      getTotal(
                        weeklyTransactions
                      )
                    }
                  </p>

                  <span>
                    Total Count :
                    {
                      weeklyTransactions
                        .length
                    }
                  </span>

                </div>

                {/* MONTHLY */}

                <div
                  className="summary-card"
                  style={{
                    background:
                      darkMode
                        ? "#1e293b"
                        : "#ffffff",
                    color:
                      darkMode
                        ? "#ffffff"
                        : "#111827",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow:
                      "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >

                  <h3>
                    Monthly
                  </h3>

                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color:
                        darkMode
                          ? "#38bdf8"
                          : "#2563eb",
                    }}
                  >
                    {symbol} {
                      getTotal(
                        monthlyTransactions
                      )
                    }
                  </p>

                  <span>
                    Total Count :
                    {
                      monthlyTransactions
                        .length
                    }
                  </span>

                </div>

                {/* YEARLY */}

                <div
                  className="summary-card"
                  style={{
                    background:
                      darkMode
                        ? "#1e293b"
                        : "#ffffff",
                    color:
                      darkMode
                        ? "#ffffff"
                        : "#111827",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow:
                      "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >

                  <h3>
                    Yearly
                  </h3>

                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color:
                        darkMode
                          ? "#38bdf8"
                          : "#2563eb",
                    }}
                  >
                    {symbol} {
                      getTotal(
                        yearlyTransactions
                      )
                    }
                  </p>

                  <span>
                    Total Count :
                    {
                      yearlyTransactions
                        .length
                    }
                  </span>

                </div>

              </div>

              {/* FILTER RESULT */}

              <div
                style={{
                  marginBottom: "20px",
                  fontWeight: "600",
                  color:
                    darkMode
                      ? "#ffffff"
                      : "#111827",
                }}
              >

                Showing :
                {
                  filterType === "all"
                    ? " All Transactions"
                    : filterType ===
                      "week"
                    ? " Weekly Transactions"
                    : filterType ===
                      "month"
                    ? " Monthly Transactions"
                    : " Yearly Transactions"
                }

              </div>

              {/* TRANSACTION TABLE */}

              <table>

                <thead>

                  <tr>

                    <th>
                      Title
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    displayTransactions
                      .length > 0 ? (

                      displayTransactions
                        .map((item, index) => (

                          <tr key={index}>

                            <td>
                              {item.title}
                            </td>

                            <td>
                              {symbol} {item.amount}
                            </td>

                            <td>
                              {item.date}
                            </td>

                          </tr>

                        ))

                    ) : (

                      <tr>

                        <td
                          colSpan="3"
                          style={{
                            textAlign: "center",
                            padding: "20px",
                          }}
                        >
                          No transactions found
                        </td>

                      </tr>

                    )
                  }

                </tbody>

              </table>

            </div>

          )
        }

      </div>

    </div>
  );
}

export default Categories;
