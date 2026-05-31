import { useEffect, useState, useContext } from "react";

import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function ExpenseChart() {
  const [transactions, setTransactions] = useState([]);

  // 🔥 FETCH FROM FIRESTORE
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);

        const data = [];

        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setTransactions(data);

      } catch (error) {
        console.log("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  // 📊 GROUP BY CATEGORY
  const categoryMap = {};

  transactions.forEach((item) => {
    const category = item.category || "Others";

    if (!categoryMap[category]) {
      categoryMap[category] = 0;
    }

    categoryMap[category] += Number(item.amount || 0);
  });

  const categoryData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  // 🎨 COLORS
  const COLORS = ["#f97316", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444", "#10b981", "#0ea5e9", "#22c55e", "#14b8a6", "#6b7280",];

  return (
    <div className="chart-box">
      <h2>Expense Analytics</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            dataKey="value"
            outerRadius={100}
            label
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExpenseChart;