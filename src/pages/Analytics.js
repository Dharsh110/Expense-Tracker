import {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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

  const [transactions, setTransactions] =
    useState([]);

  const [filterType, setFilterType] =
    useState("all");

  const [selectedMonth,
    setSelectedMonth] =
    useState("");

  const [selectedYear,
    setSelectedYear] =
    useState("");

  // =========================
  // FIREBASE FETCH
  // =========================

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
      onSnapshot(q,
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (doc) => ({

                id: doc.id,

                ...doc.data(),

              })
            );

          setTransactions(data);

        });

    return () =>
      unsubscribe();

  }, []);

  // =========================
  // FILTER LOGIC
  // =========================

  const filteredTransactions =
    transactions.filter(
      (item) => {

        const itemDate =
          new Date(item.date);

        const now =
          new Date();

        // WEEK

        if (
          filterType === "week"
        ) {

          const diff =
            (now - itemDate) /
            (1000 * 60 * 60 * 24);

          return diff <= 7;
        }

        // MONTH

        if (
          filterType === "month"
        ) {

          return (
            itemDate.getMonth() + 1 ===
              Number(selectedMonth) &&

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

      }
    );

  // =========================
  // PIE CHART DATA
  // =========================

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

  // =========================
  // LINE CHART DATA
  // =========================

  const lineMap = {};

  filteredTransactions.forEach(
    (item) => {

      const itemDate =
        new Date(item.date);

      let label = "";

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

      } else if (
        filterType === "month"
      ) {

        label =
          itemDate.getDate();

      } else if (
        filterType === "year"
      ) {

        label =
          itemDate.toLocaleDateString(
            "default",
            {
              month: "short",
            }
          );

      } else {

        label =
          itemDate.toLocaleDateString(
            "default",
            {
              month: "short",
            }
          );
      }

      if (!lineMap[label]) {

        lineMap[label] = {

          name: label,

          income: 0,

          expense: 0,

        };
      }

      if (
        item.type === "income"
      ) {

        lineMap[label]
          .income += Number(
          item.amount
        );

      } else {

        lineMap[label]
          .expense += Number(
          item.amount
        );
      }

    }
  );

  const lineData =
    Object.values(lineMap);

  // =========================
  // TOTALS
  // =========================

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

  // =========================
  // DOWNLOAD EXCEL
  // =========================

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
      "Analytics Report"
    );

    XLSX.writeFile(
      workbook,
      "analytics-report.xlsx"
    );
  };

  // =========================
  // YEARS
  // =========================

  const currentYear =
    new Date().getFullYear();

  const years = [];

  for (
    let i = 2023;
    i <= currentYear;
    i++
  ) {

    years.push(i);
  }

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
              Expense Analysis
            </p>

          </div>

          {/* FILTER + DOWNLOAD */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: "100%",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(
                        e.target.value
                      );

                      setSelectedMonth("");
                      setSelectedYear("");
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

                  {/* MONTH */}

                  {filterType ===
                    "month" && (
                    <>
                      <select
                        value={
                          selectedMonth
                        }
                        onChange={(e) =>
                          setSelectedMonth(
                            e.target.value
                          )
                        }
                        className="month-filter"
                      >
                        <option value="">
                          Select Month
                        </option>

                        <option value="1">
                          Jan
                        </option>

                        <option value="2">
                          Feb
                        </option>

                        <option value="3">
                          Mar
                        </option>

                        <option value="4">
                          Apr
                        </option>

                        <option value="5">
                          May
                        </option>

                        <option value="6">
                          Jun
                        </option>

                        <option value="7">
                          Jul
                        </option>

                        <option value="8">
                          Aug
                        </option>

                        <option value="9">
                          Sep
                        </option>

                        <option value="10">
                          Oct
                        </option>

                        <option value="11">
                          Nov
                        </option>

                        <option value="12">
                          Dec
                        </option>
                      </select>

                      <select
                        value={
                          selectedYear
                        }
                        onChange={(e) =>
                          setSelectedYear(
                            e.target.value
                          )
                        }
                        className="month-filter"
                      >
                        <option value="">
                          Select Year
                        </option>

                        {years.map(
                          (year) => (
                            <option
                              key={year}
                              value={year}
                            >
                              {year}
                            </option>
                          )
                        )}
                      </select>
                    </>
                  )}

                  {/* YEAR */}

                  {filterType ===
                    "year" && (
                    <select
                      value={
                        selectedYear
                      }
                      onChange={(e) =>
                        setSelectedYear(
                          e.target.value
                        )
                      }
                      className="month-filter"
                    >
                      <option value="">
                        Select Year
                      </option>

                      {years.map(
                        (year) => (
                          <option
                            key={year}
                            value={year}
                          >
                            {year}
                          </option>
                        )
                      )}
                    </select>
                  )}

                  {/* DOWNLOAD */}

                  <button
                    className="export-btn"
                    onClick={
                      exportExcel
                    }
                  >
                    <FaDownload />

                    Download
                  </button>
                </div>
              </div>

        </div>

        {/* SUMMARY */}

        <div className="summary-grid">

          <div className="summary-card">

            <h3>
              Total Income
            </h3>

            <p>
              ₹
              {
                totalIncome.toLocaleString()
              }
            </p>

          </div>

          <div className="summary-card">

            <h3>
              Total Expense
            </h3>

            <p>
              ₹
              {
                totalExpense.toLocaleString()
              }
            </p>

          </div>

          <div className="summary-card">

            <h3>
              Total Savings
            </h3>

            <p>
              ₹
              {
                (
                  totalIncome -
                  totalExpense
                ).toLocaleString()
              }
            </p>

          </div>

        </div>

        {/* CHARTS */}

        <div className="dashboard-layout">

          {/* PIE */}

          <div className="chart-card">

            <h2 className="section-title">

              Expense By Category

            </h2>

            {
              pieData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={400}
                >

                  <PieChart>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={130}
                      innerRadius={70}
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

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              ) : (

                <div className="nodata">

                  No Data Found

                </div>

              )
            }

          </div>

          {/* LINE */}

          <div className="chart-card">

            <h2 className="section-title">

              Spending Overview

            </h2>

            {
              lineData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={400}
                >

                  <LineChart
                    data={lineData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                    />

                    <YAxis />

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
                        />

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

              ) : (

                <div className="nodata">

                  No Data Found

                </div>

              )
            }

          </div>

        </div>

      </div>

      {/* CSS */}

      <style jsx>{`

        .dashboard-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
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
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
        }

        .summary-card p {
          font-size: 30px;
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

        .month-filter {
          padding: 12px;
          border-radius: 10px;
          border: none;
          outline: none;
        }

        .nodata {
          height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
        }

      `}</style>

    </div>
  );
}

export default Analytics;