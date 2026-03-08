import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";
import api from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {

  const [netWorth, setNetWorth] = useState(0);
  const [riskLevel, setRiskLevel] = useState("");
  const [bestAsset, setBestAsset] = useState("");
  const [healthScore, setHealthScore] = useState(0);

  const [allocation, setAllocation] = useState({
    equity: 0,
    gold: 0,
    debt: 0,
    crypto: 0
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {

        const res = await api.get("/api/dashboard");

        setNetWorth(res.data.netWorth);
        setRiskLevel(res.data.riskLevel);
        setBestAsset(res.data.bestAsset);
        setHealthScore(res.data.healthScore);
        setAllocation(res.data.allocation);

      } catch (error) {
        console.error("Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, []);

  const chartData = [
    { name: "Equity", value: allocation.equity },
    { name: "Gold", value: allocation.gold },
    { name: "Debt", value: allocation.debt },
    { name: "Crypto", value: allocation.crypto }
  ];

  const COLORS = [
    "#6366f1",
    "#facc15",
    "#22c55e",
    "#ec4899"
  ];

  return (

    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-8">
        Wealth Dashboard
      </h1>

      {/* TOP CARDS */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">

          <h2 className="text-sm text-white/60">
            Net Worth
          </h2>

          <p className="text-2xl font-bold mt-2">
            ₹ {netWorth.toLocaleString("en-IN")}
          </p>

        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">

          <h2 className="text-sm text-white/60">
            Risk Level
          </h2>

          <p className="text-2xl font-bold mt-2 text-yellow-400">
            {riskLevel}
          </p>

        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">

          <h2 className="text-sm text-white/60">
            Best Performing Asset
          </h2>

          <p className="text-2xl font-bold mt-2 text-green-400">
            {bestAsset}
          </p>

        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">

          <h2 className="text-sm text-white/60">
            Financial Health Score
          </h2>

          <p className="text-2xl font-bold mt-2 text-indigo-400">
            {healthScore} / 100
          </p>

        </div>

      </div>


      {/* PORTFOLIO ALLOCATION */}

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 mb-10">

        <h2 className="text-lg font-semibold mb-6">
          Portfolio Allocation
        </h2>

        <div className="h-[320px]">

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={5}
              >

                {chartData.map((_, index) => (

                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* AI INSIGHT PANEL */}

      <div className="bg-indigo-500/10 border border-indigo-400/20 p-6 rounded-xl">

        <h2 className="font-semibold mb-2">
          AI Wealth Insight
        </h2>

        <p className="text-white/70">

          Your portfolio allocation suggests a
          <span className="text-yellow-400 font-semibold">
            {" "} {riskLevel} {" "}
          </span>

          risk profile. Consider balancing equity
          and defensive assets like gold or bonds
          to maintain long-term stability.

        </p>

      </div>

    </DashboardLayout>

  );

}