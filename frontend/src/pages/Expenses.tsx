import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =========================
   Expense Interface
========================= */
interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  date: string;
}

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#14B8A6",
  "#F43F5E",
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await api.get("/api/expenses");
    setExpenses(res.data);
  };

  /* =========================
     Save / Update Expense
  ========================= */
  const saveExpense = async () => {
    if (!form.title || !form.amount) {
      alert("Fill all fields");
      return;
    }

   const payload = {
  title: form.title,
  amount: Number(form.amount),
  category: form.category,
  type: "daily",
  date: new Date().toISOString(),
};


    if (editingExpense) {
      await api.put(`/api/expenses/${editingExpense.id}`, payload);
    } else {
      await api.post("/api/expenses", payload);
    }

    fetchExpenses();
    setShowModal(false);
    setEditingExpense(null);
    setForm({
      title: "",
      amount: "",
      category: "Food",
    });
  };

  /* =========================
     Delete
  ========================= */
  const deleteExpense = async (id?: number) => {
    if (!id) return;
    await api.delete(`/api/expenses/${id}`);
    fetchExpenses();
  };

  /* =========================
     Date Calculations (CORRECT)
  ========================= */
  const now = new Date();

  const todayTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const yearTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  /* =========================
     Pie Chart Data
  ========================= */
  const categoryData = Object.values(
    expenses.reduce((acc: any, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = {
          name: curr.category,
          value: 0,
        };
      }
      acc[curr.category].value += curr.amount;
      return acc;
    }, {})
  );

  return (
    <DashboardLayout>
      <div className="p-8 text-white">

        <h1 className="text-3xl font-bold mb-6">Expenses</h1>

        {/* SUMMARY CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white/10 p-5 rounded-xl">
            <p className="text-sm text-white/60">Today</p>
            <h2 className="text-xl font-bold text-red-400">
              ₹ {todayTotal.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white/10 p-5 rounded-xl">
            <p className="text-sm text-white/60">This Month</p>
            <h2 className="text-xl font-bold text-yellow-400">
              ₹ {monthTotal.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white/10 p-5 rounded-xl">
            <p className="text-sm text-white/60">This Year</p>
            <h2 className="text-xl font-bold text-green-400">
              ₹ {yearTotal.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white/10 p-5 rounded-xl">
            <p className="text-sm text-white/60">Total</p>
            <h2 className="text-xl font-bold text-indigo-400">
              ₹ {totalExpense.toLocaleString("en-IN")}
            </h2>
          </div>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mb-6 px-6 py-3 bg-indigo-600 rounded-lg"
        >
          + Add Expense
        </button>

        {/* PIE CHART */}
        <div className="bg-white/10 p-6 rounded-xl mb-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ value }) =>
                  `₹ ${value.toLocaleString("en-IN")}`
                }
              >
                {categoryData.map((_, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value:any) =>
                `₹ ${Number(value).toLocaleString("en-IN")}`
              }/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* EXPENSE LIST (BACK BELOW PIE) */}
        <div className="grid gap-4">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white/10 p-5 rounded-xl flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{exp.title}</h3>
                <p className="text-sm text-white/60">
                  {exp.category}
                </p>
                <p className="text-sm text-white/60">
                  {new Date(exp.date).toLocaleDateString("en-IN")}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-indigo-400">
                  ₹ {exp.amount.toLocaleString("en-IN")}
                </p>

                <div className="flex gap-4 mt-2 justify-end">
                  <button
                    onClick={() => {
                      setEditingExpense(exp);
                      setForm({
                        title: exp.title,
                        amount: exp.amount.toString(),
                        category: exp.category,
                      });
                      setShowModal(true);
                    }}
                    className="text-yellow-400 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-2xl w-[400px]">

              <h2 className="text-xl font-bold mb-6">
                {editingExpense ? "Edit" : "Add"} Expense
              </h2>

              <input
                type="text"
                placeholder="Title"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Amount"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />

              <select
                className="w-full p-3 mb-6 bg-white/10 rounded-lg text-white"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                {[
                  "Food",
                  "Groceries",
                  "Transport",
                  "Utilities",
                  "Health & Fitness",
                  "Entertainment",
                  "Bills",
                  "Miscellaneous",
                ].map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                  }}
                  className="px-5 py-2 bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={saveExpense}
                  className="px-5 py-2 bg-indigo-600 rounded-lg"
                >
                  {editingExpense ? "Update" : "Add"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
