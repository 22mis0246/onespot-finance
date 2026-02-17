import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

interface Liability {
  id?: number;
  title: string;
  type: string;
  totalAmount: number;
  outstanding: number;
  interestRate: number;
  dueDate: number;
  createdAt?: string;
}

export default function Liabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLiability, setEditingLiability] =
    useState<Liability | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "Home Loan",
    totalAmount: "",
    interestRate: "",
    dueDate: "", 
  });

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const fetchLiabilities = async () => {
    const res = await api.get("/api/liabilities");
    setLiabilities(res.data);
  };

  /* =========================
     Save / Update
  ========================= */
  const saveLiability = async () => {
    if (!form.title || !form.totalAmount) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      title: form.title,
      type: form.type,
      totalAmount: Number(form.totalAmount),
      outstanding: Number(form.totalAmount),
      interestRate: Number(form.interestRate),
      dueDate: form.dueDate ? new Date(form.dueDate) : null, 
    };

    if (editingLiability) {
      await api.put(
        `/api/liabilities/${editingLiability.id}`,
        payload
      );
    } else {
      await api.post("/api/liabilities", payload);
    }

    fetchLiabilities();
    setShowModal(false);
    setEditingLiability(null);
    setForm({
      title: "",
      type: "Home Loan",
      totalAmount: "",
      interestRate: "",
      dueDate:"",
    });
  };

  /* =========================
     Delete
  ========================= */
  const deleteLiability = async (id?: number) => {
    if (!id) return;
    await api.delete(`/api/liabilities/${id}`);
    fetchLiabilities();
  };

  const totalOutstanding = liabilities.reduce(
    (sum, l) => sum + l.outstanding,
    0
  );

  return (
    <DashboardLayout>
      <div className="p-8 text-white">

        <h1 className="text-3xl font-bold mb-6">Liabilities</h1>

        {/* SUMMARY CARD */}
        <div className="grid md:grid-cols-1 gap-6 mb-8">
          <div className="bg-white/10 p-5 rounded-xl w-[250px]">
            <p className="text-sm text-white/60">
              Total Outstanding
            </p>
            <h2 className="text-xl font-bold text-red-400">
              ₹ {totalOutstanding.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mb-6 px-6 py-3 bg-indigo-600 rounded-lg"
        >
          + Add Liability
        </button>

        {/* LIABILITY LIST */}
        <div className="grid gap-4">
          {liabilities.map((l) => (
            <div
              key={l.id}
              className="bg-white/10 p-5 rounded-xl flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{l.title}</h3>
                <p className="text-sm text-white/60">
                  {l.type}
                </p>
                <p className="text-sm text-white/60">
                  Interest: {l.interestRate}%
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-red-400">
                  ₹ {l.outstanding.toLocaleString("en-IN")}
                </p>
                 {l.dueDate && (
    <p className="text-sm text-teal-400 mt-1">
      Due: {new Date(l.dueDate).toLocaleDateString("en-IN")}
    </p>
  )}

                <div className="flex gap-4 mt-2 justify-end">
                  <button
                    onClick={() => {
                      setEditingLiability(l);
                      setForm({
                        title: l.title,
                        type: l.type,
                        totalAmount:
                          l.totalAmount.toString(),
                        interestRate:
                          l.interestRate.toString(),
                           dueDate: l.dueDate
    ? new Date(l.dueDate).toISOString().split("T")[0]
    : "",
                      });
                      setShowModal(true);
                    }}
                    className="text-yellow-400 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteLiability(l.id)
                    }
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
                {editingLiability
                  ? "Edit"
                  : "Add"}{" "}
                Liability
              </h2>

              <input
                type="text"
                placeholder="Title"
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
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >
                {[
                  "Home Loan",
                  "Personal Loan",
                  "Vehicle Loan",
                  "Education Loan",
                  "Credit Card",
                ].map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-slate-900"
                  >
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Total Amount"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.totalAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    totalAmount: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Interest Rate %"
                className="w-full p-3 mb-6 bg-white/10 rounded-lg"
                value={form.interestRate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    interestRate: e.target.value,
                  })
                }
                
              />
              <input
  type="date"
  className="w-full p-3 mb-6 bg-white/10 rounded-lg text-white"
  value={form.dueDate}
  onChange={(e) =>
    setForm({
      ...form,
      dueDate: e.target.value,
    })
  }
/>


              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingLiability(null);
                  }}
                  className="px-5 py-2 bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={saveLiability}
                  className="px-5 py-2 bg-indigo-600 rounded-lg"
                >
                  {editingLiability
                    ? "Update"
                    : "Add"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
