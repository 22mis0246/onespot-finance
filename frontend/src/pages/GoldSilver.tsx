import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

type PhysicalHolding = {
  metal: "Gold" | "Silver";
  quantity: number;
  buyPrice: number;
  currentPrice: number;
};

type ETFHolding = {
  name: string;
  avgPrice: number;
  quantity: number;
  currentPrice: number;
};

type SGBHolding = {
  name: string;
  investedAmount: number;
  currentValue: number;
};

export default function GoldSilver() {
  const [activeTab, setActiveTab] = useState<"physical" | "etf" | "sgb">("physical");
  const [showModal, setShowModal] = useState(false);

  const [physical, setPhysical] = useState<PhysicalHolding[]>([]);
  const [etf, setEtf] = useState<ETFHolding[]>([]);
  const [sgb, setSgb] = useState<SGBHolding[]>([]);

  const [form, setForm] = useState<any>({});


const addHolding = async () => {
  try {

    let payload: any = {};

    if (activeTab === "physical") {
      payload = {
        name: form.metal,
        type: form.metal.toLowerCase(),
        quantity: form.quantity,
        avgPrice: form.buyPrice,
        currentPrice: form.currentPrice,
      };
    }

    if (activeTab === "etf") {
      payload = {
        name: form.name,
        type: "gold_etf",
        quantity: form.quantity,
        avgPrice: form.avgPrice,
        currentPrice: form.currentPrice,
      };
    }

    if (activeTab === "sgb") {
      payload = {
        name: form.name,
        type: "sgb",
        avgPrice: form.investedAmount,
        quantity: 1,
        currentPrice: form.currentValue,
      };
    }

    await api.post("/api/investments", payload);

    setShowModal(false);
    setForm({});

  } catch (err) {
    console.error(err);
  }
};

  const deleteHolding = (index: number) => {
    if (activeTab === "physical") {
      setPhysical(physical.filter((_, i) => i !== index));
    } else if (activeTab === "etf") {
      setEtf(etf.filter((_, i) => i !== index));
    } else {
      setSgb(sgb.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    if (activeTab === "physical") {
      const invested = physical.reduce(
        (sum, h) => sum + h.quantity * h.buyPrice,
        0
      );
      const current = physical.reduce(
        (sum, h) => sum + h.quantity * h.currentPrice,
        0
      );
      return { invested, current, pnl: current - invested };
    }

    if (activeTab === "etf") {
      const invested = etf.reduce(
        (sum, h) => sum + h.avgPrice * h.quantity,
        0
      );
      const current = etf.reduce(
        (sum, h) => sum + h.currentPrice * h.quantity,
        0
      );
      return { invested, current, pnl: current - invested };
    }

    const invested = sgb.reduce((sum, h) => sum + h.investedAmount, 0);
    const current = sgb.reduce((sum, h) => sum + h.currentValue, 0);
    return { invested, current, pnl: current - invested };
  };

  const { invested, current, pnl } = calculateTotals();

  const holdings =
    activeTab === "physical"
      ? physical
      : activeTab === "etf"
      ? etf
      : sgb;

  return (
    <DashboardLayout>
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Gold & Silver</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {["physical", "etf", "sgb"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2 rounded-lg transition ${
                activeTab === tab
                  ? "bg-indigo-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {tab === "physical"
                ? "Physical"
                : tab === "etf"
                ? "ETF"
                : "SGB"}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <p className="text-sm text-white/60">Total Invested</p>
            <h2 className="text-2xl font-bold">₹ {invested}</h2>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-white/60">Current Value</p>
            <h2 className="text-2xl font-bold">₹ {current}</h2>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-white/60">Gain / Loss</p>
            <h2 className={`text-2xl font-bold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              ₹ {pnl}
            </h2>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Add {activeTab.toUpperCase()}
        </button>

        {/* Holdings List */}
        <div className="grid gap-4">
          {holdings.map((h: any, index: number) => (
            <div key={index} className="glass-card p-5 flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {h.name || h.metal}
                </h3>
              </div>
              <button
                onClick={() => deleteHolding(index)}
                className="text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-2xl w-[400px] border border-white/20">
              <h2 className="text-xl font-bold mb-6">Add {activeTab}</h2>

              {activeTab === "physical" && (
                <>
                 {/* ===== METAL TYPE DROPDOWN ===== */}
<div className="mb-4">
  <label className="block text-sm text-white/60 mb-1">
    Metal Type
  </label>

  <select
    className="w-full p-3 rounded-lg 
               bg-slate-800 text-white 
               border border-white/20 
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
    value={form.metal}
    onChange={(e) =>
      setForm({ ...form, metal: e.target.value })
    }
  >
    <option value="Gold" className="bg-slate-800">
      Gold
    </option>
    <option value="Silver" className="bg-slate-800">
      Silver
    </option>
  </select>
</div>

                  <input
                    className="input"
                    placeholder="Quantity (grams)"
                    type="number"
                    onChange={(e) =>
                      setForm({ ...form, quantity: Number(e.target.value) })
                    }
                  />

                  <input
                    className="input"
                    placeholder="Buy Price per gram"
                    type="number"
                    onChange={(e) =>
                      setForm({ ...form, buyPrice: Number(e.target.value) })
                    }
                  />

                  <input
                    className="input"
                    placeholder="Current Price per gram"
                    type="number"
                    onChange={(e) =>
                      setForm({ ...form, currentPrice: Number(e.target.value) })
                    }
                  />
                </>
              )}

              {activeTab === "etf" && (
                <>
                  <input
                    className="input"
                    placeholder="ETF Name"
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />

                  <input
                    className="input"
                    placeholder="Average Price"
                    type="number"
                    onChange={(e) =>
                      setForm({ ...form, avgPrice: Number(e.target.value) })
                    }
                  />

                  <input
                    className="input"
                    placeholder="Quantity"
                    type="number"
                    onChange={(e) =>
                      setForm({ ...form, quantity: Number(e.target.value) })
                    }
                  />

                  <input
                    className="input"
                    placeholder="Current Price"
                    type="number"
                    onChange={(e) =>
                      setForm({ ...form, currentPrice: Number(e.target.value) })
                    }
                  />
                </>
              )}

              {activeTab === "sgb" && (
                <>
                  <input
                    className="input"
                    placeholder="Bond Name"
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />

                  <input
                    className="input"
                    placeholder="Invested Amount"
                    type="number"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        investedAmount: Number(e.target.value),
                      })
                    }
                  />

                  <input
                    className="input"
                    placeholder="Current Value"
                    type="number"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        currentValue: Number(e.target.value),
                      })
                    }
                  />
                </>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={addHolding}
                  className="px-5 py-2 bg-indigo-600 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
