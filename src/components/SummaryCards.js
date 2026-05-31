function SummaryCards({
  transactions,
}) {

  // TOTAL INCOME

  const totalIncome =
    transactions
      .filter(
        (item) =>
          item.type ===
          "income"
      )
      .reduce(
        (acc, item) =>

          acc +
          Number(
            item.amount
          ),

        0
      );

  // TOTAL EXPENSE

  const totalExpense =
    transactions
      .filter(
        (item) =>
          item.type ===
          "expense"
      )
      .reduce(
        (acc, item) =>

          acc +
          Number(
            item.amount
          ),

        0
      );

  // BALANCE

  const balance =
    totalIncome -
    totalExpense;

  return (

    <div className="summary-container">

      {/* INCOME */}

      <div className="summary-card income-card">

        <div className="summary-top">

          <span className="summary-icon">
            💰
          </span>

          <p>
            Total Income
          </p>

        </div>

        <h2>
          ₹ {totalIncome}
        </h2>

      </div>

      {/* EXPENSE */}

      <div className="summary-card expense-card">

        <div className="summary-top">

          <span className="summary-icon">
            💸
          </span>

          <p>
            Total Expense
          </p>

        </div>

        <h2>
          ₹ {totalExpense}
        </h2>

      </div>

      {/* BALANCE */}

      <div className="summary-card balance-card">

        <div className="summary-top">

          <span className="summary-icon">
            🏦
          </span>

          <p>
            Current Balance
          </p>

        </div>

        <h2>
          ₹ {balance}
        </h2>

      </div>

    </div>
  );
}

export default SummaryCards;