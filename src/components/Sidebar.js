import {
  FaChartPie,
  FaWallet,
  FaChartLine,
  FaMoneyBill,
  FaCog,
  FaSignOutAlt,
  FaDownload,
  FaList,
} from "react-icons/fa";


import { useState } from "react";

import { FaPlusCircle } from "react-icons/fa";

import AddTransactionModal from "./AddTransactionModal";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  signOut,
} from "firebase/auth";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import * as XLSX from "xlsx";

function Sidebar() {

  const navigate = useNavigate();

  const [showModal, setShowModal] =
  useState(false);

  // LOGOUT FUNCTION

  const handleLogout = async () => {

    try {

      await signOut(auth);

      localStorage.clear();

      navigate("/");

    } catch (error) {

      alert(error.message);

    }

  };

  // EXPORT EXCEL

  const exportCSV = async () => {

    try {

      const user =
        auth.currentUser;

      if (!user) {

        alert(
          "User not logged in"
        );

        return;

      }

      // FETCH ALL TRANSACTIONS

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

      const transactions =
        querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      if (
        transactions.length === 0
      ) {

        alert(
          "No transactions found"
        );

        return;

      }

      // CREATE WORKBOOK

      const workbook =
        XLSX.utils.book_new();

      // YEARS FROM 2023 TO CURRENT YEAR

      const currentYear =
        new Date().getFullYear();

      for (
        let year = 2023;
        year <= currentYear;
        year++
      ) {

        // FILTER YEAR DATA

        const yearTransactions =
          transactions.filter(
            (item) => {

              const itemYear =
                new Date(
                  item.date
                ).getFullYear();

              return (
                itemYear === year
              );

            }
          );

        const excelData = [];

        // TITLE

        excelData.push([
          `EXPENSE TRACKER REPORT - ${year}`,
        ]);

        excelData.push([]);

        // HEADER

        excelData.push([
          "S.No",
          "Title",
          "Category",
          "Date",
          "Month",
          "Year",
          "Amount",
          "Type",
        ]);

        // CATEGORY TOTALS

        const categoryTotals =
          {};

        // NO DATA

        if (
          yearTransactions.length ===
          0
        ) {

          excelData.push([
            "",
            "No Data Available",
          ]);

        } else {

          // SORT DATE

          yearTransactions.sort(
            (a, b) =>
              new Date(a.date) -
              new Date(b.date)
          );

          // ROW DATA

          yearTransactions.forEach(
            (
              item,
              index
            ) => {

              const date =
                new Date(
                  item.date
                );

              const month =
                date.toLocaleString(
                  "default",
                  {
                    month: "long",
                  }
                );

              const itemYear =
                date.getFullYear();

              excelData.push([
                index + 1,
                item.title || "-",
                item.category || "-",
                item.date || "-",
                month,
                itemYear,
                `₹ ${Number(
                  item.amount
                ).toLocaleString()}`,
                item.type || "-",
              ]);

              // TOTALS

              if (
                !categoryTotals[
                  item.category
                ]
              ) {

                categoryTotals[
                  item.category
                ] = 0;

              }

              categoryTotals[
                item.category
              ] += Number(
                item.amount
              );

            }
          );

          // EMPTY SPACE

          excelData.push([]);
          excelData.push([]);

          // TOTAL TITLE

          excelData.push([
            `CATEGORY TOTALS - ${year}`,
          ]);

          excelData.push([]);

          // TOTAL HEADER

          excelData.push([
            "Category",
            "Total Amount",
          ]);

          // CATEGORY TOTAL ROWS

          Object.keys(
            categoryTotals
          ).forEach(
            (category) => {

              excelData.push([
                category,
                `₹ ${categoryTotals[
                  category
                ].toLocaleString()}`,
              ]);

            }
          );

        }

        // CREATE SHEET

        const worksheet =
          XLSX.utils.aoa_to_sheet(
            excelData
          );

        // COLUMN WIDTHS

        worksheet["!cols"] = [

          { wch: 8 }, // S.NO

          { wch: 28 }, // TITLE

          { wch: 22 }, // CATEGORY

          { wch: 18 }, // DATE

          { wch: 18 }, // MONTH

          { wch: 12 }, // YEAR

          { wch: 18 }, // AMOUNT

          { wch: 15 }, // TYPE

        ];

        // APPEND SHEET

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          `${year}`
        );

      }

      // DOWNLOAD EXCEL

      XLSX.writeFile(
        workbook,
        "Expense_Tracker_Full_Report.xlsx"
      );

    } catch (error) {

      console.log(error);

      alert(
        "Failed to export excel"
      );

    }

  };

  return (
  <>
    <aside className="sidebar">

      <div>

        <h2 className="logo">
          Expense Tracker
        </h2>

        <p className="menu-title">
          MAIN
        </p>

        <ul className="menu">

          <NavLink
            to="/dashboard"
            className="menu-link"
          >
            <li className="menu-item">
              <FaChartPie />
              <span>Dashboard</span>
            </li>
          </NavLink>

          {/* ADD TRANSACTION */}

          <li
            className="menu-item"
            onClick={() =>
              setShowModal(true)
            }
          >
            <FaPlusCircle />
            <span>
              Add Transaction
            </span>
          </li>

          <NavLink
            to="/transactions"
            className="menu-link"
          >
            <li className="menu-item">
              <FaWallet />
              <span>
                Transactions
              </span>
            </li>
          </NavLink>

          <NavLink
            to="/categories"
            className="menu-link"
          >
            <li className="menu-item">
              <FaList />
              <span>
                Categories
              </span>
            </li>
          </NavLink>

          <NavLink
            to="/analytics"
            className="menu-link"
          >
            <li className="menu-item">
              <FaChartLine />
              <span>
                Analytics
              </span>
            </li>
          </NavLink>

          <NavLink
            to="/budgets"
            className="menu-link"
          >
            <li className="menu-item">
              <FaMoneyBill />
              <span>
                Budgets
              </span>
            </li>
          </NavLink>

          <li
            className="menu-item export-btn"
            onClick={exportCSV}
          >
            <FaDownload />
            <span>
              Export Excel
            </span>
          </li>

          <NavLink
            to="/settings"
            className="menu-link"
          >
            <li className="menu-item">
              <FaCog />
              <span>
                Settings
              </span>
            </li>
          </NavLink>
      </ul>
      </div>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        <FaSignOutAlt />
        <span>
          Logout
        </span>
      </button>

    </aside>

    {/* ADD TRANSACTION MODAL */}

    <AddTransactionModal
      isOpen={showModal}
      onClose={() =>
        setShowModal(false)
      }
    />
  </>
);

}

export default Sidebar;