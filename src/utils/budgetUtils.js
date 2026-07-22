export function calculateSpent(transactions, categoryName, type) {
  const now = new Date();

  const filtered = transactions.filter((item) => {
    if (item.category !== categoryName) return false;

    const itemDate = new Date(item.date);

    if (type === "Weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return itemDate >= weekAgo;
    }

    if (type === "Monthly") {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    if (type === "Yearly") {
      return itemDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  return filtered.reduce(
    (total, item) => total + Number(item.amount),
    0
  );
}
