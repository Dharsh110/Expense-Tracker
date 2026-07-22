import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer
} from 'recharts';

function ExpenseChart({ transactions }) {
  const categoryData = [];

  transactions.forEach((item) => {
    const existing = categoryData.find(
      (data) => data.name === item.category
    );

    if (existing) {
      existing.value += Number(item.amount);
    } else {
      categoryData.push({
                name: item.category,
        value: Number(item.amount)
      });
    }
  });

  const COLORS = ['#00C49F', '#FF8042', '#0088FE', '#FFBB28'];

  return (
    <div className='chart-box'>
      <h2>Expense Analytics</h2>

      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            dataKey='value'
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