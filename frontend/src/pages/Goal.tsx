import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

/* =========================
   Goal Interface
========================= */
interface Goal {
  id?: number;
  title: string;
  category: "short" | "long";
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt?: string;
}

export default function Goals() {

  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "short",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
  });

  /* =========================
     Fetch Goals
  ========================= */
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const res = await api.get("/api/goals");
    setGoals(res.data);
  };

  /* =========================
     Save / Update Goal
  ========================= */
  const saveGoal = async () => {
    if (!form.title || !form.targetAmount || !form.targetDate) {
      alert("Please fill required fields");
      return;
    }

    const payload = {
      title: form.title,
      category: form.category,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount || 0),
      targetDate: form.targetDate,
    };

    if (editingGoal) {
      await api.put(`/api/goals/${editingGoal.id}`, payload);
    } else {
      await api.post("/api/goals", payload);
    }

    fetchGoals();
    setShowModal(false);
    setEditingGoal(null);
    setForm({
      title: "",
      category: "short",
      targetAmount: "",
      currentAmount: "",
      targetDate: "",
    });
  };

  /* =========================
     Delete Goal
  ========================= */
  const deleteGoal = async (id?: number) => {
    if (!id) return;
    await api.delete(`/api/goals/${id}`);
    fetchGoals();
  };

  /* =========================
     Calculations
  ========================= */
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const overallProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const now = new Date();

  /* =========================
     Split Goals
  ========================= */
  const shortGoals = goals.filter((g) => g.category === "short");
  const longGoals = goals.filter((g) => g.category === "long");

  /* =========================
     Helper Functions
  ========================= */
  const getProgressColor = (progress: number) => {
    if (progress < 40) return "bg-red-500";
    if (progress < 75) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getDaysRemaining = (date: string) => {
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getMonthlyRequired = (goal: Goal) => {
    const daysLeft = getDaysRemaining(goal.targetDate);
    if (daysLeft <= 0) return 0;

    const monthsLeft = daysLeft / 30;
    const remaining = goal.targetAmount - goal.currentAmount;
    return remaining > 0 ? remaining / monthsLeft : 0;
  };

  return (
    <DashboardLayout>
      <div className="p-8 text-white">

        <h1 className="text-3xl font-bold mb-6">Goals</h1>

        {/* SUMMARY CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white/10 p-5 rounded-xl">
            <p className="text-sm text-white/60">Total Target</p>
            <h2 className="text-xl font-bold text-indigo-400">
              ₹ {totalTarget.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white/10 p-5 rounded-xl">
            <p className="text-sm text-white/60">Total Saved</p>
            <h2 className="text-xl font-bold text-green-400">
              ₹ {totalSaved.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white/10 p-5 rounded-xl">
            <p className="text-sm text-white/60">Overall Progress</p>
            <h2 className="text-xl font-bold">
              {overallProgress.toFixed(1)}%
            </h2>
          </div>

          <div className="bg-white/10 p-5 rounded-xl">
            <p className="text-sm text-white/60">Active Goals</p>
            <h2 className="text-xl font-bold">
              {goals.length}
            </h2>
          </div>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mb-8 px-6 py-3 bg-indigo-600 rounded-lg"
        >
          + Add Goal
        </button>

        {/* GOAL SECTIONS */}
        {[{ title: "Short Term Goals", data: shortGoals },
          { title: "Long Term Goals", data: longGoals }].map(section => (
          <div key={section.title} className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              {section.title}
            </h2>

            <div className="grid gap-5">
              {section.data.map(goal => {

                const progress =
                  (goal.currentAmount / goal.targetAmount) * 100;

                const daysLeft =
                  getDaysRemaining(goal.targetDate);

                const monthlyRequired =
                  getMonthlyRequired(goal);

                return (
                  <div
                    key={goal.id}
                    className="bg-white/10 p-6 rounded-xl"
                  >

                    <div className="flex justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-white/60">
                          Target Date:{" "}
                          {new Date(
                            goal.targetDate
                          ).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-green-400">
                          ₹ {goal.currentAmount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-white/60 text-sm">
                          of ₹{" "}
                          {goal.targetAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-3 mb-3">
                      <div
                        className={`${getProgressColor(progress)} h-3 rounded-full`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    {/* Extra Metrics */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70">

                      <div>
                        Remaining: ₹{" "}
                        {(goal.targetAmount -
                          goal.currentAmount
                        ).toLocaleString("en-IN")}
                      </div>

                      <div>
                        Days Left: {daysLeft > 0 ? daysLeft : "Overdue"}
                      </div>

                      <div>
                        Monthly Required: ₹{" "}
                        {monthlyRequired.toLocaleString("en-IN")}
                      </div>

                    </div>

                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setForm({
                            title: goal.title,
                            category: goal.category,
                            targetAmount:
                              goal.targetAmount.toString(),
                            currentAmount:
                              goal.currentAmount.toString(),
                            targetDate:
                              goal.targetDate.split("T")[0],
                          });
                          setShowModal(true);
                        }}
                        className="text-yellow-400 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteGoal(goal.id)
                        }
                        className="text-red-400 text-sm"
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-2xl w-[400px]">

              <h2 className="text-xl font-bold mb-6">
                {editingGoal ? "Edit" : "Add"} Goal
              </h2>

              <input
                type="text"
                placeholder="Goal Title"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <select
                className="w-full p-3 mb-4 bg-white/10 rounded-lg text-white"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category:
                      e.target.value as "short" | "long",
                  })
                }
              >
                <option value="short" className="bg-slate-900">
                  Short Term
                </option>
                <option value="long" className="bg-slate-900">
                  Long Term
                </option>
              </select>

              <input
                type="number"
                placeholder="Target Amount"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.targetAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetAmount: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Current Saved"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.currentAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currentAmount: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="w-full p-3 mb-6 bg-white/10 rounded-lg text-white"
                value={form.targetDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetDate: e.target.value,
                  })
                }
              />

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingGoal(null);
                  }}
                  className="px-5 py-2 bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={saveGoal}
                  className="px-5 py-2 bg-indigo-600 rounded-lg"
                >
                  {editingGoal ? "Update" : "Add"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
