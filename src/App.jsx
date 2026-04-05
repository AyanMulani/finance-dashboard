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
  const [toast, setToast] = useState("");

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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast("Transaction Deleted");
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
    showToast("Transaction Updated");
  };

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
    showToast("Transaction Added");
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

      <aside className="w-64 min-h-screen bg-gray-900 text-white p-6 fixed left-0 top-0">
        <h2 className="text-xl font-bold mb-6">Finance App</h2>

        <nav className="space-y-3 text-gray-300">
          <button onClick={() => document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" })}>Dashboard</button>
          <button onClick={() => document.getElementById("transactions").scrollIntoView({ behavior: "smooth" })}>Transactions</button>
          <button onClick={() => document.getElementById("insights").scrollIntoView({ behavior: "smooth" })}>Insights</button>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-4 md:p-8 bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">

        <div id="dashboard" className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={()=>setDark(v=>!v)} className="px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black">Theme</button>
            <button onClick={exportCSV} className="px-3 py-1 rounded bg-green-500 text-white dark:bg-green-400 dark:text-black">Export CSV</button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="p-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600">
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>

          <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="p-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600">
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select value={sort} onChange={(e)=>setSort(e.target.value)} className="p-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600">
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>

          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search category" className="p-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600" />
        </div>

        <div id="transactions" className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-800 dark:text-white">
                <th className="p-2">Date</th>
                <th className="p-2">Category</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Type</th>
                {role === "admin" && <th className="p-2">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="text-center border-t dark:border-gray-700">
                  <td className="p-2">{t.date}</td>
                  <td className="p-2">{t.category}</td>
                  <td className="p-2">₹{t.amount}</td>
                  <td className="p-2">{t.type}</td>

                  {role === "admin" && (
                    <td className="p-2 space-x-2">
                      <button onClick={()=>setEditId(t.id)} className="bg-yellow-500 text-white dark:bg-yellow-400 dark:text-black px-2 py-1 rounded">Edit</button>
                      <button onClick={()=>deleteTransaction(t.id)} className="bg-red-500 text-white dark:bg-red-400 dark:text-black px-2 py-1 rounded">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {toast && (
          <div className="fixed bottom-5 right-5 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded shadow">
            {toast}
          </div>
        )}

      </main>
    </div>
  );
}
