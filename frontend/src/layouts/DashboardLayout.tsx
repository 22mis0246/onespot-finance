import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // remove token if stored
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen backdrop-blur-xl">

      {/* Sidebar */}
      <div className="w-64 bg-white/10 backdrop-blur-md border-r border-white/20 p-6 shadow-xl flex flex-col justify-between">

        {/* TOP SECTION */}
        <div>
          <h2 className="text-2xl font-bold text-indigo-400 mb-10">
            OneSpot Finance
          </h2>

          <nav className="flex flex-col gap-4 text-white/80">

            <Link
              className="hover:text-indigo-400 transition"
              to="/dashboard"
            >
              Dashboard
            </Link>

            <Link
              className="hover:text-indigo-400 transition"
              to="/investments"
            >
              Investments
            </Link>

            <Link
              className="hover:text-indigo-400 transition"
              to="/expenses"
            >
              Expenses
            </Link>

            <Link
              className="hover:text-indigo-400 transition"
              to="/liabilities"
            >
              Liabilities
            </Link>
            <Link
  className="hover:text-indigo-400 transition"
  to="/goals"
>
  Goals
</Link>


          </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-10 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-500 transition w-full text-left"
          >
            Logout
          </button>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        {children}
      </div>

    </div>
  );
}
