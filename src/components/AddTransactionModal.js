import { useState } from "react";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

import "./AddTransaction.css";

function AddTransactionModal({
  isOpen,
  onClose,
}) {
  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [type, setType] =
    useState("expense");

  const [date, setDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // RESET FORM

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setType("expense");
    setDate("");
  };

  // SAVE TO FIRESTORE

  const saveTransaction =
    async () => {

      const user =
        auth.currentUser;

      if (!user) {

        alert(
          "Please login first"
        );

        return false;
      }

      if (
        !title ||
        !amount ||
        !category ||
        !date
      ) {

        alert(
          "Please fill all fields"
        );

        return false;
      }

      try {

        setLoading(true);

        await addDoc(
          collection(
            db,
            "transactions"
          ),
          {

            title:
              title.trim(),

            amount:
              Number(amount),

            category,

            type,

            date,

            userId:
              user.uid,

            createdAt:
              serverTimestamp(),

          }
        );

        return true;

      } catch (error) {

        console.log(error);

        alert(
          "Failed to add transaction"
        );

        return false;

      } finally {

        setLoading(false);

      }
    };

  // ADD MORE

  const handleAddMore =
    async () => {

      const success =
        await saveTransaction();

      if (success) {

        resetForm();

      }
    };

  // DONE

  const handleDone =
    async () => {

      const hasData =

        title ||
        amount ||
        category ||
        date;

      if (hasData) {

        const success =
          await saveTransaction();

        if (!success)
          return;
      }

      resetForm();

      onClose();
    };

  // CLOSE MODAL

  const handleClose = () => {

    resetForm();

    onClose();

  };

  if (!isOpen)
    return null;

  return (

    <div className="modal-overlay">

      <div className="transaction-modal">

        {/* HEADER */}

        <div className="modal-header">

          <h2>
            Add New Transaction
          </h2>

          <button
            className="close-btn"
            onClick={
              handleClose
            }
          >
            ×
          </button>

        </div>

        {/* FORM */}

        <div className="modal-form">

          <div className="form-group">

            <label>
              Title
            </label>

            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Amount
            </label>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            >

              <option value="">
                Select Category
              </option>

              <option value="Food">
                Food
              </option>

              <option value="Travel">
                Travel
              </option>

              <option value="Shopping">
                Shopping
              </option>

              <option value="Entertainment">
                Entertainment
              </option>

              <option value="Bills">
                Bills
              </option>

              <option value="Health">
                Health
              </option>

              <option value="Education">
                Education
              </option>

              <option value="Salary">
                Salary
              </option>

              <option value="Personal Saving">
                Personal Saving
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          <div className="form-group">

            <label>
              Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value
                )
              }
            >

              <option value="expense">
                Expense
              </option>

              <option value="income">
                Income
              </option>

            </select>

          </div>

          <div className="form-group">

            <label>
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
            />

          </div>

          {/* BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
            }}
          >

            <button
              type="button"
              onClick={
                handleAddMore
              }
              disabled={loading}
              style={{
                flex: 1,
                background:
                  "#10b981",
                color: "#fff",
                border: "none",
                padding:
                  "12px",
                borderRadius:
                  "10px",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
              }}
            >

              {loading
                ? "Saving..."
                : "Add More"}

            </button>

            <button
              type="button"
              onClick={
                handleDone
              }
              disabled={loading}
              style={{
                flex: 1,
                background:
                  "#2563eb",
                color: "#fff",
                border: "none",
                padding:
                  "12px",
                borderRadius:
                  "10px",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
              }}
            >

              Done

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AddTransactionModal;