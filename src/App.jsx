import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const seedData = [
  { id: 1, date: "2026-04-01", amount: 5000, category: "Salary", type: "income" },
  { id: 2, date: "2026-04-02", amount: 1200, category: "Food", type: "expense" },
  { id: 3, date: "2026-04-03", amount: 2000, category: "Shopping", type: "expense" },
  { id: 4, date: "2026-04-04", amount: 800, category: "Transport", type: "expense" },
];

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : seedData;
  });

  const [role, setRole] = useState("viewer");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [dark, setDark] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const income = useMemo(() => transactions.filter(t => t.type === "income").reduce((a,b)=>a+b.amount,0), [transactions]);
  const expense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((a,b)=>a+b.amount,0), [transactions]);
  const balance = income - expense;

  const filtered = useMemo(() => {
    let list = transactions
      .filter(t => t.category.toLowerCase().includes(search.toLowerCase()))
      .filter(t => filter === "all" ? true : t.type === filter);

    if (sort === "amount") list = [...list].sort((a,b)=>b.amount-a.amount);
    if (sort === "date") list = [...list].sort((a,b)=>new Date(b.date)-new Date(a.date));
    return list;
  }, [transactions, search, filter, sort]);

  const categoryData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (!map[t.category]) map[t.category] = { name: t.category, value: 0 };
      map[t.category].value += t.amount;
    });
    return Object.values(map);
  }, [transactions]);

  const highestCategory = useMemo(() => {
    if (!categoryData.length) return "N/A";
    return [...categoryData].sort((a,b)=>b.value-a.value)[0].name;
  }, [categoryData]);

  const addTransaction = (e) => {
    e.preventDefault();
    const f = e.target;
    const newTx = {
      id: Date.now(),
      date: f.date.value,
      amount: Number(f.amount.value),
      category: f.category.value,
      type: f.type.value
    };
    setTransactions(prev => [...prev, newTx]);
    f.reset();
  };

  const updateTransaction = (e) => {
    e.preventDefault();
    const f = e.target;

    setTransactions(prev =>
      prev.map(t =>
        t.id === editId
          ? {
              ...t,
              date: f.date.value,
              amount: Number(f.amount.value),
              category: f.category.value,
              type: f.type.value
            }
          : t
      )
    );

    setEditId(null);
  };

  const exportCSV = () => {
    const rows = ["Date,Category,Amount,Type", ...transactions.map(t => `${t.date},${t.category},${t.amount},${t.type}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-gray-900 text-white p-6 fixed left-0 top-0">
        <h2 className="text-xl font-bold mb-6">Finance App</h2>

        <nav className="space-y-2 text-gray-300">
          <button onClick={() => document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" })}>
            Dashboard
          </button>
          <button onClick={() => document.getElementById("transactions").scrollIntoView({ behavior: "smooth" })}>
            Transactions
          </button>
          <button onClick={() => document.getElementById("insights").scrollIntoView({ behavior: "smooth" })}>
            Insights
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-4 md:p-8 bg-gray-100 dark:bg-gray-900">

        {/* Header */}
        <div id="dashboard" className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={()=>setDark(v=>!v)} className="bg-black text-white px-2">Theme</button>
            <button onClick={exportCSV} className="bg-green-500 text-white px-2">Export</button>
          </div>
        </div>

        {/* Table */}
        <div id="transactions">
          <table className="w-full bg-white">
            <thead>
              <tr>
                <th>Date</th><th>Category</th><th>Amount</th><th>Type</th>
                {role === "admin" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.category}</td>
                  <td>{t.amount}</td>
                  <td>{t.type}</td>

                  {role === "admin" && (
                    <td>
                      <button onClick={()=>setEditId(t.id)}>Edit</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Form */}
        {editId && (
          <form onSubmit={updateTransaction}>
            <input name="date" type="date" required />
            <input name="amount" type="number" required />
            <input name="category" required />
            <select name="type">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button>Update</button>
          </form>
        )}

        {/* Insights */}
        <div id="insights">
          <p>Highest category: {highestCategory}</p>
        </div>

      </main>
    </div>
  );
}
