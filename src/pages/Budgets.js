import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

import {
  ThemeContext,
} from "../context/ThemeContext";

import {
  FaTrash,
  FaEdit,
  FaDownload,
} from "react-icons/fa";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

function Budgets() {

  const {
    darkMode,
    toggleTheme,
  } = useContext(ThemeContext);

  const [category, setCategory] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [budgetType, setBudgetType] =
    useState("Select Type");

  const [selectedMonth, setSelectedMonth] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState("");

  const [budgets, setBudgets] =
    useState([]);

  const [transactions, setTransactions] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  // FILTER STATES

  const [filterOption, setFilterOption] =
    useState("all");

  const [filterMonth, setFilterMonth] =
    useState("");

  const [filterYear, setFilterYear] =
    useState("");

  const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Personal Saving",
    "Salary",
    "Others",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [];

  for (
    let year = 2023;
    year <= new Date().getFullYear();
    year++
  ) {

    years.push(year);

  }

  // LOAD FIRESTORE DATA

  useEffect(() => {

    fetchBudgets();

    fetchTransactions();

  }, []);

  // FETCH BUDGETS

  const fetchBudgets = async () => {

    try {

      const user =
        auth.currentUser;

      if (!user) return;

      const q = query(
        collection(
          db,
          "budgets"
        ),
        where(
          "userId",
          "==",
          user.uid
        )
      );

      const querySnapshot =
        await getDocs(q);

      const budgetData = [];

      querySnapshot.forEach(
        (doc) => {

          budgetData.push({

            id: doc.id,

            ...doc.data(),

          });

        }
      );

      setBudgets(budgetData);

    } catch (error) {

      console.log(error);

    }

  };

  // FETCH TRANSACTIONS

  const fetchTransactions = async () => {

    try {

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

      const querySnapshot =
        await getDocs(q);

      const transactionData = [];

      querySnapshot.forEach(
        (doc) => {

          transactionData.push({

            id: doc.id,

            ...doc.data(),

          });

        }
      );

      setTransactions(
        transactionData
      );

    } catch (error) {

      console.log(error);

    }

  };

  // CALCULATE SPENT

  const calculateSpent =
    useCallback(

      (
        categoryName,
        type,
        month,
        year
      ) => {

        const now =
          new Date();

        const filtered =
          transactions.filter(
            (item) => {

              // ✅ ONLY EXPENSES

              if (
                item.type !==
                "expense"
              ) {

                return false;

              }

              if (
                item.category !==
                categoryName
              ) {

                return false;

              }

              const itemDate =
                new Date(
                  item.date
                );

              if (
                type ===
                "Weekly"
              ) {

                const weekAgo =
                  new Date();

                weekAgo.setDate(
                  now.getDate() -
                    7
                );

                return (
                  itemDate >=
                  weekAgo
                );

              }

              if (
                type ===
                "Monthly"
              ) {

                const itemMonth =
                  itemDate.toLocaleString(
                    "default",
                    {
                      month:
                        "long",
                    }
                  );

                return (

                  itemMonth ===
                    month &&

                  itemDate
                    .getFullYear()
                    .toString() ===
                    year

                );

              }

              if (
                type ===
                "Yearly"
              ) {

                return (

                  itemDate
                    .getFullYear()
                    .toString() ===
                    year

                );

              }

              return true;

            }
          );

        return filtered.reduce(
          (
            total,
            item
          ) =>

            total +
            Number(
              item.amount
            ),

          0
        );

      },

      [transactions]
    );

  // SAVE / UPDATE BUDGET

  const saveBudget =
    async () => {

      if (
        !category ||
        !amount
      ) {

        alert(
          "Please fill all fields"
        );

        return;

      }

      const user =
        auth.currentUser;

      if (!user) return;

      const budgetData = {

        category,

        amount:
          Number(amount),

        type:
          budgetType,

        month:
          selectedMonth,

        year:
          selectedYear,

        // ✅ IMPORTANT

        userId:
          user.uid,

        createdAt:
          new Date().toLocaleDateString(
            "en-GB"
          ),
      };

      try {

        // UPDATE

        if (
          editingId
        ) {

          const existingBudget =
            budgets.find(
              (item) =>
                item.id ===
                editingId
            );

          const budgetRef =
            doc(
              db,
              "budgets",
              editingId
            );

          await updateDoc(
            budgetRef,
            {
              ...budgetData,

              // ✅ KEEP USER ID

              userId:
                user.uid,

              createdAt:
                existingBudget?.createdAt ||

                new Date().toLocaleDateString(
                  "en-GB"
                ),
            }
          );

        }

        // ADD

        else {

          await addDoc(
            collection(
              db,
              "budgets"
            ),
            budgetData
          );

        }

        fetchBudgets();

        setEditingId(
          null
        );

        setCategory("");

        setAmount("");

        setBudgetType(
          "Monthly"
        );

        setSelectedMonth(
          ""
        );

        setSelectedYear(
          ""
        );

      } catch (error) {

        console.log(error);

      }

    };

  // DELETE BUDGET

  const deleteBudget =
    async (id) => {

      try {

        await deleteDoc(
          doc(
            db,
            "budgets",
            id
          )
        );

        fetchBudgets();

      } catch (error) {

        console.log(error);

      }

    };

  // EDIT BUDGET

  const editBudget = (
    item
  ) => {

    setEditingId(
      item.id
    );

    setCategory(
      item.category
    );

    setAmount(
      item.amount
    );

    setBudgetType(
      item.type
    );

    setSelectedMonth(
      item.month ||
        ""
    );

    setSelectedYear(
      item.year ||
        ""
    );

  };

  // FILTER DATA

  let filteredBudgets =
    budgets;

  if (
    filterOption ===
    "week"
  ) {

    filteredBudgets =
      budgets.filter(
        (item) =>
          item.type ===
          "Weekly"
      );

  }

  else if (
    filterOption ===
    "month"
  ) {

    filteredBudgets =
      budgets.filter(
        (item) =>

          item.month ===
            filterMonth

      );

  }

  else if (
    filterOption ===
    "year"
  ) {

    filteredBudgets =
      budgets.filter(
        (item) =>

          item.year ===
            filterYear

      );

  }

  // DOWNLOAD CSV

  const downloadCSV =
    () => {

      let csv =
        "S.No,Category,Type,Month,Year,Created Date,Budget,Spent,Remaining\n";

      filteredBudgets.forEach(
        (
          item,
          index
        ) => {

          const spent =
            calculateSpent(
              item.category,
              item.type,
              item.month,
              item.year
            );

          const remaining =
            item.amount -
            spent;

          csv += `${index + 1},${item.category},${item.type},${item.month || "-"},${item.year || "-"},${item.createdAt || "-"},${item.amount},${spent},${remaining}\n`;

        }
      );

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "Budget_Report.csv";

      link.click();

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
          darkMode={
            darkMode
          }
          toggleTheme={
            toggleTheme
          }
        />

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <h1>
              Budget Manager
            </h1>

            <p>
              Weekly, Monthly & Yearly Budget Tracking
            </p>

          </div>

        </div>

        {/* FORM */}

        <div className="form-card">

          <h2 className="section-title">

            {
              editingId

                ? "Update Budget"

                : "Add Budget"
            }

          </h2>

          <div className="form-grid">

            {/* CATEGORY */}

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                value={
                  category
                }
                onChange={(e) =>
                  setCategory(
                    e.target
                      .value
                  )
                }
              >

                <option value="">
                  Select Category
                </option>

                {
                  categories.map(
                    (
                      item,
                      i
                    ) => (

                      <option
                        key={i}
                        value={
                          item
                        }
                      >

                        {item}

                      </option>

                    )
                  )
                }

              </select>

            </div>

            {/* AMOUNT */}

            <div className="form-group">

              <label>
                Budget Amount
              </label>

              <input
                type="number"
                value={
                  amount
                }
                onChange={(e) =>
                  setAmount(
                    e.target
                      .value
                  )
                }
                placeholder="Enter Amount"
              />

            </div>

            {/* TYPE */}

            <div className="form-group">

              <label>
                Budget Type
              </label>

              <select
                value={
                  budgetType
                }
                onChange={(e) =>
                  setBudgetType(
                    e.target
                      .value
                  )
                }
              >

                <option value="Select Type">
                  Select Type
                </option>

                <option value="Weekly">
                  Weekly
                </option>

                <option value="Monthly">
                  Monthly
                </option>

                <option value="Yearly">
                  Yearly
                </option>

              </select>

            </div>

            {/* MONTH */}

            {
              budgetType ===
                "Monthly" && (

                <>

                  <div className="form-group">

                    <label>
                      Select Month
                    </label>

                    <select
                      value={
                        selectedMonth
                      }
                      onChange={(e) =>
                        setSelectedMonth(
                          e.target
                            .value
                        )
                      }
                    >

                      <option value="">
                        Select Month
                      </option>

                      {
                        months.map(
                          (
                            month,
                            index
                          ) => (

                            <option
                              key={
                                index
                              }
                              value={
                                month
                              }
                            >

                              {month}

                            </option>

                          )
                        )
                      }

                    </select>

                  </div>

                  {/* YEAR */}

                  <div className="form-group">

                    <label>
                      Select Year
                    </label>

                    <select
                      value={
                        selectedYear
                      }
                      onChange={(e) =>
                        setSelectedYear(
                          e.target
                            .value
                        )
                      }
                    >

                      <option value="">
                        Select Year
                      </option>

                      {
                        years.map(
                          (
                            year,
                            index
                          ) => (

                            <option
                              key={
                                index
                              }
                              value={
                                year
                              }
                            >

                              {year}

                            </option>

                          )
                        )
                      }

                    </select>

                  </div>

                </>

              )
            }

            {/* YEARLY */}

            {
              budgetType ===
                "Yearly" && (

                <div className="form-group">

                  <label>
                    Select Year
                  </label>

                  <select
                    value={
                      selectedYear
                    }
                    onChange={(e) =>
                      setSelectedYear(
                        e.target
                          .value
                      )
                    }
                  >

                    <option value="">
                      Select Year
                    </option>

                    {
                      years.map(
                        (
                          year,
                          index
                        ) => (

                          <option
                            key={
                              index
                            }
                            value={
                              year
                            }
                          >

                            {year}

                          </option>

                        )
                      )
                    }

                  </select>

                </div>

              )
            }

          </div>

          <button
            className="primary-btn"
            onClick={
              saveBudget
            }
          >

            {
              editingId

                ? "Update Budget"

                : "Save Budget"
            }

          </button>

        </div>

        <br></br>

        {/* FILTER */}

        <div
          style={{
            display: "flex",

            justifyContent:
              "flex-end",

            alignItems:
              "center",

            gap: "12px",

            marginBottom:
              "20px",

            flexWrap:
              "wrap",
          }}
        >

          <div
            style={{
              display:
                "flex",

              gap: "10px",
            }}
          >

            <select
              value={
                filterOption
              }
              onChange={(e) => {

                setFilterOption(
                  e.target.value
                );

                setFilterMonth(
                  ""
                );

                setFilterYear(
                  ""
                );

              }}
              className="month-filter"
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

            {
              filterOption ===
                "month" && (

                <select
                  value={
                    filterMonth
                  }
                  onChange={(e) =>
                    setFilterMonth(
                      e.target
                        .value
                    )
                  }
                  className="month-filter"
                >

                  <option value="">
                    Select Month
                  </option>

                  {
                    months.map(
                      (
                        month,
                        index
                      ) => (

                        <option
                          key={
                            index
                          }
                          value={
                            month
                          }
                        >

                          {month}

                        </option>

                      )
                    )
                  }

                </select>

              )
            }

            {
              filterOption ===
                "year" && (

                <select
                  value={
                    filterYear
                  }
                  onChange={(e) =>
                    setFilterYear(
                      e.target
                        .value
                    )
                  }
                  className="month-filter"
                >

                  <option value="">
                    Select Year
                  </option>

                  {
                    years.map(
                      (
                        year,
                        index
                      ) => (

                        <option
                          key={
                            index
                          }
                          value={
                            year
                          }
                        >

                          {year}

                        </option>

                      )
                    )
                  }

                </select>

              )
            }

          </div>

          <button
            className="download-btn"
            onClick={
              downloadCSV
            }
          >

            <FaDownload />

            {" "}
            Download Excel

          </button>

        </div>

        {/* TABLE */}

        <div className="table-card">

          <h2 className="section-title">

            Budget Report

          </h2>

          {
            filteredBudgets.length ===
            0

              ? (

                <div className="no-data">

                  No Data Found

                </div>

              )

              : (

                <table className="budget-table">

                  <thead>

                    <tr>

                      <th>
                        S.No
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Month
                      </th>

                      <th>
                        Year
                      </th>

                      <th>
                        Created Date
                      </th>

                      <th>
                        Budget
                      </th>

                      <th>
                        Spent
                      </th>

                      <th>
                        Remaining
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {
                      filteredBudgets.map(
                        (
                          item,
                          index
                        ) => {

                          const spent =
                            calculateSpent(
                              item.category,
                              item.type,
                              item.month,
                              item.year
                            );

                          const remaining =
                            item.amount -
                            spent;

                          return (

                            <tr
                              key={
                                item.id
                              }
                            >

                              <td>

                                {
                                  index + 1
                                }

                              </td>

                              <td>

                                {
                                  item.category
                                }

                              </td>

                              <td>

                                {
                                  item.type
                                }

                              </td>

                              <td>

                                {
                                  item.month ||
                                  "-"
                                }

                              </td>

                              <td>

                                {
                                  item.year ||
                                  "-"
                                }

                              </td>

                              <td>

                                {
                                  item.createdAt ||
                                  "-"
                                }

                              </td>

                              <td>

                                ₹{
                                  item.amount
                                }

                              </td>

                              <td>

                                ₹{
                                  spent
                                }

                              </td>

                              <td>

                                ₹{
                                  remaining
                                }

                              </td>

                              <td>

                                {
                                  remaining <
                                  0

                                    ? (

                                      <span className="danger-text">

                                        Exceeded

                                      </span>

                                    )

                                    : (

                                      <span className="success-text">

                                        Safe

                                      </span>

                                    )
                                }

                              </td>

                              <td>

                                <div className="action-buttons">

                                  <button
                                    className="edit-btn"
                                    onClick={() =>
                                      editBudget(
                                        item
                                      )
                                    }
                                  >

                                    <FaEdit />

                                  </button>

                                  <button
                                    className="delete-btn"
                                    onClick={() =>
                                      deleteBudget(
                                        item.id
                                      )
                                    }
                                  >

                                    <FaTrash />

                                  </button>

                                </div>

                              </td>

                            </tr>

                          );

                        }
                      )
                    }

                  </tbody>

                </table>

              )
          }

        </div>

      </div>

    </div>

  );

}

export default Budgets;