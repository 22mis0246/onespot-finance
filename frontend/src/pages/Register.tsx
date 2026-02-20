import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        fullName,
        email,
        password,
      });

      navigate("/"); // go back to login

    } catch (err: any) {
      console.error(err);
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl border border-white/20 w-full max-w-md shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          required
          className="w-full mb-4 p-3 rounded-lg bg-white/10 border border-white/20 text-white"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full mb-4 p-3 rounded-lg bg-white/10 border border-white/20 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="w-full mb-6 p-3 rounded-lg bg-white/10 border border-white/20 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-white/60 text-sm mt-6 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}