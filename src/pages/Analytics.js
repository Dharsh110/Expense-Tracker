import {
  useState,
  useContext,
} from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";

import * as XLSX from "xlsx";

import {
  FaDownload,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";

import TopNavbar from "../components/TopNavbar";

import {
  ThemeContext,
} from "../context/ThemeContext";

import {
  CurrencyContext,
} from "../context/CurrencyContext";

import useFirestoreCollection from "../hooks/useFirestoreCollection";

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

const COLORS = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

function Analytics() {

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

  const [filterType, setFilterType] =
    useState("all");

  const [selectedMonth, setSelectedMonth] =
    useState(MONTHS[new Date().getMonth()]);

  const [selectedYear, setSelectedYear] =
    useState(String(new Date().getFullYear()));

  const years = [];
  for (
    let year = 2023;
    year <= new Date().getFullYear();
    year++
  ) {
    years.push(year);
  }

  // ===========================
  // FILTER DATA
  // ===========================

  const getFilteredTransactions = () => {

    return transactions.filter((item) => {

      const itemDate =
        new Date(item.date);

      // THIS WEEK

      if (
        filterType === "week"
      ) {

        const weekAgo =
          new Date();

        weekAgo.setDate(
          weekAgo.getDate() - 7
        );

        return (
          itemDate >= weekAgo
        );

      }

      // MONTH

      if (
        filterType === "month"
      ) {

        return (
          MONTHS[itemDate.getMonth()] ===
            selectedMonth &&
          itemDate.getFullYear() ===
            Number(selectedYear)
        );

      }

      // YEAR

      if (
        filterType === "year"
      ) {

        return (
          itemDate.getFullYear() ===
          Number(selectedYear)
        );

      }

      return true;

    });

  };

  const filteredTransactions =
    getFilteredTransactions();

  // ===========================
  // PIE CHART DATA
  // ===========================

  const categoryMap = {};

  filteredTransactions.forEach(
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

  const pieData =
    Object.keys(categoryMap)
      .map((key) => ({

        name: key,

        value:
          categoryMap[key],

      }));

  // ===========================
  // BAR CHART DATA
  // ===========================

  const timeMap = {};

  filteredTransactions.forEach(
    (item) => {

      let label = "";

      const itemDate =
        new Date(item.date);

      // THIS WEEK

      if (
        filterType === "week"
      ) {

        label =
          itemDate.toLocaleDateString(
            "default",
            {
              weekday: "short",
            }
          );

      }

      // MONTH

      else if (
        filterType ===
        "month"
      ) {

        label =
          itemDate.toLocaleDateString(
            "default",
            {
              day: "numeric",
            }
          );

      }

      // YEAR / ALL

      else {

        label =
          itemDate.toLocaleDateString(
            "default",
            {
              month: "short",
            }
          );

      }

      if (
        timeMap[label]
      ) {

        timeMap[label] +=
          Number(item.amount);

      } else {

        timeMap[label] =
          Number(item.amount);

      }

    }
  );

  const barData =
    Object.keys(timeMap)
      .map((key) => ({

        name: key,

        amount:
          timeMap[key],

      }));

  // ===========================
  // EXPORT EXCEL
  // ===========================

  const exportExcel = () => {

    const worksheet =
      XLSX.utils.json_to_sheet(
        filteredTransactions
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `${filterType}-report`
    );

    XLSX.writeFile(
      workbook,
      `${filterType}-expense-report.xlsx`
    );

  };

  // ===========================
  // TOTALS
  // ===========================

  const totalExpense =
    filteredTransactions
      .filter(
        (item) =>
          item.type ===
          "expense"
      )
      .reduce(
        (acc, item) =>
          acc +
          Number(item.amount),
        0
      );

  const totalIncome =
    filteredTransactions
      .filter(
        (item) =>
          item.type ===
          "income"
      )
      .reduce(
        (acc, item) =>
          acc +
          Number(item.amount),
        0
      );

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

          <div>

            <h1>
              Analytics Report
            </h1>

            <p>
              Weekly, Monthly
              & Yearly Expense
              Analysis
            </p>

          </div>

          <button
            className="export-btn"
            onClick={
              exportExcel
            }
          >

            <FaDownload />

            Download Excel

          </button>

        </div>

        {/* FILTER BUTTONS */}

        <div className="filter-container">

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

        {/* SUMMARY CARDS */}

        <div className="summary-grid">

          <div className="summary-card">

            <h3>
              Total Income
            </h3>

            <p>
              {symbol}{totalIncome}
            </p>

          </div>

          <div className="summary-card">

            <h3>
              Total Expense
            </h3>

            <p>
              {symbol}{totalExpense}
            </p>

          </div>

          <div className="summary-card">

            <h3>
              Total Savings
            </h3>

            <p>
              {symbol}
              {totalIncome -
                totalExpense}
            </p>

          </div>

        </div>

        {/* CHARTS */}

        <div className="dashboard-layout">

          {/* PIE CHART */}

          <div className="chart-card">

            <h2 className="section-title">

              Expense By Category

            </h2>

            {
              pieData.length === 0 ? (

                <div className="nodata">

                  No Data Found

                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={420}
                >

                  <PieChart>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={130}
                      innerRadius={70}
                      paddingAngle={3}
                      label
                    >

                      {
                        pieData.map(
                          (
                            entry,
                            index
                          ) => (

                            <Cell
                              key={index}
                              fill={
                                COLORS[
                                  index %
                                  COLORS.length
                                ]
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
            }

          </div>

          {/* BAR CHART */}

          <div className="chart-card">

            <h2 className="section-title">

              Spending Overview

            </h2>

            {
              barData.length === 0 ? (

                <div className="nodata">

                  No Data Found

                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={420}
                >

                  <BarChart
                    data={barData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                    />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="amount"
                      fill="#8b5cf6"
                      radius={[
                        10,
                        10,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              )
            }

          </div>

        </div>

      </div>

      {/* CSS */}

      <style>{`

        .filter-container {
          display: flex;
          gap: 15px;
          margin: 20px 0;
        }

        .filter-container button {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          background: #e5e7eb;
        }

        .filter-container select {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid ${darkMode ? "#334155" : "#d1d5db"};
          background: ${darkMode ? "#1e293b" : "#ffffff"};
          color: ${darkMode ? "#ffffff" : "#111827"};
          font-weight: 500;
          cursor: pointer;
        }

        .active-filter {
          background: #8b5cf6 !important;
          color: white;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(450px, 1fr)
          );
          gap: 25px;
        }

        .chart-card {
          background: ${darkMode
            ? "#1e293b"
            : "#ffffff"};
          padding: 25px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .section-title {
          margin-bottom: 20px;
          font-size: 22px;
          font-weight: 700;
          color: ${darkMode
            ? "#ffffff"
            : "#111827"};
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(220px, 1fr)
          );
          gap: 20px;
          margin-bottom: 25px;
        }

        .summary-card {
          background: ${darkMode
            ? "#1e293b"
            : "#ffffff"};
          padding: 25px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .summary-card h3 {
          margin-bottom: 10px;
          color: ${darkMode
            ? "#d1d5db"
            : "#555"};
        }

        .summary-card p {
          font-size: 28px;
          font-weight: bold;
          color: #8b5cf6;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .nodata {
          height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          color: ${darkMode
            ? "#ffffff"
            : "#555"};
        }

      `}</style>

    </div>
  );
}

export default Analytics;
