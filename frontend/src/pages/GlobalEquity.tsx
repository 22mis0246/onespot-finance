import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

interface StockHolding {
  name: string;
  avgPrice: number;
  quantity: number;
  currentPrice: number;
}

interface FundHolding {
  name: string;
  invested: number;
  current: number;
}

export default function GlobalEquity() {
  const [activeTab, setActiveTab] = useState<"stocks" | "mutual" | "etf">("stocks");

  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [mutualFunds, setMutualFunds] = useState<FundHolding[]>([]);
  const [etfs, setEtfs] = useState<StockHolding[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const addHolding = () => {
    if (!form.name) return;

    if (activeTab === "stocks") {
      setStocks([
        ...stocks,
        {
          name: form.name,
          avgPrice: Number(form.avgPrice),
          quantity: Number(form.quantity),
          currentPrice: Number(form.currentPrice),
        },
      ]);
    }

    if (activeTab === "mutual") {
      setMutualFunds([
        ...mutualFunds,
        {
          name: form.name,
          invested: Number(form.invested),
          current: Number(form.current),
        },
      ]);
    }

    if (activeTab === "etf") {
      setEtfs([
        ...etfs,
        {
          name: form.name,
          avgPrice: Number(form.avgPrice),
          quantity: Number(form.quantity),
          currentPrice: Number(form.currentPrice),
        },
      ]);
    }

    setForm({});
    setShowModal(false);
  };

  const deleteItem = (index: number) => {
    if (activeTab === "stocks") setStocks(stocks.filter((_, i) => i !== index));
    if (activeTab === "mutual") setMutualFunds(mutualFunds.filter((_, i) => i !== index));
    if (activeTab === "etf") setEtfs(etfs.filter((_, i) => i !== index));
  };

  const currentData =
    activeTab === "stocks"
      ? stocks
      : activeTab === "mutual"
      ? mutualFunds
      : etfs;

  let totalInvested = 0;
  let totalCurrent = 0;

  if (activeTab === "stocks" || activeTab === "etf") {
    totalInvested = (currentData as StockHolding[]).reduce(
      (sum, h) => sum + h.avgPrice * h.quantity,
      0
    );

    totalCurrent = (currentData as StockHolding[]).reduce(
      (sum, h) => sum + h.currentPrice * h.quantity,
      0
    );
  }

  if (activeTab === "mutual") {
    totalInvested = (currentData as FundHolding[]).reduce(
      (sum, f) => sum + f.invested,
      0
    );

    totalCurrent = (currentData as FundHolding[]).reduce(
      (sum, f) => sum + f.current,
      0
    );
  }

  const totalGainLoss = totalCurrent - totalInvested;

  return (
    <DashboardLayout>
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Global Equity</h1>

        {/* Tabs */}
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

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <p className="text-sm text-white/60">Total Invested</p>
            <h2 className="text-2xl font-bold">$ {totalInvested}</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <p className="text-sm text-white/60">Current Value</p>
            <h2 className="text-2xl font-bold">$ {totalCurrent}</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <p className="text-sm text-white/60">Total Gain / Loss</p>
            <h2
              className={`text-2xl font-bold ${
                totalGainLoss >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              $ {totalGainLoss}
            </h2>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
        >
          + Add {activeTab === "stocks"
            ? "Stock"
            : activeTab === "mutual"
            ? "Mutual Fund"
            : "ETF"}
        </button>

        {/* List */}
        <div className="grid gap-4">
          {currentData.map((item: any, index) => {
            const invested =
              activeTab === "mutual"
                ? item.invested
                : item.avgPrice * item.quantity;

            const current =
              activeTab === "mutual"
                ? item.current
                : item.currentPrice * item.quantity;

            const pnl = current - invested;

            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 flex justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>

                  {activeTab === "mutual" ? (
                    <p className="text-sm text-white/60">
                      Invested ${item.invested}
                    </p>
                  ) : (
                    <p className="text-sm text-white/60">
                      Avg ${item.avgPrice} | Qty {item.quantity}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p>Value: ${current}</p>
                  <p
                    className={
                      pnl >= 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {pnl >= 0 ? "+" : ""}${pnl}
                  </p>

                  <button
                    onClick={() => deleteItem(index)}
                    className="text-red-400 text-sm mt-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal (same logic as Indian) */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-2xl w-[400px] border border-white/20">
              <h2 className="text-xl font-bold mb-6">
                Add {activeTab === "stocks"
                  ? "Stock"
                  : activeTab === "mutual"
                  ? "Mutual Fund"
                  : "ETF"}
              </h2>

              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4"
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              {activeTab === "mutual" ? (
                <>
                  <input
                    type="number"
                    placeholder="Invested Amount ($)"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4"
                    onChange={(e) =>
                      setForm({ ...form, invested: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Current Amount ($)"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4"
                    onChange={(e) =>
                      setForm({ ...form, current: e.target.value })
                    }
                  />
                </>
              ) : (
                <>
                  <input
                    type="number"
                    placeholder="Average Price ($)"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4"
                    onChange={(e) =>
                      setForm({ ...form, avgPrice: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4"
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Current Price ($)"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4"
                    onChange={(e) =>
                      setForm({ ...form, currentPrice: e.target.value })
                    }
                  />
                </>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={addHolding}
                  className="px-5 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
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
