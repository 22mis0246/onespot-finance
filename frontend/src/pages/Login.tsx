import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      // Save JWT token
      localStorage.setItem("token", res.data.token);

      // not OPTIONAL: Save user data if backend sends it
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // Go to dashboard
      navigate("/dashboard");

    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-900 px-4">

  {/* Motivational Quote */}
  <div className="mb-10 max-w-2xl text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-8 py-6 shadow-xl">
    <p className="text-white/80 text-lg md:text-xl font-light tracking-wide italic">
      “Compounding is the eighth wonder of the world.”
    </p>
  </div>


      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl border border-white/20 w-full max-w-md shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          OneSpot Finance
        </h1>

        <p className="text-center text-white/60 text-sm mb-8">
          Manage your Finance in one place
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full mb-4 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="w-full mb-6 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 p-3 rounded-lg font-semibold shadow-lg disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <p className="text-white/60 text-sm mt-6 text-center">
  Don't have an account?{" "}
  <Link to="/register" className="text-indigo-400 hover:underline">
    Sign Up
  </Link>
</p>
      </form>
    </div>
  );
}
