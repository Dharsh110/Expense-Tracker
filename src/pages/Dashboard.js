import {
  useState,
  useEffect,
  useContext,
} from "react";

import { signOut } from "firebase/auth";

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

import { useNavigate } from "react-router-dom";

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
  CartesianGrid,
} from "recharts";

import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

function Dashboard() {

  const navigate = useNavigate();

  const {
    darkMode,
    toggleTheme,
  } = useContext(ThemeContext);

  const [transactions, setTransactions] =
    useState([]);

  const [editData, setEditData] =
    useState(null);

  // CURRENT MONTH + YEAR

  const currentDate = new Date();

  const currentMonth =
    currentDate.getMonth();

  const currentYear =
    currentDate.getFullYear();

  // FETCH FIRESTORE DATA

  useEffect(() => {

    fetchTransactions();

  }, []);

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

      const data =
        querySnapshot.docs.map(
          (doc) => ({

            firestoreId:
              doc.id,

            ...doc.data(),

          })
        );

      setTransactions(data);

    } catch (error) {

      console.log(error);

      toast.error(
        "Failed to fetch transactions"
      );

    }

  };

  // ADD TRANSACTION

  const addTransaction =
    async (data) => {

      if (
        Number(data.amount) <= 0
      ) {

        toast.error(
          "Amount must be greater than 0"
        );

        return;

      }

      try {

        const user =
          auth.currentUser;

        if (!user) {

          toast.error(
            "User not logged in"
          );

          return;

        }

        const transactionData = {
          ...data,

          userId:
            user.uid,

          createdAt:
            new Date(),
        };

        const docRef =
          await addDoc(
            collection(
              db,
              "transactions"
            ),
            transactionData
          );

        const newTransaction = {

          firestoreId:
            docRef.id,

          ...transactionData,

        };

        setTransactions([
          ...transactions,
          newTransaction,
        ]);

        toast.success(
          "Transaction Added Successfully"
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to add transaction"
        );

      }

    };

  // DELETE TRANSACTION

  const deleteTransaction =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this transaction?"
        );

      if (!confirmDelete)
        return;

      try {

        await deleteDoc(
          doc(
            db,
            "transactions",
            id
          )
        );

        const filtered =
          transactions.filter(
            (item) =>
              item.firestoreId !== id
          );

        setTransactions(filtered);

        toast.success(
          "Transaction Deleted"
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to delete transaction"
        );

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

  const updateTransaction =
    async (updatedItem) => {

      try {

        const user =
          auth.currentUser;

        if (!user) {

          toast.error(
            "User not logged in"
          );

          return;

        }

        const transactionRef =
          doc(
            db,
            "transactions",
            updatedItem.firestoreId
          );

        await updateDoc(
          transactionRef,
          {
            ...updatedItem,

            userId:
              user.uid,
          }
        );

        const updated =
          transactions.map(
            (item) =>

              item.firestoreId ===
              updatedItem.firestoreId

                ? {
                    ...updatedItem,
                    userId:
                      user.uid,
                  }

                : item
          );

        setTransactions(updated);

        setEditData(null);

        toast.success(
          "Transaction Updated"
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to update transaction"
        );

      }

    };

  // LOGOUT

  const handleLogout = async () => {

    try {

      await signOut(auth);

      toast.success(
        "Logout Successful"
      );

      navigate("/");

    } catch (error) {

      toast.error(
        error.message
      );

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

  // CURRENT MONTH TRANSACTIONS

  const currentMonthTransactions =
    transactions.filter(
      (item) => {

        const transactionDate =
          new Date(item.date);

        return (
          transactionDate.getMonth() ===
            currentMonth &&
          transactionDate.getFullYear() ===
            currentYear
        );

      }
    );

  // PIE CHART DATA

  const categoryMap = {};

  currentMonthTransactions.forEach(
    (item) => {

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

    }
  );

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

  // LINE CHART DATA (CURRENT MONTH DAYS)

  const dailyMap = {};

  currentMonthTransactions.forEach(
    (item) => {

      const day =
        new Date(
          item.date
        ).getDate();

      if (
        !dailyMap[day]
      ) {

        dailyMap[day] = {

          day,

          income: 0,

          expense: 0,

        };

      }

      if (
        item.type === "income"
      ) {

        dailyMap[day]
          .income += Number(
          item.amount
        );

      } else {

        dailyMap[day]
          .expense += Number(
          item.amount
        );

      }

    }
  );

  const monthlyData =
    Object.values(
      dailyMap
    ).sort(
      (a, b) =>
        a.day - b.day
    );

  return (

    <div
      className={
        darkMode
          ? "dashboard dark"
          : "dashboard"
      }
    >

      <ToastContainer />

      <Sidebar
        handleLogout={
          handleLogout
        }
      />

      <div className="main-content">

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

        {/* SUMMARY */}

        <SummaryCards
          transactions={
            transactions
          }
        />

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

            {/* TABLE */}

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
                          .slice(-8)
                          .reverse()
                          .map((item) => (

                            <tr
                              key={
                                item.firestoreId
                              }
                            >

                              <td>
                                {item.title}
                              </td>

                              <td>

                                <span
                                  style={{
                                    background:
                                      categoryColors[
                                        item.category
                                      ] ||
                                      "#6b7280",

                                    color:
                                      "#ffffff",

                                    padding:
                                      "10px 18px",

                                    borderRadius:
                                      "999px",

                                    fontSize:
                                      "14px",

                                    fontWeight:
                                      "700",
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

                                ₹ {
                                  Number(
                                    item.amount
                                  ).toLocaleString()
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
                                      deleteTransaction(
                                        item.firestoreId
                                      )
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
                Current Month Expense By Category
              </h3>

              {expenseData.length > 0 ? (
                <>
                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >

                    <PieChart>

                      <Pie
                        data={expenseData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                      >

                        {expenseData.map(
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
                        )}

                      </Pie>

                      <Tooltip
                            contentStyle={{
                              backgroundColor:
                                darkMode
                                  ? "#111827"
                                  : "#ffffff",

                              border: darkMode
                                ? "1px solid #374151"
                                : "1px solid #d1d5db",

                              borderRadius:
                                "12px",

                              color:
                                darkMode
                                  ? "#ffffff"
                                  : "#111827",

                              fontWeight:
                                "600",
                            }}
                            formatter={(
                              value,
                              name
                            ) => [

                              `₹ ${Number(
                                value
                              ).toLocaleString()}`,

                              name,

                            ]}
                          />

                    </PieChart>

                  </ResponsiveContainer>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent:
                        "center",
                      gap: "14px",
                      marginTop: "18px",
                    }}
                  >

                    {expenseData.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          key={index}
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                            fontWeight:
                              "600",
                            fontSize:
                              "15px",
                            color: darkMode
                              ? "#ffffff"
                              : "#111827",
                          }}
                        >

                          <div
                            style={{
                              width:
                                "14px",
                              height:
                                "14px",
                              borderRadius:
                                "50%",
                              backgroundColor:
                                item.color,
                            }}
                          />

                          <span>
                            {
                              item.name
                            }
                          </span>

                        </div>

                      )
                    )}

                  </div>
                </>
              ) : (
                <div
                  style={{
                    height: "320px",
                    display: "flex",
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
              )}

            </motion.div>

            {/* LINE CHART */}

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
  style={{
    marginTop: "20px",
  }}
>

  <h3>
    Current Month Overview
  </h3>

  {
    monthlyData.length > 0

      ? (

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <LineChart
            data={monthlyData}
            margin={{
              top: 10,
              right: 20,
              left: 25,
              bottom: 5,
            }}
          >

            {/* GRID */}

            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
            />

            {/* X AXIS */}

            <XAxis
              dataKey="day"
              tick={{
                fill:
                  darkMode
                    ? "#ffffff"
                    : "#111827",

                fontSize: 11,
              }}
              tickMargin={10}
            />

            {/* Y AXIS */}

            <YAxis
              width={75}
              tick={{
                fill:
                  darkMode
                    ? "#ffffff"
                    : "#111827",

                fontSize: 11,
              }}
              tickFormatter={(
                value
              ) =>
                `₹${value}`
              }
            />

            {/* TOOLTIP */}

            <Tooltip
              contentStyle={{
                backgroundColor:
                  darkMode
                    ? "#111827"
                    : "#ffffff",

                border: darkMode
                  ? "1px solid #374151"
                  : "1px solid #d1d5db",

                borderRadius:
                  "12px",

                color:
                  darkMode
                    ? "#ffffff"
                    : "#111827",

                fontWeight:
                  "600",
              }}
              formatter={(
                value
              ) => [

                `₹ ${Number(
                  value
                ).toLocaleString()}`,

              ]}
            />

            {/* LEGEND */}

            <Legend
              wrapperStyle={{
                color:
                  darkMode
                    ? "#ffffff"
                    : "#111827",

                fontSize: "14px",
              }}
            />

            {/* INCOME LINE */}

            <Line
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{
                r: 5,
              }}
              activeDot={{
                r: 7,
              }}
            />

            {/* EXPENSE LINE */}

            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{
                r: 5,
              }}
              activeDot={{
                r: 7,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      )

      : (

        <div
          style={{
            height: "320px",

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            fontSize:
              "18px",

            fontWeight:
              "600",

            color:
              darkMode
                ? "#ffffff"
                : "#111827",
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