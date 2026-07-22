import {
  useState,
  useContext,
} from "react";

import { toast } from "react-toastify";

import {
  addUserDocument,
  deleteUserDocument,
  updateUserDocument,
} from "../services/firestoreData";

import useFirestoreCollection from "../hooks/useFirestoreCollection";

import {
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaSort,
  FaSearch,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";

import TopNavbar from "../components/TopNavbar";

import {
  ThemeContext,
} from "../context/ThemeContext";

import {
  CurrencyContext,
} from "../context/CurrencyContext";

const MONTHS = [
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

function Transactions() {

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

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [filterType, setFilterType] =
    useState("all");

  const [selectedMonth, setSelectedMonth] =
    useState(MONTHS[new Date().getMonth()]);

  const [selectedYear, setSelectedYear] =
    useState(String(new Date().getFullYear()));

  const [selectedDate, setSelectedDate] =
    useState("");

  const [sortField, setSortField] =
    useState(null);

  const [sortOrder, setSortOrder] =
    useState("asc");

  const [editId, setEditId] =
    useState(null);

  const [formData, setFormData] =
    useState({

      title: "",

      amount: "",

      category: "",

      type: "expense",

      date: "",

    });

  const years = [];
  for (
    let year = 2023;
    year <= new Date().getFullYear();
    year++
  ) {
    years.push(year);
  }

  // HANDLE INPUT

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });

  };

  // SAVE

  const saveTransaction = async () => {

    if (

      !formData.title ||

      !formData.amount ||

      !formData.category ||

      !formData.date

    ) {

      return false;
    }

    // EDIT

    if (editId) {

      await updateUserDocument(
        "transactions",
        editId,
        {
          ...formData,
          id: editId,
        }
      );

    }

    // ADD

    else {

      await addUserDocument(
        "transactions",
        {
          ...formData,
          id: Date.now(),
        }
      );
    }

    return true;
  };

  // ADD MORE

  const addMoreTransaction = async () => {

    const success =
      await saveTransaction();

    if (!success) {

      toast.error(
        "Please fill all fields"
      );

      return;
    }

    setFormData({

      title: "",

      amount: "",

      category: "",

      type: "expense",

      date: "",

    });

  };

  // DONE

  const handleDone = async () => {

    if (

      formData.title ||

      formData.amount ||

      formData.category ||

      formData.date

    ) {

      const success =
        await saveTransaction();

      if (!success) {

        toast.error(
          "Please fill all fields"
        );

        return;
      }

    }

    setShowModal(false);

    setEditId(null);

    setFormData({

      title: "",

      amount: "",

      category: "",

      type: "expense",

      date: "",

    });

  };

  // DELETE

  const deleteTransaction = async (id) => {

    await deleteUserDocument(
      "transactions",
      id
    );
  };

  // EDIT

  const editTransaction = (item) => {

    setFormData({

      title: item.title,

      amount: item.amount,

      category: item.category,

      type: item.type,

      date: item.date,

    });

    setEditId(item.id);

    setShowModal(true);
  };

  // SORT

  const toggleSort = (field) => {

    if (sortField === field) {

      setSortOrder(
        sortOrder === "asc" ? "desc" : "asc"
      );

    } else {

      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortIcon = (field) => {

    if (sortField !== field) return <FaSort />;

    return sortOrder === "asc" ? (
      <FaArrowUp />
    ) : (
      <FaArrowDown />
    );
  };

  // FILTER

  const filteredTransactions =
    transactions.filter(
      (item) => {

        const itemDate =
          new Date(item.date);

        const searchMatch =

          item.title
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          item.category
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          item.type
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            );

        let periodMatch = true;

        if (filterType === "week") {

          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          periodMatch = itemDate >= weekAgo;

        } else if (filterType === "month") {

          periodMatch =
            MONTHS[itemDate.getMonth()] === selectedMonth &&
            itemDate.getFullYear() === Number(selectedYear);

        } else if (filterType === "year") {

          periodMatch =
            itemDate.getFullYear() === Number(selectedYear);
        }

        const dateMatch =

          selectedDate === ""

            ? true

            : item.date === selectedDate;

        return (

          searchMatch &&

          periodMatch &&

          dateMatch

        );

      }
    );

  const sortedTransactions =
    [...filteredTransactions];

  if (sortField) {

    sortedTransactions.sort((a, b) => {

      let cmp;

      if (sortField === "amount") {

        cmp = Number(a.amount) - Number(b.amount);

      } else {

        cmp = new Date(a.date) - new Date(b.date);
      }

      return sortOrder === "asc" ? cmp : -cmp;
    });
  }

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

      {/* MAIN */}

      <div className="main-content">

        {/* TOP NAVBAR */}

        <TopNavbar
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <h1>
              Transactions
            </h1>

            <p>
              Track your income
              and expenses
            </p>

          </div>

        </div>

        {/* TABLE CARD */}

        <div className="table-card">

          {/* TOP */}

          <div className="table-top">

            <h2 className="section-title">

              Transaction History

            </h2>

            <div className="txn-search-box">
              <FaSearch />

              <input
                type="text"
                placeholder="Search title, category, type..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

          </div>

          {/* FILTERS */}

          <div className="txn-filters">

            <button
              className={
                filterType === "all" ? "txn-filter-btn active" : "txn-filter-btn"
              }
              onClick={() => setFilterType("all")}
            >
              All
            </button>

            <button
              className={
                filterType === "week" ? "txn-filter-btn active" : "txn-filter-btn"
              }
              onClick={() => setFilterType("week")}
            >
              This Week
            </button>

            <button
              className={
                filterType === "month" ? "txn-filter-btn active" : "txn-filter-btn"
              }
              onClick={() => setFilterType("month")}
            >
              Month
            </button>

            <button
              className={
                filterType === "year" ? "txn-filter-btn active" : "txn-filter-btn"
              }
              onClick={() => setFilterType("year")}
            >
              Year
            </button>

            {filterType === "month" && (
              <>
                <select
                  className="txn-select"
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(e.target.value)
                  }
                >
                  {MONTHS.map((month) => (
                    <option key={month}>{month}</option>
                  ))}
                </select>

                <select
                  className="txn-select"
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(e.target.value)
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </>
            )}

            {filterType === "year" && (
              <select
                className="txn-select"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(e.target.value)
                }
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}

            {/* SPECIFIC DATE */}

            <input
              type="date"
              className="txn-select txn-date-input"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
            />

            {selectedDate && (
              <button
                className="txn-clear-btn"
                onClick={() => setSelectedDate("")}
              >
                Clear Date
              </button>
            )}

          </div>

          {/* TABLE */}

          <table>

            <thead>

              <tr>

                <th>
                  Title
                </th>

                <th
                  className="sortable-th"
                  onClick={() => toggleSort("amount")}
                >
                  Amount {sortIcon("amount")}
                </th>

                <th>
                  Category
                </th>

                <th>
                  Type
                </th>

                <th
                  className="sortable-th"
                  onClick={() => toggleSort("date")}
                >
                  Date {sortIcon("date")}
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {
                sortedTransactions.length > 0

                  ? (

                    sortedTransactions.map(
                      (item) => (

                        <tr
                          key={item.id}
                        >

                          <td>
                            {item.title}
                          </td>

                          <td
                            style={{
                              fontWeight: "600",
                              color:
                                item.type ===
                                "income"

                                  ? "#22c55e"

                                  : "#ef4444",
                            }}
                          >
                            {symbol} {item.amount}
                          </td>

                          <td>

                            <span
                            className={`category-badge category-${item.category
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {item.category}
                          </span>

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

                              {item.type}

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

                      )
                    )

                  )

                  : (

                    <tr>

                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center",
                          padding: "30px",
                          fontWeight: "600",
                        }}
                      >

                        No Transactions Found

                      </td>

                    </tr>

                  )
              }

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}

      {
        showModal && (

          <div className="modal-overlay">

            <div className="transaction-modal">

              <div className="modal-header">

                <h2>

                  {
                    editId

                      ? "Edit Transaction"

                      : "Add Transaction"
                  }

                </h2>

                <button
                  className="close-modal"
                  onClick={() =>
                    setShowModal(false)
                  }
                >

                  ×

                </button>

              </div>

              <div className="modal-form">

                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                />

                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleChange}
                />

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Category
                  </option>

                  <option>
                    Food
                  </option>

                  <option>
                    Travel
                  </option>

                  <option>
                    Shopping
                  </option>

                  <option>
                    Entertainment
                  </option>

                  <option>
                    Bills
                  </option>

                  <option>
                    Health
                  </option>

                  <option>
                    Education
                  </option>

                  <option>
                    Salary
                  </option>

                  <option>
                    Personal Saving
                  </option>

                  <option>
                    Other
                  </option>

                </select>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >

                  <option value="expense">
                    Expense
                  </option>

                  <option value="income">
                    Income
                  </option>

                </select>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />

                {/* BUTTONS */}

                <div className="modal-buttons">

                  <button
                    className="primary-btn"
                    onClick={
                      addMoreTransaction
                    }
                  >

                    Add More

                  </button>

                  <button
                    className="save-close-btn"
                    onClick={handleDone}
                  >

                    {
                      editId

                        ? "Update"

                        : "Done"
                    }

                  </button>

                </div>

              </div>

            </div>

          </div>

        )
      }

      <style>
        {`
          .sortable-th {
            cursor: pointer;
            user-select: none;
          }

          .sortable-th svg {
            margin-left: 6px;
            font-size: 12px;
            vertical-align: middle;
          }

          .txn-search-box {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 18px;
            border-radius: 999px;
            background: ${darkMode ? "#1e293b" : "#f3f4f6"};
            border: 1px solid ${darkMode ? "#334155" : "#e5e7eb"};
            transition: all 0.2s ease;
            min-width: 260px;
          }

          .txn-search-box:focus-within {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            background: ${darkMode ? "#0f172a" : "#ffffff"};
          }

          .txn-search-box svg {
            color: ${darkMode ? "#94a3b8" : "#9ca3af"};
            font-size: 14px;
          }

          .txn-search-box input {
            border: none;
            outline: none;
            background: transparent;
            width: 100%;
            font-size: 14px;
            color: ${darkMode ? "#f1f5f9" : "#111827"};
          }

          .txn-filters {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
            margin: 18px 0 22px;
          }

          .txn-filter-btn {
            padding: 9px 20px;
            border: 1px solid ${darkMode ? "#334155" : "#e5e7eb"};
            border-radius: 999px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            background: ${darkMode ? "#1e293b" : "#ffffff"};
            color: ${darkMode ? "#cbd5e1" : "#4b5563"};
            transition: all 0.2s ease;
          }

          .txn-filter-btn:hover {
            border-color: #818cf8;
            color: #6366f1;
            transform: translateY(-1px);
          }

          .txn-filter-btn.active {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-color: transparent;
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
          }

          .txn-select {
            padding: 9px 14px;
            border-radius: 999px;
            border: 1px solid ${darkMode ? "#334155" : "#e5e7eb"};
            background: ${darkMode ? "#1e293b" : "#ffffff"};
            color: ${darkMode ? "#f1f5f9" : "#111827"};
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
          }

          .txn-date-input {
            cursor: text;
          }

          .txn-clear-btn {
            padding: 9px 16px;
            border-radius: 999px;
            border: none;
            background: ${darkMode ? "#7f1d1d" : "#fee2e2"};
            color: ${darkMode ? "#fca5a5" : "#dc2626"};
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .txn-clear-btn:hover {
            background: ${darkMode ? "#991b1b" : "#fecaca"};
          }
        `}
      </style>

    </div>
  );
}

export default Transactions;
