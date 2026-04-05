
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
          <button className="block w-full text-left hover:text-white">
  Dashboard
</button>

<button className="block w-full text-left hover:text-white">
  Transactions
</button>

<button className="block w-full text-left hover:text-white">
  Insights
</button>
        </nav>
      </aside>

<main className="flex-1 ml-64 p-4 md:p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={()=>setDark(v=>!v)} className="px-3 py-1 rounded bg-black text-white">Theme</button>
            <button onClick={exportCSV} className="px-3 py-1 rounded bg-green-500 text-white">Export CSV</button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap mb-4">
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="p-2 rounded border">
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
          <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="p-2 rounded border">
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={sort} onChange={(e)=>setSort(e.target.value)} className="p-2 rounded border">
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search category" className="p-2 rounded border" />
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[{label:'Balance',value:balance},{label:'Income',value:income},{label:'Expense',value:expense}].map((i,idx)=>(
            <motion.div key={idx} whileHover={{scale:1.05}} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <div className="text-sm opacity-70">{i.label}</div>
              <div className="text-2xl font-semibold">₹{i.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow h-[300px]">
            <ResponsiveContainer>
              <LineChart data={transactions}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData} dataKey="value" outerRadius={100}>
                  {categoryData.map((e,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="p-2">Date</th>
                <th className="p-2">Category</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center">No Data</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="text-center border-t">
                  <td className="p-2">{t.date}</td>
                  <td className="p-2">{t.category}</td>
                  <td className="p-2">₹{t.amount}</td>
                  <td className="p-2">{t.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Admin Form */}
        {role === 'admin' && (
          <form onSubmit={addTransaction} className="mt-4 grid md:grid-cols-4 gap-2">
            <input name="date" type="date" required className="p-2 rounded border" />
            <input name="amount" type="number" required placeholder="Amount" className="p-2 rounded border" />
            <input name="category" required placeholder="Category" className="p-2 rounded border" />
            <select name="type" className="p-2 rounded border">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button className="bg-blue-500 text-white p-2 rounded col-span-full">Add Transaction</button>
          </form>
        )}

        {/* Insights */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-bold mb-2">Insights</h2>
          <p>Highest spending category: {highestCategory}</p>
          <p>Total transactions: {transactions.length}</p>
          <p>Net balance: ₹{balance}</p>
        </div>
      </main>
    </div>
  );
}
