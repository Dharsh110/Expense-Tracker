import {
  useState,
  useEffect,
} from "react";

function TransactionForm({

  addTransaction,

  editData,

  updateTransaction,

}) {

  const [formData, setFormData] =
    useState({

      title: "",

      amount: "",

      category: "",

      type: "expense",

      date: "",

    });

  useEffect(() => {

    if (editData) {

      setFormData(editData);

    }

  }, [editData]);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (editData) {

      updateTransaction(formData);

    } else {

      addTransaction({

        ...formData,

        id: Date.now(),

      });
    }

    setFormData({

      title: "",

      amount: "",

      category: "",

      type: "expense",

      date: "",

    });
  };

  return (

    <div className="form-card">

      <h2 className="section-title">

        Add New Transaction

      </h2>

      <form
        onSubmit={handleSubmit}
      >

        <div className="form-grid">

          <div className="form-group">

            <label>
              Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="Enter title"
              value={formData.title}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Amount
            </label>

            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Category
              </option>

              <option value="Food">Food</option>

              <option value="Travel">Travel</option>

              <option value="Shopping">Shopping</option>

                <option value="Entertainment">Entertainment</option>

                <option value="Bills">Bills</option>

                <option value="Health">Health</option>

                <option value="Education">Education</option>

                <option value="Salary">Salary</option>

                <option value="Personal Saving">Personal Saving</option>

                <option value="Other">Other</option>

            </select>

          </div>

          <div className="form-group">

            <label>
              Type
            </label>

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

          </div>

          <div className="form-group">

            <label>
              Date
            </label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

          </div>

        </div>

        <button
          className="primary-btn"
          type="submit"
        >

          {
            editData
              ? "Update Transaction"
              : "Add Transaction"
          }

        </button>

      </form>

    </div>
  );
}

export default TransactionForm;