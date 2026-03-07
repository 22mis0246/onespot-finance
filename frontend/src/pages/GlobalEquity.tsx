import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

/*
=========================================
TYPE DEFINITIONS
=========================================
*/

type StockHolding = {
  id?: number;
  name: string;
  avgPrice: number;
  quantity: number;
  currentPrice: number;
};

type FundHolding = {
  id?: number;
  name: string;
  invested: number;
  current: number;
};

export default function GlobalEquity() {

  /*
  =========================================
  PAGE STATE
  =========================================
  */

  const [activeTab, setActiveTab] = useState<"stocks" | "mutual" | "etf">("stocks");

  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [mutualFunds, setMutualFunds] = useState<FundHolding[]>([]);
  const [etfs, setEtfs] = useState<StockHolding[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const [editingId, setEditingId] = useState<number | null>(null);

  /*
  =========================================
  FETCH INVESTMENTS FROM DATABASE
  =========================================
  */

  useEffect(() => {

    const fetchInvestments = async () => {

      try {

        const res = await api.get("/api/investments");

        /*
        FILTER GLOBAL EQUITY DATA
        */

        const stockData = res.data
          .filter((inv: any) => inv.type === "global_stock")
          .map((inv: any) => ({
            id: inv.id,
            name: inv.name,
            avgPrice: inv.avgPrice,
            quantity: inv.quantity,
            currentPrice: inv.currentPrice
          }));

        const mutualData = res.data
          .filter((inv: any) => inv.type === "global_mutual")
          .map((inv: any) => ({
            id: inv.id,
            name: inv.name,
            invested: inv.avgPrice,
            current: inv.currentPrice
          }));

        const etfData = res.data
          .filter((inv: any) => inv.type === "global_etf")
          .map((inv: any) => ({
            id: inv.id,
            name: inv.name,
            avgPrice: inv.avgPrice,
            quantity: inv.quantity,
            currentPrice: inv.currentPrice
          }));

        setStocks(stockData);
        setMutualFunds(mutualData);
        setEtfs(etfData);

      } catch (err) {
        console.error(err);
      }
    };

    fetchInvestments();

  }, []);

  /*
  =========================================
  ADD OR UPDATE HOLDING
  =========================================
  */

  const addHolding = async () => {

    try {

      let payload: any = {};

      if (activeTab === "stocks") {
        payload = {
          name: form.name,
          type: "global_stock",
          avgPrice: Number(form.avgPrice),
          quantity: Number(form.quantity),
          currentPrice: Number(form.currentPrice)
        };
      }

      if (activeTab === "mutual") {
        payload = {
          name: form.name,
          type: "global_mutual",
          avgPrice: Number(form.invested),
          quantity: 1,
          currentPrice: Number(form.current)
        };
      }

      if (activeTab === "etf") {
        payload = {
          name: form.name,
          type: "global_etf",
          avgPrice: Number(form.avgPrice),
          quantity: Number(form.quantity),
          currentPrice: Number(form.currentPrice)
        };
      }

      /*
      EDIT OR CREATE
      */

      if (editingId) {
        await api.put(`/api/investments/${editingId}`, payload);
      } else {
        await api.post("/api/investments", payload);
      }

      window.location.reload();

    } catch (err) {
      console.error(err);
    }
  };

  /*
  =========================================
  DELETE HOLDING
  =========================================
  */

  const deleteHolding = async (id: number) => {

    try {

      await api.delete(`/api/investments/${id}`);

      setStocks(prev => prev.filter(h => h.id !== id));
      setMutualFunds(prev => prev.filter(h => h.id !== id));
      setEtfs(prev => prev.filter(h => h.id !== id));

    } catch (err) {
      console.error(err);
    }
  };

  /*
  =========================================
  CALCULATE TOTALS
  =========================================
  */

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

  const pnl = totalCurrent - totalInvested;

  /*
  =========================================
  UI
  =========================================
  */

  return (

    <DashboardLayout>

      <div className="p-8 text-white">

        <h1 className="text-3xl font-bold mb-6">
          Global Equity
        </h1>

        {/* TABS */}

        <div className="flex gap-4 mb-8">

          {["stocks","mutual","etf"].map((tab)=>(
            <button
              key={tab}
              onClick={()=>setActiveTab(tab as any)}
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

        {/* SUMMARY CARDS */}

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="glass-card p-6">
            <p className="text-sm text-white/60">Total Invested</p>
            <h2 className="text-2xl font-bold">$ {totalInvested}</h2>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-white/60">Current Value</p>
            <h2 className="text-2xl font-bold">$ {totalCurrent}</h2>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-white/60">Gain / Loss</p>
            <h2 className={`text-2xl font-bold ${pnl >= 0 ? "text-green-400":"text-red-400"}`}>
              $ {pnl}
            </h2>
          </div>

        </div>

        {/* ADD BUTTON */}

        <button
          onClick={()=>setShowModal(true)}
          className="mb-6 px-6 py-3 bg-indigo-600 rounded-lg"
        >
          + Add Holding
        </button>

        {/* HOLDINGS LIST */}

        <div className="grid gap-4">

          {currentData.map((h:any)=>{

            const invested =
              activeTab === "mutual"
                ? h.invested
                : h.avgPrice * h.quantity;

            const current =
              activeTab === "mutual"
                ? h.current
                : h.currentPrice * h.quantity;

            const gain = current - invested;

            return(

              <div
                key={h.id}
                className="glass-card p-6 flex justify-between items-center"
              >

                {/* LEFT */}

                <div>

                  <h3 className="text-lg font-semibold">
                    {h.name}
                  </h3>

                  {activeTab === "mutual" ? (

                    <p className="text-white/70 text-sm">
                      Invested $ {h.invested}
                    </p>

                  ) : (

                    <p className="text-white/70 text-sm">
                      Avg $ {h.avgPrice} | Qty {h.quantity}
                    </p>

                  )}

                </div>

                {/* RIGHT */}

                <div className="text-right">

                  <p>Value: $ {current}</p>

                  <p className={gain>=0?"text-green-400":"text-red-400"}>
                    {gain>=0?"+":""}$ {gain}
                  </p>

                  <div className="flex gap-3 justify-end text-sm mt-1">

                    <button
                      onClick={()=>{
                        setForm(h);
                        setEditingId(h.id);
                        setShowModal(true);
                      }}
                      className="text-yellow-400"
                    >
                      Edit
                    </button>

                    <button
                      onClick={()=>deleteHolding(h.id)}
                      className="text-red-400"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            )

          })}

        </div>

      </div>

    </DashboardLayout>

  );

}