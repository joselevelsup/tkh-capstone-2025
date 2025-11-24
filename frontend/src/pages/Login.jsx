// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../supabaseClient"; // from src/pages -> src/supabaseClient.js

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setMsg(null);
    setIsError(false);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setIsError(true);
      setMsg(error.message || "Unable to sign in.");
      return;
    }

    setMsg("Success! You’re in.");
    setTimeout(() => navigate("/"), 1200);
  }

  async function handleForgot() {
    const target = email.trim();
    if (!target) {
      setIsError(true);
      setMsg("Type your email first, then click forgot password.");
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.resetPasswordForEmail(target, { redirectTo });

    if (error) {
      setIsError(true);
      setMsg(error.message || "Could not send reset email.");
    } else {
      setMsg("Reset link sent. Check your email.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fefbfb] font-serif text-[#213547] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#eadede] bg-white/80 p-10 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <h1 className="mb-6 text-center text-4xl font-bold leading-tight">
          Log in to continue your{" "}
          <span className="rounded-md bg-[#e8caca]/60 px-2">Journaling</span>
        </h1>

        {msg && (
          <p
            className={`mb-4 text-center text-sm ${
              isError ? "text-red-600" : "text-green-700"
            }`}
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <label className="flex flex-col text-sm font-semibold">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 rounded-md border border-neutral-300 bg-neutral-100 px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-[#b87d7d]"
            />
          </label>

          <label className="flex flex-col text-sm font-semibold">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 rounded-md border border-neutral-300 bg-neutral-100 px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-[#b87d7d]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-[#b87d7d]/90 py-2 font-bold text-white transition hover:bg-[#a06d6d] disabled:opacity-60"
          >
            {loading ? "..." : "Login"}
          </button>
        </form>

        <button
          onClick={handleForgot}
          className="mt-5 w-full text-sm text-[#b87d7d] underline-offset-2 hover:underline"
        >
          Forgot your password?
        </button>

        <p className="mt-6 text-center text-sm">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-[#b87d7d] hover:underline">
            Sign up
          </Link>{" "}
          to start your journey 🌸
        </p>
      </div>
    </div>
  );
}
