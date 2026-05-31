import {
  useEffect,
  useState,
  useContext,
} from "react";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

import { ThemeContext } from "../context/ThemeContext";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase/firebase";

import * as XLSX from "xlsx";

function Categories() {

  const {
    darkMode,
    toggleTheme,
  } = useContext(ThemeContext);

  const [transactions, setTransactions] =
    useState([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  // ✅ SINGLE FILTER STATE

  const [filterType, setFilterType] =
    useState("all");

  const [filterMonth, setFilterMonth] =
    useState("");

  const [filterYear, setFilterYear] =
    useState(
      new Date().getFullYear()
    );

  const now = new Date();

  // FIRESTORE DATA

  useEffect(() => {

    const user =
      auth.currentUser;

    if (!user) return;

    const q = query(
      collection(
        db,
        "transactions"
      ),
      where(
        "userId",
        "==",
        user.uid
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (doc) => ({

                id: doc.id,

                ...doc.data(),

              })
            );

          setTransactions(data);

        }
      );

    return () => unsubscribe();

  }, []);

  const defaultCategories = [

    "Food",

    "Travel",

    "Shopping",

    "Entertainment",

    "Bills",

    "Health",

    "Education",

    "Salary",

    "Personal Saving",

    "Other",

  ];

  // =========================
  // FILTER LOGIC (UNIFIED)
  // =========================

  const applyFilter = (
    item
  ) => {

    const itemDate =
      new Date(item.date);

    if (
      filterType === "week"
    ) {

      const diff =
        (now - itemDate) /
        (
          1000 *
          60 *
          60 *
          24
        );

      return diff <= 7;

    }

    if (
      filterType === "month"
    ) {

      return (

        itemDate.getMonth() +
          1 ===
          Number(filterMonth) &&

        itemDate.getFullYear() ===
          Number(filterYear)

      );

    }

    if (
      filterType === "year"
    ) {

      return (
        itemDate.getFullYear() ===
        Number(filterYear)
      );

    }

    return true;

  };

  // CATEGORY SUMMARY DATA

  const categoryMap = {};

  defaultCategories.forEach(
    (cat) => {

      categoryMap[cat] = {

        totalAmount: 0,

        totalCount: 0,

      };

    }
  );

  transactions
    .filter(applyFilter)
    .forEach((item) => {

      if (
        !categoryMap[
          item.category
        ]
      ) {

        categoryMap[
          item.category
        ] = {

          totalAmount: 0,

          totalCount: 0,

        };

      }

      categoryMap[
        item.category
      ].totalAmount += Number(
        item.amount
      );

      categoryMap[
        item.category
      ].totalCount += 1;

    });

  // SELECTED CATEGORY

  const filteredTransactions =
    transactions

      .filter(
        (item) =>
          item.category ===
          selectedCategory
      )

      .filter(applyFilter)

      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );

  const getTotal = (
    data
  ) =>

    data.reduce(
      (acc, curr) =>
        acc +
        Number(curr.amount),
      0
    );

  // =========================
  // DOWNLOAD EXCEL
  // =========================

  const downloadExcel = () => {

    const dataToDownload =
      filteredTransactions;

    const excelData =
      dataToDownload.map(
        (item) => ({

          Title: item.title,

          Amount: item.amount,

          Category:
            item.category,

          Type: item.type,

          Date: item.date,

        })
      );

    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Category Report"
    );

    XLSX.writeFile(
      workbook,
      `${
        selectedCategory ||
        "report"
      }-report.xlsx`
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
          toggleTheme={
            toggleTheme
          }
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

        {/* ================= FILTER ================= */}

        <div
          style={{
            display: "flex",

            gap: "10px",

            justifyContent:
              "flex-end",

            flexWrap: "wrap",
          }}
        >

          {/* MAIN FILTER */}

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value
              )
            }
            style={{
              padding: "10px",

              borderRadius:
                "10px",
            }}
          >

            <option value="all">
              All
            </option>

            <option value="week">
              This Week
            </option>

            <option value="month">
              Month
            </option>

            <option value="year">
              Year
            </option>

          </select>

          {/* MONTH */}

          {
            filterType ===
              "month" && (

              <select
                value={
                  filterMonth
                }
                onChange={(e) =>
                  setFilterMonth(
                    e.target.value
                  )
                }
                style={{
                  padding:
                    "10px",

                  borderRadius:
                    "10px",
                }}
              >

                <option value="">
                  Select Month
                </option>

                {
                  [
                    ...Array(12),
                  ].map(
                    (_, i) => (

                      <option
                        key={i}
                        value={
                          i + 1
                        }
                      >

                        {
                          new Date(
                            0,
                            i
                          ).toLocaleString(
                            "default",
                            {
                              month:
                                "short",
                            }
                          )
                        }

                      </option>

                    )
                  )
                }

              </select>

            )
          }

          {/* YEAR */}

          {
            (
              filterType ===
                "month" ||

              filterType ===
                "year"
            ) && (

              <select
                value={
                  filterYear
                }
                onChange={(e) =>
                  setFilterYear(
                    e.target.value
                  )
                }
                style={{
                  padding:
                    "10px",

                  borderRadius:
                    "10px",
                }}
              >

                {
                  Array.from(
                    {
                      length:
                        new Date().getFullYear() -
                        2022,
                    },

                    (_, i) => {

                      const year =
                        2023 + i;

                      return (

                        <option
                          key={year}
                          value={
                            year
                          }
                        >

                          {year}

                        </option>

                      );

                    }
                  )
                }

              </select>

            )
          }

        </div>

        {/* ================= CATEGORY TABLE ================= */}

        <div className="table-card">

          <h2>
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
                Object.keys(
                  categoryMap
                ).map((key) => (

                  <tr
                    key={key}
                    onClick={() =>
                      setSelectedCategory(
                        key
                      )
                    }
                    style={{
                      cursor:
                        "pointer",
                    }}
                  >

                    <td
                      style={{
                        color:
                          "#2563eb",

                        fontWeight:
                          "600",
                      }}
                    >

                      {key}

                    </td>

                    <td>

                      {
                        categoryMap[
                          key
                        ].totalCount
                      }

                    </td>

                    <td>

                      ₹ {

                        categoryMap[
                          key
                        ].totalAmount

                      }

                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        </div>

        {/* ================= DETAILS ================= */}

        {
          selectedCategory && (

            <div
              className="table-card"
              style={{
                marginTop:
                  "30px",
              }}
            >

              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",
                }}
              >

                <h2>

                  {
                    selectedCategory
                  }{" "}

                  Expenses

                </h2>

                <button
                  onClick={
                    downloadExcel
                  }
                  style={{
                    background:
                      "#2563eb",

                    color:
                      "#fff",

                    border:
                      "none",

                    padding:
                      "10px 18px",

                    borderRadius:
                      "8px",

                    cursor:
                      "pointer",
                  }}
                >

                  Download

                </button>

              </div>

              {/* SUMMARY */}

              <div
                style={{
                  margin:
                    "20px 0",
                }}
              >

                <h3>

                  Total: ₹ {

                    getTotal(
                      filteredTransactions
                    )

                  }

                </h3>

                <p>

                  Count: {

                    filteredTransactions.length

                  }

                </p>

              </div>

              {/* TABLE */}

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
                    filteredTransactions.length >
                    0

                      ? (

                        filteredTransactions.map(
                          (
                            item,
                            i
                          ) => (

                            <tr
                              key={i}
                            >

                              <td>
                                {
                                  item.title
                                }
                              </td>

                              <td>

                                ₹ {
                                  item.amount
                                }

                              </td>

                              <td>
                                {
                                  item.date
                                }
                              </td>

                            </tr>

                          )
                        )

                      )

                      : (

                        <tr>

                          <td
                            colSpan="3"
                            style={{
                              textAlign:
                                "center",
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