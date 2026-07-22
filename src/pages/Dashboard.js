import {
  useState,
  useContext,
} from "react";


import {
  addUserDocument,
  deleteUserDocument,
  updateUserDocument,
} from "../services/firestoreData";

import useFirestoreCollection from "../hooks/useFirestoreCollection";
import useBudgetNotifications from "../hooks/useBudgetNotifications";

import {
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import { motion } from "framer-motion";

import Sidebar from "../components/Sidebar";

import TopNavbar from "../components/TopNavbar";

import SummaryCards from "../components/SummaryCards";

import TransactionForm from "../components/TransactionForm";

import {
  ThemeContext,
} from "../context/ThemeContext";

import {
  CurrencyContext,
} from "../context/CurrencyContext";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  toast,
} from "react-toastify";

function Dashboard() {

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

  const {
    items: budgets,
  } =
    useFirestoreCollection(
      "budgets",
      "budgets"
    );

  useBudgetNotifications(budgets, transactions);

  const [editData, setEditData] =
    useState(null);

  // ADD TRANSACTION

  const addTransaction = async (data) => {

    if (
      Number(data.amount) <= 0
    ) {

      toast.error(
        "Amount must be greater than 0"
      );

      return;
    }

    try {

      await addUserDocument(
        "transactions",
        {
          ...data,
          id: Date.now(),
        }
      );

      toast.success(
        "Transaction Added Successfully"
      );

    } catch (error) {

      toast.error(error.message);

    }
  };

  // DELETE TRANSACTION

  const deleteTransaction = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this transaction?"
      );

    if (!confirmDelete)
      return;

    try {

      await deleteUserDocument(
        "transactions",
        id
      );

      toast.success(
        "Transaction Deleted"
      );

    } catch (error) {

      toast.error(error.message);

    }
  };

  // EDIT TRANSACTION

  const editTransaction = (
    item
  ) => {

    setEditData(item);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // UPDATE TRANSACTION

  const updateTransaction = async (
    updatedItem
  ) => {

    try {

      await updateUserDocument(
        "transactions",
        updatedItem.id,
        updatedItem
      );

      setEditData(null);

      toast.success(
        "Transaction Updated"
      );

    } catch (error) {

      toast.error(error.message);

    }
  };

  // CATEGORY COLORS

  const categoryColors = {

    Food: "#f97316",

    Travel: "#3b82f6",

    Shopping: "#ec4899",

    Entertainment: "#8b5cf6",

    Bills: "#ef4444",

    Health: "#10b981",

    Education: "#0ea5e9",

    Salary: "#22c55e",

    "Personal Saving": "#14b8a6",

    Other: "#6b7280",

  };

  // CATEGORY DATA

  const categoryMap = {};

  transactions.forEach((item) => {

    if (
      item.type === "expense"
    ) {

      if (
        categoryMap[
          item.category
        ]
      ) {

        categoryMap[
          item.category
        ] += Number(
          item.amount
        );

      } else {

        categoryMap[
          item.category
        ] = Number(
          item.amount
        );

      }
    }
  });

  const expenseData =
    Object.keys(categoryMap)
      .map((key) => ({

        name: key,

        value:
          categoryMap[key],

        color:
          categoryColors[key] ||
          "#6b7280",

      }));

  // MONTHLY DATA

  const monthlyMap = {};

  transactions.forEach((item) => {

    const month =
      new Date(
        item.date
      ).toLocaleString(
        "default",
        {
          month: "short",
        }
      );

    if (
      !monthlyMap[month]
    ) {

      monthlyMap[month] = {

        month,

        income: 0,

        expense: 0,

      };
    }

    if (
      item.type === "income"
    ) {

      monthlyMap[month]
        .income += Number(
        item.amount
      );

    } else {

      monthlyMap[month]
        .expense += Number(
        item.amount
      );
    }

  });

  const monthlyData =
    Object.values(
      monthlyMap
    );


  // CURRENT MONTH TRANSACTIONS (for summary cards)

  const now = new Date();

  const currentMonthTransactions =
    transactions.filter((item) => {
      const itemDate = new Date(item.date);

      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    });

  // PERSONAL SAVING TOTAL

  const personalSaving =
    transactions
      .filter(
        (item) =>
          item.category ===
          "Personal Saving"
      )
      .reduce(
        (acc, item) =>
          acc +
          Number(
            item.amount
          ),
        0
      );

  // TOP CATEGORY

  const topCategory =
    expenseData.length > 0

      ? expenseData.reduce(
          (prev, current) =>

            prev.value >
            current.value

              ? prev

              : current
        )

      : null;

  return (

    <div
      className={
        darkMode

          ? "dashboard dark"

          : "dashboard"
      }
    >

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}

      <div className="main-content">

        {/* NAVBAR */}

        <TopNavbar
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        {/* HEADER */}

        <motion.div
          className="dashboard-header"
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back 👋
            </p>

          </div>

        </motion.div>

        {/* SUMMARY (CURRENT MONTH) */}

        <SummaryCards
          transactions={
            currentMonthTransactions
          }
        />

        {/* EXTRA INSIGHTS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginTop: "25px",
            marginBottom: "25px",
          }}
        >

          {/* PERSONAL SAVING */}

          <motion.div
            whileHover={{
              scale: 1.02,
            }}
            transition={{
              duration: 0.2,
            }}
            style={{
              background:
                darkMode
                  ? "#1f2937"
                  : "#ffffff",
              padding: "24px",
              borderRadius: "18px",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "140px",
            }}
          >

            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#9ca3af",
                marginBottom: "12px",
              }}
            >

              Personal Saving

            </p>

            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#14b8a6",
                margin: 0,
              }}
            >

              {symbol} {
                personalSaving.toLocaleString()
              }

            </h2>

          </motion.div>

          {/* HIGHEST EXPENSE */}

          <motion.div
            whileHover={{
              scale: 1.02,
            }}
            transition={{
              duration: 0.2,
            }}
            style={{
              background:
                darkMode
                  ? "#1f2937"
                  : "#ffffff",
              padding: "24px",
              borderRadius: "18px",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "140px",
            }}
          >

            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#9ca3af",
                marginBottom: "12px",
              }}
            >

              Highest Expense

            </p>

            <h2
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color:
                  darkMode
                    ? "#ffffff"
                    : "#111827",
                margin: 0,
              }}
            >

              {
                topCategory

                  ? topCategory.name

                  : "No Data"
              }

            </h2>

            {
              topCategory && (

                <span
                  style={{
                    marginTop: "10px",
                    color: "#ef4444",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >

                  {symbol} {
                    topCategory.value.toLocaleString()
                  }

                </span>

              )
            }

          </motion.div>

        </div>

        {/* MAIN GRID */}

        <div className="dashboard-layout">

          {/* LEFT */}

          <div className="dashboard-left">

            {/* FORM */}

            <motion.div
              initial={{
                opacity: 0,
                x: -30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
              }}
            >

              <TransactionForm
                addTransaction={
                  addTransaction
                }
                editData={
                  editData
                }
                updateTransaction={
                  updateTransaction
                }
              />

            </motion.div>

            {/* TRANSACTION TABLE */}

            <motion.div
              className="table-card"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
            >

              <div className="table-top">

                <h2 className="section-title">

                  Recent Transactions

                </h2>

              </div>

              <table>

                <thead>

                  <tr>

                    <th>
                      Title
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    transactions.length > 0

                      ? (

                        transactions
                          .slice(-5)
                          .reverse()
                          .map((item) => (

                            <tr
                              key={item.id}
                            >

                              <td>
                                {item.title}
                              </td>

                              {/* FIXED PERSONAL SAVING CATEGORY */}

                              <td>

                                <span
                                  style={{

                                    background:
                                      item.category ===
                                      "Personal Saving"

                                        ? "#14b8a6"

                                        : categoryColors[
                                            item.category
                                          ] ||
                                          "#6b7280",

                                    color:
                                      "#ffffff",

                                    padding:
                                      item.category ===
                                      "Personal Saving"

                                        ? "12px 20px"

                                        : "10px 18px",

                                    borderRadius:
                                      "999px",

                                    fontSize:
                                      item.category ===
                                      "Personal Saving"

                                        ? "15px"

                                        : "14px",

                                    fontWeight:
                                      "700",

                                    display:
                                      "inline-block",

                                    minWidth:
                                      item.category ===
                                      "Personal Saving"

                                        ? "170px"

                                        : "auto",

                                    textAlign:
                                      "center",

                                    whiteSpace:
                                      "nowrap",

                                  }}
                                >

                                  {
                                    item.category
                                  }

                                </span>

                              </td>

                              <td
                                style={{
                                  fontWeight:
                                    "600",

                                  color:
                                    item.type ===
                                    "income"

                                      ? "#22c55e"

                                      : "#ef4444",
                                }}
                              >

                                {symbol} {

                                  Number(
                                    item.amount
                                  )
                                    .toLocaleString()

                                }

                              </td>

                              <td>

                                <span
                                  className={
                                    item.type ===
                                    "income"

                                      ? "income-badge"

                                      : "expense-badge"
                                  }
                                >

                                  {
                                    item.type
                                  }

                                </span>

                              </td>

                              <td>
                                {item.date}
                              </td>

                              <td>

                                <div className="action-buttons">

                                  <button
                                    className="edit-btn"
                                    onClick={() =>
                                      editTransaction(item)
                                    }
                                  >

                                    <FaEdit />

                                  </button>

                                  <button
                                    className="delete-btn"
                                    onClick={() =>
                                      deleteTransaction(item.id)
                                    }
                                  >

                                    <FaTrash />

                                  </button>

                                </div>

                              </td>

                            </tr>

                          ))

                      )

                      : (

                        <tr>

                          <td
                            colSpan="6"
                            style={{
                              textAlign:
                                "center",

                              padding:
                                "30px",

                              fontWeight:
                                "600",
                            }}
                          >

                            No Transactions Found

                          </td>

                        </tr>

                      )
                  }

                </tbody>

              </table>

            </motion.div>

          </div>

          {/* RIGHT */}

          <div className="dashboard-right">

            {/* PIE CHART */}

            <motion.div
              className="chart-card"
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
              }}
            >

              <h3>
                Expense By Category
              </h3>

              {
                expenseData.length > 0

                  ? (

                    <ResponsiveContainer
                      width="100%"
                      height={320}
                    >

                      <PieChart>

                        <Pie
                          data={expenseData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={50}
                          paddingAngle={3}
                          label
                        >

                          {
                            expenseData.map(
                              (
                                entry,
                                index
                              ) => (

                                <Cell
                                  key={index}
                                  fill={
                                    entry.color
                                  }
                                />

                              )
                            )
                          }

                        </Pie>

                        <Tooltip />

                        <Legend />

                      </PieChart>

                    </ResponsiveContainer>

                  )

                  : (

                    <div
                      style={{
                        height:
                          "320px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        fontSize:
                          "18px",

                        fontWeight:
                          "600",
                      }}
                    >

                      No Data Found

                    </div>

                  )
              }

            </motion.div>

            {/* LINE CHART */}

            <motion.div
              className="chart-card"
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
              }}
            >

              <h3>
                Monthly Overview
              </h3>

              {
                monthlyData.length > 0

                  ? (

                    <ResponsiveContainer
                      width="100%"
                      height={320}
                    >

                      <LineChart
                        data={
                          monthlyData
                        }
                      >

                        <XAxis
                          dataKey="month"
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="income"
                          stroke="#22c55e"
                          strokeWidth={3}
                        />

                        <Line
                          type="monotone"
                          dataKey="expense"
                          stroke="#ef4444"
                          strokeWidth={3}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  )

                  : (

                    <div
                      style={{
                        height:
                          "320px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        fontSize:
                          "18px",

                        fontWeight:
                          "600",
                      }}
                    >

                      No Data Found

                    </div>

                  )
              }

            </motion.div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
