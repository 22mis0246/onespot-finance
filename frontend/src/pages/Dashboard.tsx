import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {

  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {
    const fetchNetWorth = async () => {
      try {
        const res = await api.get("/api/dashboard/networth");
        setNetWorth(res.data.netWorth);
      } catch (error) {
        console.error("Failed to fetch net worth");
      }
    };

    fetchNetWorth();
  }, []);

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-8">Wealth Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
          <h2 className="text-sm text-white/60">Net Worth</h2>
          <p className="text-2xl font-bold mt-2">
            ₹ {netWorth.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
          <h2 className="text-sm text-white/60">Risk Level</h2>
          <p className="text-2xl font-bold mt-2 text-yellow-400">Moderate</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
          <h2 className="text-sm text-white/60">Best Performing Asset</h2>
          <p className="text-2xl font-bold mt-2 text-green-400">Indian Equity</p>
        </div>

      </div>

      {/* AI Insight Panel */}
      <div className="bg-indigo-500/10 border border-indigo-400/20 p-6 rounded-xl">
        <h2 className="font-semibold mb-2">AI Wealth Insight</h2>
        <p className="text-white/70">
          Your portfolio is 60% equity-heavy. Consider diversifying into bonds for better downside protection.
        </p>
      </div>

    </DashboardLayout>
  );
}