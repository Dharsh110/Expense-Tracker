function TransactionList({
  transactions,
  deleteTransaction,
  setEditData,
}) {

  // CATEGORY COLORS

  const categoryColors = {

    Food: "#22c55e",

    Travel: "#3b82f6",

    Shopping: "#f59e0b",

    Bills: "#8b5cf6",

    Salary: "#06b6d4",

    Entertainment: "#8b5cf6",

    Health: "#10b981",

    Education: "#0ea5e9",

    "Personal Saving": "#14b8a6",

    Other: "#6b7280",

  };

  return (

    <div className="table-card">

      <h2 className="section-title">
        Recent Transactions
      </h2>

      <table>

        <thead>

          <tr>

            <th>Title</th>

            <th>Amount</th>

            <th>Category</th>

            <th>Type</th>

            <th>Date</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {
            transactions.map(
              (item) => (

                <tr key={item.id}>

                  <td>
                    {item.title}
                  </td>

                  <td>

                    ₹ {item.amount}

                  </td>

                  {/* CATEGORY */}

                  <td>

                    <span
                      className="category-badge"
                      style={{
                        background:
                          categoryColors[
                            item.category
                          ] || "#64748b",
                      }}
                    >

                      {item.category}

                    </span>

                  </td>

                  {/* TYPE */}

                  <td>

                    <span
                      className={
                        item.type ===
                        "income"

                          ? "income-badge"

                          : "expense-badge"
                      }
                    >

                      {item.type}

                    </span>

                  </td>

                  <td>
                    {item.date}
                  </td>

                  {/* ACTIONS */}

                  <td>

                    <button
                      className="
                        action-btn
                        edit-btn
                      "
                      onClick={() =>
                        setEditData(item)
                      }
                    >

                      Edit

                    </button>

                    <button
                      className="
                        action-btn
                        delete-btn
                      "
                      onClick={() =>
                        deleteTransaction(
                          item.id
                        )
                      }
                    >

                      Delete

                    </button>

                  </td>

                </tr>

              )
            )
          }

        </tbody>

      </table>

    </div>
  );
}

export default TransactionList;