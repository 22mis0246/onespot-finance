import DashboardLayout from "../layouts/DashboardLayout";
import { Link } from "react-router-dom";

export default function Investments() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8 text-white">
        Investments Overview
      </h1>

      <div className="grid grid-cols-2 gap-8">

        {/* Indian Equity */}
        <Link
          to="/investments/indian-equity"
          className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 hover:scale-105 transition"
        >
          <h2 className="text-xl font-semibold text-indigo-400 mb-3">
            Indian Equity
          </h2>
          <p className="text-white/70">
            Stocks, Mutual Funds, ETFs
          </p>
        </Link>

        {/* Global Equity */}
       <Link to="/investments/global-equity">
  <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 hover:bg-white/20 transition cursor-pointer">
    <h2 className="text-xl font-semibold text-green-400 mb-2">
      Global Equity
    </h2>
    <p className="text-white/70">
      US Stocks, International Funds
    </p>
  </div>
</Link>

{/* Gold & Silver */}
<Link
  to="/investments/gold-silver"
  className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 hover:scale-105 transition"
>
  <h2 className="text-xl font-semibold text-yellow-400 mb-3">
    Gold & Silver
  </h2>
  <p className="text-white/70">
    Physical, ETF, Sovereign Gold Bonds
  </p>
</Link>

{/* Crypto */}
<Link
  to="/investments/crypto"
  className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 hover:scale-105 transition"
>
  <h2 className="text-xl font-semibold text-purple-400 mb-3">
    Crypto
  </h2>
  <p className="text-white/70">
    Bitcoin, Ethereum, Altcoins
  </p>
</Link>


      </div>
    </DashboardLayout>
  );
}
