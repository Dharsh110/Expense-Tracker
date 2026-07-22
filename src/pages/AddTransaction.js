import { useContext } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import TransactionForm from "../components/TransactionForm";

import { ThemeContext } from "../context/ThemeContext";

import { addUserDocument } from "../services/firestoreData";

function AddTransaction() {
  const { darkMode, toggleTheme } =
    useContext(ThemeContext);

  const navigate = useNavigate();

  const addTransaction = async (data) => {
    if (Number(data.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      await addUserDocument("transactions", {
        ...data,
        id: Date.now(),
      });

      toast.success("Transaction added successfully");

      navigate("/transactions");
    } catch (error) {
      toast.error(error.message);
    }
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
            <h1>Add Transaction</h1>
            <p>Record a new income or expense</p>
          </div>
        </div>

        <TransactionForm
          addTransaction={addTransaction}
          editData={null}
          updateTransaction={() => {}}
        />
      </div>
    </div>
  );
}

export default AddTransaction;
