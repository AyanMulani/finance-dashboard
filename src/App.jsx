import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const seedData = [
  { id: 1, date: "2026-04-01", amount: 5000, category: "Salary", type: "income" },
  { id: 2, date: "2026-04-02", amount: 1200, category: "Food", type: "expense" },
];

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : seedData;
  });

  const [role, setRole] = useState("viewer");
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

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
          ? { ...t, category: f.category.value, amount: Number(f.amount.value) }
          : t
      )
    );

    setEditId(null);
    showToast("Transaction Updated");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="font-bold mb-4">Finance</h2>
      </aside>

      <main className="flex-1 p-6">

        {/* Role */}
        <select onChange={(e)=>setRole(e.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>

        {/* Table */}
        <table className="w-full mt-4">
          <thead>
            <tr>
              <th>Category</th><th>Amount</th>
              {role==="admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>{t.category}</td>
                <td>{t.amount}</td>

                {role==="admin" && (
                  <td className="space-x-2">
                    <button onClick={()=>setEditId(t.id)}>✏️</button>
                    <button onClick={()=>deleteTransaction(t.id)}>🗑️</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Edit Form */}
        {editId && (
          <form onSubmit={updateTransaction} className="mt-4 p-4 bg-gray-100 rounded">
            <input name="category" placeholder="Category" required />
            <input name="amount" type="number" required />
            <button className="bg-blue-500 text-white px-2">Update</button>
          </form>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded">
            {toast}
          </div>
        )}

      </main>
    </div>
  );
}
