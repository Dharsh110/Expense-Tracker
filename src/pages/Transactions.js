import {
  useState,
  useEffect,
  useContext,
} from "react";

import { signOut } from "firebase/auth";

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
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

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

import Sidebar from "../components/Sidebar";

import TopNavbar from "../components/TopNavbar";

import {
  ThemeContext,
} from "../context/ThemeContext";

function Transactions() {

  const navigate =
    useNavigate();

  const {
    darkMode,
    toggleTheme,
  } = useContext(
    ThemeContext
  );

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [filterType, setFilterType] = useState("all");

  const [filterMonth, setFilterMonth] =
  useState(
    (
      new Date().getMonth() + 1
    ).toString()
  );

  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear().toString()
  );

  const [
    editId,
    setEditId,
  ] = useState(null);

  const emptyForm = {

    title: "",

    amount: "",

    category: "",

    type: "expense",

    date: "",

  };

  const [
    formData,
    setFormData,
  ] = useState(
    emptyForm
  );

  useEffect(() => {
  const user = auth.currentUser;

  if (!user) return;

  const q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...doc.data(),
      }));

      setTransactions(data);
    },
    (error) => {
      console.log(error);
    }
  );

  return () => unsubscribe();
}, []);

  // LOGOUT

  const handleLogout =
    async () => {

      await signOut(auth);

      navigate("/");

    };

  // HANDLE CHANGE

  const handleChange = (
    e
  ) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });

  };

  // SAVE TRANSACTION

  const saveTransaction =
    async () => {

      if (

        !formData.title ||

        !formData.amount ||

        !formData.category ||

        !formData.date

      ) {

        return false;

      }

      const user =
        auth.currentUser;

      if (!user) {

        alert(
          "User not logged in"
        );

        return false;

      }

      const payload = {

        ...formData,

        amount:
          Number(
            formData.amount
          ),

        // ✅ IMPORTANT

        userId:
          user.uid,

      };

      // UPDATE

      if (editId) {

        const transactionRef =
          doc(
            db,
            "transactions",
            editId
          );

        await updateDoc(
          transactionRef,
          {
            ...payload,

            // ✅ KEEP USER ID

            userId:
              user.uid,
          }
        );

        setTransactions(

          transactions.map(
            (item) =>

              item.firestoreId ===
              editId

                ? {

                    ...payload,

                    firestoreId:
                      editId,

                  }

                : item
          )

        );

      }

      // ADD

      else {

        const docRef =
          await addDoc(
            collection(
              db,
              "transactions"
            ),
            {

              ...payload,

              createdAt:
                new Date(),

            }
          );

        setTransactions([

          ...transactions,

          {

            ...payload,

            firestoreId:
              docRef.id,

          },

        ]);

      }

      return true;

    };

  // ADD MORE

  const addMoreTransaction =
    async () => {

      const success =
        await saveTransaction();

      if (!success) {

        alert(
          "Please fill all fields"
        );

        return;

      }

      setFormData(
        emptyForm
      );

      setEditId(null);

    };

  // DONE

  const handleDone =
    async () => {

      if (

        formData.title ||

        formData.amount ||

        formData.category ||

        formData.date

      ) {

        const success =
          await saveTransaction();

        if (!success) {

          alert(
            "Please fill all fields"
          );

          return;

        }

      }

      setShowModal(false);

      setEditId(null);

      setFormData(
        emptyForm
      );

    };

  // DELETE

  const deleteTransaction =
    async (id) => {

      await deleteDoc(
        doc(
          db,
          "transactions",
          id
        )
      );

      setTransactions(

        transactions.filter(
          (item) =>

            item.firestoreId !==
            id
        )

      );

    };

  // EDIT

  const editTransaction = (
    item
  ) => {

    setFormData({

      title:
        item.title,

      amount:
        item.amount,

      category:
        item.category,

      type:
        item.type,

      date:
        item.date,

    });

    setEditId(
      item.firestoreId
    );

    setShowModal(true);

  };

  // DOWNLOAD EXCEL

