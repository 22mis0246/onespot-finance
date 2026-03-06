import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

/* =========================================================
   INVESTMENT INTERFACE
========================================================= */
interface Investment {
  id?: number;                 // DB ID
  name: string;
  avgPrice: number;
  quantity: number;
  currentPrice: number;
  change?: number;
  changePercent?: number;
  type: "stocks" | "mutual" | "etf";
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function IndianEquity() {

  /* ---------------- TAB CONTROL ---------------- */
  const [activeTab, setActiveTab] =
    useState<"stocks" | "mutual" | "etf">("stocks");

  /* ---------------- STATE STORAGE ---------------- */
  const [investments, setInvestments] = useState<Investment[]>([]);

  /* ---------------- MODAL CONTROL ---------------- */
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Investment | null>(null);

  /* ---------------- FORM STATE ---------------- */
  const [form, setForm] = useState({
    name: "",
    avgPrice: "",
    quantity: "",
    currentPrice: "",
  });
/* =========================================================
   LOAD INVESTMENTS + REFRESH LIVE PRICES
========================================================= */
useEffect(() => {
  fetchInvestments();

  const interval = setInterval(() => {
    fetchInvestments();
  }, 60000); // refresh every 60 seconds

  return () => clearInterval(interval);
}, []);

const fetchInvestments = async () => {
  try {
    const res = await api.get("/api/investments");

    const list = res.data;

    // refresh stock prices
    const updated = await Promise.all(
      list.map(async (item: Investment) => {

        if (item.type !== "stocks") return item;

        try {
          const priceRes = await api.get(`/api/stock/${item.name}`);

          return {
            ...item,
            currentPrice: priceRes.data.price
          };

        } catch {
          return item;
        }

      })
    );

    setInvestments(updated);

  } catch (err) {
    console.error("Failed to fetch investments");
  }
};
  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */
  const formatCurrency = (value: number) =>
    value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* =========================================================
     FETCH LIVE PRICE
  ========================================================= */
const fetchLivePrice = async (symbol: string) => {
  try {
    const response = await api.get(`/api/stock/${symbol}`);
    return response.data;
  } catch (err) {
    console.error("Price fetch failed", err);
    alert("Error fetching stock price");
    return null;
  }
};
  /* =========================================================
     FILTER BY TAB
  ========================================================= */
  const currentList = investments.filter(
    (i) => i.type === activeTab
  );

  /* =========================================================
     ADD OR UPDATE (CONNECTED TO BACKEND)
  ========================================================= */
  const addOrUpdate = async () => {

    if (!form.name || !form.avgPrice || !form.quantity) {
      alert("Fill required fields");
      return;
    }

    let currentPriceNumber = 0;
    

    if (activeTab === "stocks") {
      const live = await fetchLivePrice(form.name.toUpperCase());
      if (!live) return;

      currentPriceNumber = live.price;
      
    } else {
      if (!form.currentPrice) {
        alert("Enter current price");
        return;
      }
      currentPriceNumber = Number(form.currentPrice);
    }

    const payload = {
      name: form.name.toUpperCase(),
      avgPrice: Number(form.avgPrice),
      quantity: Number(form.quantity),
      currentPrice: currentPriceNumber,
      type: activeTab,
    };

    try {

      if (editingItem) {
        await api.put(`/api/investments/${editingItem.id}`, payload);
      } else {
        await api.post("/api/investments", payload);
      }

      await fetchInvestments();

      setForm({ name: "", avgPrice: "", quantity: "", currentPrice: "" });
      setEditingItem(null);
      setShowModal(false);

    } catch (err) {
      console.error("Save failed");
    }
  };

  /* =========================================================
     DELETE FROM BACKEND
  ========================================================= */
  const deleteItem = async (id?: number) => {
    if (!id) return;

    try {
      await api.delete(`/api/investments/${id}`);
      await fetchInvestments();
    } catch {
      console.error("Delete failed");
    }
  };

  /* =========================================================
     EDIT ITEM
  ========================================================= */
  const editItem = (item: Investment) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      avgPrice: item.avgPrice.toString(),
      quantity: item.quantity.toString(),
      currentPrice: item.currentPrice.toString(),
    });
    setShowModal(true);
  };

  /* =========================================================
     CALCULATIONS
  ========================================================= */
  const totalInvested = currentList.reduce(
    (sum, i) => sum + i.avgPrice * i.quantity,
    0
  );

  const totalCurrent = currentList.reduce(
    (sum, i) => sum + i.currentPrice * i.quantity,
    0
  );

  const totalPnL = totalCurrent - totalInvested;

  /* =========================================================
     UI
  ========================================================= */
  return (
    <DashboardLayout>
      <div className="p-8 text-white">

        <h1 className="text-3xl font-bold mb-6">Indian Equity</h1>

        {/* ---------------- TABS ---------------- */}
        <div className="flex gap-4 mb-8">
          {["stocks", "mutual", "etf"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2 rounded-lg transition ${
                activeTab === tab
                  ? "bg-indigo-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {tab === "stocks"
                ? "Stocks"
                : tab === "mutual"
                ? "Mutual Funds"
                : "ETFs"}
            </button>
          ))}
        </div>

        {/* ---------------- SUMMARY ---------------- */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 p-6 rounded-xl">
            <p>Total Invested</p>
            <h2>₹ {formatCurrency(totalInvested)}</h2>
          </div>
          <div className="bg-white/10 p-6 rounded-xl">
            <p>Current Value</p>
            <h2>₹ {formatCurrency(totalCurrent)}</h2>
          </div>
          <div className="bg-white/10 p-6 rounded-xl">
            <p>Gain / Loss</p>
            <h2 className={totalPnL >= 0 ? "text-green-400" : "text-red-400"}>
              ₹ {formatCurrency(totalPnL)}
            </h2>
          </div>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 px-6 py-3 bg-indigo-600 rounded-lg"
        >
          + Add Investment
        </button>

        {/* LIST */}
        <div className="grid gap-4">
          {currentList.map((item) => {

            const invested = item.avgPrice * item.quantity;
            const current = item.currentPrice * item.quantity;
            const pnl = current - invested;

            return (
              <div
                key={item.id}
                className="bg-white/10 p-5 rounded-xl flex justify-between"
              >
                <div>
                  <h3>{item.name}</h3>
                  <p>Avg ₹{formatCurrency(item.avgPrice)} | Qty {item.quantity}</p>
                  <p className="text-indigo-400 font-medium">
  Live ₹{formatCurrency(item.currentPrice)}
</p>

                </div>

                <div className="text-right">
                  <p>Value: ₹{formatCurrency(current)}</p>
                  <p className={pnl >= 0 ? "text-green-400" : "text-red-400"}>
                    ₹{formatCurrency(pnl)}
                  </p>

                  <div className="flex gap-4 mt-2 justify-end">
                    <button
                      onClick={() => editItem(item)}
                      className="text-yellow-400 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-400 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-2xl w-[400px]">

              <h2 className="text-xl font-bold mb-6">
                {editingItem ? "Edit" : "Add"} Investment
              </h2>

              <input
                type="text"
                placeholder="Ticker Symbol (Eg: INFY)"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Average Price"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.avgPrice}
                onChange={(e) =>
                  setForm({ ...form, avgPrice: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Quantity"
                className="w-full p-3 mb-4 bg-white/10 rounded-lg"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />

              {activeTab !== "stocks" && (
                <input
                  type="number"
                  placeholder="Current Price"
                  className="w-full p-3 mb-6 bg-white/10 rounded-lg"
                  value={form.currentPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currentPrice: e.target.value,
                    })
                  }
                />
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-5 py-2 bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={addOrUpdate}
                  className="px-5 py-2 bg-indigo-600 rounded-lg"
                >
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
