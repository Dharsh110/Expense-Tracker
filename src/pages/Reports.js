import {
  useContext,
  useState,
} from "react";

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

import useFirestoreCollection from "../hooks/useFirestoreCollection";

import {
  FaFileCsv,
  FaFilePdf,
  FaArrowUp,
  FaArrowDown,
  FaSort,
} from "react-icons/fa";

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

const CATEGORIES = [
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

function Reports() {
  const { darkMode, toggleTheme } =
    useContext(ThemeContext);

  const { symbol } = useContext(CurrencyContext);

  const { items: transactions } = useFirestoreCollection(
    "transactions",
    "transactions"
  );

  const [filterType, setFilterType] = useState("all");

  const [selectedMonth, setSelectedMonth] = useState(
    MONTHS[new Date().getMonth()]
  );

  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear())
  );

  const [typeFilter, setTypeFilter] = useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [sortField, setSortField] = useState(null);

  const [sortOrder, setSortOrder] = useState("asc");

  const years = [];
  for (
    let year = 2023;
    year <= new Date().getFullYear();
    year++
  ) {
    years.push(year);
  }

  const filteredTransactions = transactions.filter(
    (item) => {
      const itemDate = new Date(item.date);

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

      const typeMatch =
        typeFilter === "all" ? true : item.type === typeFilter;

      const categoryMatch =
        categoryFilter === "all"
          ? true
          : item.category === categoryFilter;

      return periodMatch && typeMatch && categoryMatch;
    }
  );

  const sortedTransactions = [...filteredTransactions];

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
  } else {
    sortedTransactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />;
  };

  // TOTALS FOR CURRENT FILTER

  const totalIncome = sortedTransactions
    .filter((item) => item.type === "income")
    .reduce((acc, item) => acc + Number(item.amount), 0);

  const totalExpense = sortedTransactions
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => acc + Number(item.amount), 0);

  const totalBalance = totalIncome - totalExpense;

  // CSV DOWNLOAD

  const downloadCSV = () => {
    if (sortedTransactions.length === 0) return;

    const headers = [
      "Title",
      "Amount",
      "Category",
      "Type",
      "Date",
    ];

    const rows = sortedTransactions.map((item) => [
      item.title || "-",
      item.amount ?? "-",
      item.category || "-",
      item.type || "-",
      item.date || "-",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "transaction-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF DOWNLOAD

  const downloadPDF = () => {
    if (sortedTransactions.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Transaction Report", 14, 15);

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
        ["Title", "Amount", "Category", "Type", "Date"],
      ],
      body: sortedTransactions.map((item) => [
        item.title || "-",
        `${symbol} ${item.amount ?? "-"}`,
        item.category || "-",
        item.type || "-",
        item.date || "-",
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 6,
        valign: "middle",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 255],
      },
      tableWidth: "auto",
      margin: { left: 14, right: 14 },
    });

    doc.save("transaction-report.pdf");
  };

  return (
    <div className={darkMode ? "dashboard dark" : "dashboard"}>
      <Sidebar />

      <div className="main-content">
        <TopNavbar
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        />

        <div className="dashboard-header">
          <div>
            <h1>Reports</h1>
            <p>Filter your transactions and download a report</p>
          </div>
        </div>

        {/* PERIOD FILTERS */}
        <div className="export-filters">
          <button
            className={
              filterType === "all" ? "active-filter" : ""
            }
            onClick={() => setFilterType("all")}
          >
            All
          </button>

          <button
            className={
              filterType === "week" ? "active-filter" : ""
            }
            onClick={() => setFilterType("week")}
          >
            This Week
          </button>

          <button
            className={
              filterType === "month" ? "active-filter" : ""
            }
            onClick={() => setFilterType("month")}
          >
            Month
          </button>

          <button
            className={
              filterType === "year" ? "active-filter" : ""
            }
            onClick={() => setFilterType("year")}
          >
            Year
          </button>

          {filterType === "month" && (
            <>
              <select
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
        </div>

        {/* TYPE + CATEGORY FILTERS */}
        <div className="export-filters">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* TOTALS SUMMARY */}
        <div className="report-summary-grid">
          <div className="report-summary-card income">
            <p>Total Income</p>
            <h2>{symbol} {totalIncome.toLocaleString()}</h2>
          </div>

          <div className="report-summary-card expense">
            <p>Total Expense</p>
            <h2>{symbol} {totalExpense.toLocaleString()}</h2>
          </div>

          <div className="report-summary-card balance">
            <p>Balance</p>
            <h2
              style={{
                color: totalBalance >= 0 ? "#22c55e" : "#ef4444",
              }}
            >
              {symbol} {totalBalance.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* DOWNLOAD BUTTONS */}
        <div className="export-actions">
          <button
            className="csv-btn"
            onClick={downloadCSV}
            disabled={sortedTransactions.length === 0}
          >
            <FaFileCsv /> Download CSV
          </button>

          <button
            className="pdf-btn"
            onClick={downloadPDF}
            disabled={sortedTransactions.length === 0}
          >
            <FaFilePdf /> Download PDF
          </button>
        </div>

        {/* TABLE */}
        <div className="table-card">
          {sortedTransactions.length === 0 ? (
            <div className="no-data">
              No transactions found for this filter
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th
                    className="sortable-th"
                    onClick={() => toggleSort("amount")}
                  >
                    Amount {sortIcon("amount")}
                  </th>
                  <th>Category</th>
                  <th>Type</th>
                  <th
                    className="sortable-th"
                    onClick={() => toggleSort("date")}
                  >
                    Date {sortIcon("date")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title || "-"}</td>
                    <td
                      style={{
                        fontWeight: "600",
                        color:
                          item.type === "income"
                            ? "#22c55e"
                            : "#ef4444",
                      }}
                    >
                      {symbol} {item.amount ?? "-"}
                    </td>
                    <td>{item.category || "-"}</td>
                    <td>
                      <span
                        className={
                          item.type === "income"
                            ? "income-badge"
                            : "expense-badge"
                        }
                      >
                        {item.type || "-"}
                      </span>
                    </td>
                    <td>{item.date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>
        {`
          .export-filters {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .export-filters button {
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            background: ${darkMode ? "#1e293b" : "#e5e7eb"};
            color: ${darkMode ? "#e5e7eb" : "#111827"};
          }

          .export-filters select {
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid ${
              darkMode ? "#334155" : "#d1d5db"
            };
            background: ${darkMode ? "#1e293b" : "#ffffff"};
            color: ${darkMode ? "#ffffff" : "#111827"};
          }

          .active-filter {
            background: #4f46e5 !important;
            color: white !important;
          }

          .report-summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }

          .report-summary-card {
            padding: 20px;
            border-radius: 16px;
            background: ${darkMode ? "#1e293b" : "#ffffff"};
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          }

          .report-summary-card p {
            font-size: 14px;
            font-weight: 600;
            color: ${darkMode ? "#94a3b8" : "#6b7280"};
            margin-bottom: 8px;
          }

          .report-summary-card h2 {
            font-size: 24px;
            font-weight: 700;
            color: ${darkMode ? "#ffffff" : "#111827"};
            margin: 0;
          }

          .report-summary-card.income h2 {
            color: #22c55e;
          }

          .report-summary-card.expense h2 {
            color: #ef4444;
          }

          .export-actions {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
          }

          .export-actions button {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            color: white;
          }

          .export-actions button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .csv-btn {
            background: #16a34a;
          }

          .pdf-btn {
            background: #dc2626;
          }

          .no-data {
            text-align: center;
            padding: 40px;
            font-weight: 600;
            color: ${darkMode ? "#94a3b8" : "#6b7280"};
          }

          .sortable-th {
            cursor: pointer;
            user-select: none;
          }

          .sortable-th svg {
            margin-left: 6px;
            font-size: 12px;
            vertical-align: middle;
          }
        `}
      </style>
    </div>
  );
}

export default Reports;
