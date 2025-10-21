// pages/Login.jsx
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ⬇️ expects these in your .env (Vite):
// VITE_SUPABASE_URL=https://noaluqpffmzdnbrkfipl.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYWx1cXBmZm16ZG5icmtmaXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDg1MDUsImV4cCI6MjA3NTUyNDUwNX0.IAfUP4frwcTOMjk8jAdcywvatjkUGLYViCcipydFhHM
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);      // success or error text
  const [isError, setIsError] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMsg(null);
    setIsError(false);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setIsError(true);
      setMsg(error.message || "Unable to sign in.");
      return;
    }
    // logged in
    setMsg("Success! You’re in.");
    // TODO: navigate to your app page (e.g., /home) if you’re using React Router
    // navigate("/");  <- useNavigate() if you want
  }

  async function handleForgot() {
    const target = email.trim();
    if (!target) {
      setIsError(true);
      setMsg("Type your email first, then click forgot password.");
      return;
    }
    setMsg(null);
    setIsError(false);
    setLoading(true);
    // Set YOUR app URL below; must be whitelisted in Supabase Auth > URL Configuration
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.resetPasswordForEmail(target, { redirectTo });
    setLoading(false);
    if (error) {
      setIsError(true);
      setMsg(error.message || "Could not send reset email.");
    } else {
      setMsg("Reset link sent. Check your email.");
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* top bar */}
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <div className="text-2xl font-bold">name</div>
        <button aria-label="menu" className="flex h-6 w-7 flex-col justify-between">
          <span className="h-[3px] w-full bg-neutral-900 rounded-sm" />
          <span className="h-[3px] w-full bg-neutral-900 rounded-sm" />
          <span className="h-[3px] w-full bg-neutral-900 rounded-sm" />
        </button>
      </header>

      {/* main */}
      <main className="mx-auto max-w-[560px] px-4 pt-16 text-center">
        <h1 className="font-serif text-[64px] font-bold leading-none">Log in</h1>

        {/* status message */}
        {msg && (
          <p
            className={`mt-4 text-[16px] ${
              isError ? "text-red-600" : "text-green-700"
            }`}
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleLogin} className="mt-6 grid justify-items-center gap-5">
          <label className="grid w-full max-w-[520px] grid-cols-[120px_1fr] items-center gap-4 text-[22px]">
            <span>Email:</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-7 w-[320px] rounded-none border border-neutral-300 bg-neutral-300/80 px-2 text-base outline-none"
              required
            />
          </label>

          <label className="grid w-full max-w-[520px] grid-cols-[120px_1fr] items-center gap-4 text-[22px]">
            <span>Password:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="h-7 w-[320px] rounded-none border border-neutral-300 bg-neutral-300/80 px-2 text-base outline-none"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-none border border-neutral-400 bg-neutral-300 px-4 py-1 text-[20px] disabled:opacity-50"
          >
            {loading ? "…" : "enter"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleForgot}
          className="mt-6 block text-[16px] underline-offset-2 hover:underline mx-auto"
          disabled={loading}
        >
          Forgot your password? click here
        </button>
      </main>
    </div>
  );
}
