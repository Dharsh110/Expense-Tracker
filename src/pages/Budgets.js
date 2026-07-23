import React, {
  useState,
  useContext,
} from "react";

import { toast } from "react-toastify";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import {
  ThemeContext,
} from "../context/ThemeContext";

import {
  CurrencyContext,
} from "../context/CurrencyContext";

import {
  addUserDocument,
  deleteUserDocument,
  updateUserDocument,
  getUserProfile,
} from "../services/firestoreData";

import useFirestoreCollection from "../hooks/useFirestoreCollection";
import useBudgetNotifications from "../hooks/useBudgetNotifications";
import { calculateSpent } from "../utils/budgetUtils";

import {
  FaTrash,
  FaEdit,
  FaFileCsv,
  FaFilePdf,
} from "react-icons/fa";

function Budgets() {
  const {
    darkMode,
    toggleTheme,
  } = useContext(ThemeContext);

  const {
    symbol,
  } = useContext(CurrencyContext);

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [budgetType, setBudgetType] = useState("Monthly");

  // NEW STATES
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const {
    items: budgets,
  } = useFirestoreCollection(
    "budgets",
    "budgets"
  );

  const {
    items: transactions,
  } = useFirestoreCollection(
    "transactions",
    "transactions"
  );

  useBudgetNotifications(budgets, transactions);

  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState("All");

  // REPORT NARROWING (separate from Add Budget form's month/year)
  const [reportMonth, setReportMonth] = useState("");
  const [reportYear, setReportYear] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Others",
  ];

  // MONTH OPTIONS
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

  // YEAR OPTIONS
  const years = [];
  for (let year = 2023; year <= new Date().getFullYear(); year++) {
    years.push(year);
  }

  // SAVE / UPDATE
  const saveBudget = async () => {
    if (!category || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    // MONTH REQUIRED FOR MONTHLY + YEARLY
    if (
      (budgetType === "Monthly" || budgetType === "Yearly") &&
      !selectedMonth
    ) {
      toast.error("Please select month");
      return;
    }

    // YEAR REQUIRED FOR ALL BUDGET TYPES
    if (!selectedYear) {
      toast.error("Please select year");
      return;
    }

    // WEEKLY BUDGETS HAVE NO MONTH — NEVER PERSIST A STALE ONE
    const monthToSave =
      budgetType === "Weekly" ? "" : selectedMonth;

    try {
      if (editingId) {

        await updateUserDocument(
          "budgets",
          editingId,
          {
            category,
            amount: Number(amount),
            type: budgetType,
            month: monthToSave,
            year: selectedYear,
          }
        );

        setEditingId(null);

        toast.success("Budget updated");
      } else {
        const newBudget = {
          id: Date.now(),
          category,
          amount: Number(amount),
          type: budgetType,
          month: monthToSave,
          year: selectedYear,
        };

        const newBudgetId = await addUserDocument(
          "budgets",
          newBudget
        );

        const periodLabel =
          budgetType === "Yearly"
            ? `${selectedMonth} ${selectedYear}`
            : budgetType === "Monthly"
            ? `${selectedMonth} ${selectedYear}`
            : `this week (${selectedYear})`;

        const profile = await getUserProfile().catch(() => null);

        const notificationsOn =
          !profile || profile.notificationsEnabled !== false;

        if (notificationsOn) {
          await addUserDocument("notifications", {
            message: `New ${budgetType} budget set for ${category}: ₹${Number(
              amount
            ).toLocaleString()} (${periodLabel}) — set on ${new Date().toLocaleDateString()}.`,
            type: "budget_set",
            read: false,
            deleted: false,
            budgetId: newBudgetId,
          });
        }

        toast.success("Budget saved");
      }

      setCategory("");
      setAmount("");
      setBudgetType("Monthly");
      setSelectedMonth("");
      setSelectedYear(new Date().getFullYear());
    } catch (error) {
      toast.error(error.message);
    }
  };

  // DELETE
  const deleteBudget = async (id) => {
    await deleteUserDocument(
      "budgets",
      id
    );
  };

  // EDIT
  const editBudget = (item) => {
    setEditingId(item.id);
    setCategory(item.category);
    setAmount(item.amount);
    setBudgetType(item.type);
    setSelectedMonth(item.month || "");
    setSelectedYear(item.year || new Date().getFullYear());
  };

  // FILTERED DATA
  const filteredBudgets = budgets.filter((item) => {
    if (filterType === "All") return true;

    if (item.type !== filterType) return false;

    if (filterType === "Monthly" && reportMonth) {
      return item.month === reportMonth;
    }

    if (filterType === "Yearly" && reportYear) {
      return item.year === reportYear;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredBudgets.length / rowsPerPage) || 1;

  const paginatedBudgets = filteredBudgets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const buildReportRows = () =>
    filteredBudgets.map((item, index) => {
      const spent = calculateSpent(
        transactions,
        item.category,
        item.type
      );

      const remaining = item.amount - spent;

      return {
        sno: index + 1,
        category: item.category || "-",
        type: item.type || "-",
        month: item.month || "-",
        year: item.year || "-",
        budget: item.amount ?? "-",
        spent: spent ?? "-",
        remaining: remaining ?? "-",
        status: remaining < 0 ? "Exceeded" : "Safe",
      };
    });

  // CSV DOWNLOAD
  const downloadCSV = () => {
    if (filteredBudgets.length === 0) return;

    let csv =
      "S.No,Category,Type,Month,Year,Budget,Spent,Remaining,Status\n";

    buildReportRows().forEach((row) => {
      csv += `${row.sno},${row.category},${row.type},${row.month},${row.year},${row.budget},${row.spent},${row.remaining},${row.status}\n`;
    });

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "budget-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF DOWNLOAD
  const downloadPDF = () => {
    if (filteredBudgets.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Budget Report", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      14,
      21
    );

    autoTable(doc, {
      startY: 27,
      head: [
        [
          "S.No",
          "Category",
          "Type",
          "Month",
          "Year",
          "Budget",
          "Spent",
          "Remaining",
          "Status",
        ],
      ],
      body: buildReportRows().map((row) => [
        row.sno,
        row.category,
        row.type,
        row.month,
        row.year,
        `${symbol}${row.budget}`,
        `${symbol}${row.spent}`,
        `${symbol}${row.remaining}`,
        row.status,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: "middle",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 255],
      },
      tableWidth: "auto",
      margin: { left: 14, right: 14 },
    });

    doc.save("budget-report.pdf");
  };

  return (
    <div className={darkMode ? "dashboard dark" : "dashboard"}>
      <Sidebar />

      <div className="main-content">
        <TopNavbar
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        {/* HEADER */}
        <div className="dashboard-header">
          <div>
            <h1>Budget Manager</h1>
            <p>Weekly, Monthly & Yearly Budget Tracking</p>
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
                  Select
                  Category
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
                onChange={(e) => {
                  const nextType = e.target.value;
                  setBudgetType(nextType);

                  if (nextType === "Weekly") {
                    setSelectedMonth("");
                  }
                }}
              >

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
              (
                budgetType ===
                  "Monthly" ||

                budgetType ===
                  "Yearly"
              ) && (

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
              )
            }

            {/* YEAR (always shown — Weekly, Monthly, and Yearly all store a year) */}

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
                    Number(e.target.value)
                  )
                }
              >

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

          </div>

          <button
            className="primary-btn"
            onClick={saveBudget}
          >

            {
              editingId

                ? "Update Budget"

                : "Save Budget"
            }

          </button>

        </div>

        {/* FILTER + DOWNLOAD ROW */}
        <div className="filter-wrapper">
          {/* FILTER BUTTONS LEFT */}
          <div className="filter-buttons">
            <button
              className={filterType === "All" ? "active-filter" : ""}
              onClick={() => {
                setFilterType("All");
                setReportMonth("");
                setReportYear("");
                setCurrentPage(1);
              }}
            >
              All
            </button>

            <button
              className={filterType === "Weekly" ? "active-filter" : ""}
              onClick={() => {
                setFilterType("Weekly");
                setReportMonth("");
                setReportYear("");
                setCurrentPage(1);
              }}
            >
              This Week
            </button>

            <button
              className={filterType === "Monthly" ? "active-filter" : ""}
              onClick={() => {
                setFilterType("Monthly");
                setReportYear("");
                setCurrentPage(1);
              }}
            >
              Month
            </button>

            <button
              className={filterType === "Yearly" ? "active-filter" : ""}
              onClick={() => {
                setFilterType("Yearly");
                setReportMonth("");
                setCurrentPage(1);
              }}
            >
              Year
            </button>

            {filterType === "Monthly" && (
              <>
                <select
                  value={reportMonth}
                  onChange={(e) => {
                    setReportMonth(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Months</option>
                  {months.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={reportYear}
                  onChange={(e) => {
                    setReportYear(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Years</option>
                  {years.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </>
            )}

            {filterType === "Yearly" && (
              <select
                value={reportYear}
                onChange={(e) => {
                  setReportYear(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Years</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* DOWNLOAD BUTTONS RIGHT */}
          <div className="filter-actions">
            <button
              className="download-btn"
              onClick={downloadCSV}
              disabled={filteredBudgets.length === 0}
            >
              <FaFileCsv /> Download CSV
            </button>

            <button
              className="download-btn pdf-download-btn"
              onClick={downloadPDF}
              disabled={filteredBudgets.length === 0}
            >
              <FaFilePdf /> Download PDF
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-card">
          <h2 className="section-title">
            {filterType === "All" ? "All" : filterType} Budget Report
          </h2>

          {filteredBudgets.length === 0 ? (
            <div className="no-data">No Data Found</div>
          ) : (
            <table className="budget-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Category</th>
                  <th>Type</th>

                  {/* SHOW MONTH */}
                  {(filterType === "All" ||
                    filterType === "Monthly" ||
                    filterType === "Yearly") && (
                    <th>Month</th>
                  )}

                  {/* SHOW YEAR */}
                  {(filterType === "All" ||
                    filterType === "Yearly") && <th>Year</th>}

                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedBudgets.map((item, index) => {
                  const spent = calculateSpent(transactions, item.category, item.type);
                  const remaining = item.amount - spent;

                  return (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td>{item.category}</td>
                      <td>{item.type}</td>

                      {/* MONTH VALUE */}
                      {(filterType === "All" ||
                        filterType === "Monthly" ||
                        filterType === "Yearly") && (
                        <td>{item.month || "-"}</td>
                      )}

                      {/* YEAR VALUE */}
                      {(filterType === "All" ||
                        filterType === "Yearly") && (
                        <td>{item.year || "-"}</td>
                      )}

                      <td>{symbol}{item.amount}</td>
                      <td>{symbol}{spent}</td>
                      <td>{symbol}{remaining}</td>

                      <td>
                        {remaining < 0 ? (
                          <span className="danger-text">
                            Exceeded
                          </span>
                        ) : (
                          <span className="success-text">
                            Safe
                          </span>
                        )}
                      </td>

                      <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => editBudget(item)}
                          title="Edit Budget"
                          style={{
                            backgroundColor: darkMode ? "#1e3a8a" : "#e0ecff",
                            color: darkMode ? "#60a5fa" : "#2563eb",
                            border: "none",
                            padding: "8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            marginRight: "8px",
                          }}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteBudget(item.id)}
                          title="Delete Budget"
                          style={{
                            backgroundColor: darkMode ? "#7f1d1d" : "#ffe5e5",
                            color: darkMode ? "#f87171" : "#dc2626",
                            border: "none",
                            padding: "8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          {filteredBudgets.length > rowsPerPage && (
            <div className="pagination-bar">
              <button
                className="page-nav-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    className={
                      currentPage === pageNum
                        ? "page-number active-page"
                        : "page-number"
                    }
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                className="page-nav-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .pagination-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 20px;
          }

          .page-nav-btn,
          .page-number {
            border: 1px solid ${darkMode ? "#334155" : "#e5e7eb"};
            background: ${darkMode ? "#1e293b" : "white"};
            color: ${darkMode ? "#e2e8f0" : "#111827"};
            padding: 8px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
          }

          .page-number {
            padding: 8px 13px;
            min-width: 38px;
          }

          .page-nav-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          .page-number.active-page {
            background: #4f46e5;
            border-color: #4f46e5;
            color: white;
          }
        `}
      </style>
    </div>
  );
}

export default Budgets;