const downloadExcelReport = () => {
  if (filteredTransactions.length === 0) {
    alert("No transactions available to download");
    return;
  }

  const excelData = filteredTransactions.map(
    (item, index) => ({
      "S.No": index + 1,
      Title: item.title,
      Amount: item.amount,
      Category: item.category,
      Type:
        item.type.charAt(0).toUpperCase() +
        item.type.slice(1),
      Date: item.date,
    })
  );

  const worksheet =
    XLSX.utils.json_to_sheet(excelData);

  // Column Widths
  worksheet["!cols"] = [
    { wch: 8 },   // S.No
    { wch: 30 },  // Title
    { wch: 15 },  // Amount
    { wch: 20 },  // Category
    { wch: 15 },  // Type
    { wch: 18 },  // Date
  ];

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Transactions"
  );

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

  const file = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    }
  );

  let fileName = "transactions";

  if (filterType === "week") {
    fileName =
      "transactions-current-week";
  }

  if (filterType === "month") {
    fileName = `transactions-${filterMonth}-${filterYear}`;
  }

  if (filterType === "year") {
    fileName = `transactions-${filterYear}`;
  }

  saveAs(file, `${fileName}.xlsx`);
};

  // FILTERED TRANSACTIONS

 const filteredTransactions = transactions
  .filter((item) => {
    const itemDate = new Date(item.date);

    const searchMatch =
      item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.category
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.type
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // ALL
    if (filterType === "all") {
      return true;
    }

    // CURRENT WEEK
    if (filterType === "week") {
      const today = new Date();

      const firstDay = new Date(today);
      firstDay.setHours(0, 0, 0, 0);

      const day = firstDay.getDay();

      firstDay.setDate(
        firstDay.getDate() - day
      );

      const lastDay = new Date(firstDay);
      lastDay.setDate(
        firstDay.getDate() + 6
      );
      lastDay.setHours(
        23,
        59,
        59,
        999
      );

      return (
        itemDate >= firstDay &&
        itemDate <= lastDay
      );
    }

    // MONTH
    if (filterType === "month") {
      if (!filterMonth) return false;

      return (
        itemDate.getMonth() + 1 ===
          Number(filterMonth) &&
        itemDate.getFullYear() ===
          Number(filterYear)
      );
    }

    // YEAR
    if (filterType === "year") {
      return (
        itemDate.getFullYear() ===
        Number(filterYear)
      );
    }

    return true;
  })
  .sort(
    (a, b) =>
      new Date(a.date) -
      new Date(b.date)
  );

  return (

    <div
      className={
        darkMode

          ? "dashboard dark"

          : "dashboard"
      }
    >

      <Sidebar
        handleLogout={
          handleLogout
        }
      />

      <div className="main-content">

        <TopNavbar
          darkMode={
            darkMode
          }
          toggleTheme={
            toggleTheme
          }
          searchTerm={
            searchTerm
          }
          setSearchTerm={
            setSearchTerm
          }
        />

        {/* TABLE */}

        <div className="table-card">

          {/* TOP */}

          <div
  className="table-top"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  }}
>

  <h2
    className="section-title"
    style={{
      margin: 0,
      whiteSpace: "nowrap",
    }}
  >
    Transaction History
  </h2>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}
  >

    <select
      className="month-filter"
      value={filterType}
      onChange={(e) =>
        setFilterType(e.target.value)
      }
    >
      <option value="all">
        All Transactions
      </option>

      <option value="week">
        Current Week
      </option>

      <option value="month">
        Month
      </option>

      <option value="year">
        Year
      </option>
    </select>

    {filterType === "month" && (
      <>
        <select
          className="month-filter"
          value={filterMonth}
          onChange={(e) =>
            setFilterMonth(
              e.target.value
            )
          }
        >
          <option value="">
            Select Month
          </option>

          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <select
          className="month-filter"
          value={filterYear}
          onChange={(e) =>
            setFilterYear(
              e.target.value
            )
          }
        >
          {Array.from(
            {
              length:
                new Date().getFullYear() -
                2023 +
                1,
            },
            (_, i) => 2023 + i
          ).map((year) => (
            <option
              key={year}
              value={year}
            >
              {year}
            </option>
          ))}
        </select>
      </>
    )}

    {filterType === "year" && (
      <select
        className="month-filter"
        value={filterYear}
        onChange={(e) =>
          setFilterYear(
            e.target.value
          )
        }
      >
        {Array.from(
          {
            length:
              new Date().getFullYear() -
              2023 +
              1,
          },
          (_, i) => 2023 + i
        ).map((year) => (
          <option
            key={year}
            value={year}
          >
            {year}
          </option>
        ))}
      </select>
    )}

    <button
      className="primary-btn"
      onClick={downloadExcelReport}
    >
      Download Excel
    </button>

  </div>

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
                  Category
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
                filteredTransactions.length >
                0

                  ? (

                    filteredTransactions.map(
                      (item) => (

                        <tr
                          key={
                            item.firestoreId
                          }
                        >

                          <td>
                            {
                              item.title
                            }
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
                              item.amount
                            }

                          </td>

                          <td>

                            <span
                              className={`category-badge category-${item.category
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >

                              {
                                item.category
                              }

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

                              {
                                item.type
                              }

                            </span>

                          </td>

                          <td>
                            {
                              item.date
                            }
                          </td>

                          <td>

                            <div className="action-buttons">

                              <button
                                className="edit-btn"
                                onClick={() =>
                                  editTransaction(
                                    item
                                  )
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
                    setShowModal(
                      false
                    )
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
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                />

                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={
                    formData.amount
                  }
                  onChange={
                    handleChange
                  }
                />

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
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
                  value={
                    formData.type
                  }
                  onChange={
                    handleChange
                  }
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
                  value={
                    formData.date
                  }
                  onChange={
                    handleChange
                  }
                />

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
                    onClick={
                      handleDone
                    }
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

    </div>

  );

}

export default Transactions;