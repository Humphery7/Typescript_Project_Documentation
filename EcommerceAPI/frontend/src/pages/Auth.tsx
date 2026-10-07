import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, login, signup } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/";
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";
  if (user) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr("");
    if (isSignup && f.password.length < 8) return setErr("Use a password with at least 8 characters.");
    setBusy(true);
    try { isSignup ? await signup(f.name.trim(), f.email.trim(), f.password) : await login(f.email.trim(), f.password); nav(from, { replace: true }); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <h1>{isSignup ? "Create your account" : "Log in"}</h1>
      <p className="muted">{isSignup ? "You need an account to fill a bag and check out." : "Welcome back. Your bag is waiting."}</p>
      <form onSubmit={submit} className="form">
        {isSignup && <label>Name<input required maxLength={50} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>}
        <label>Email<input required type="email" maxLength={50} autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Password<input required type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {err && <p className="notice bad" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? "One moment…" : isSignup ? "Create account" : "Log in"}</button>
      </form>
      <p className="muted">{isSignup ? <>Already have an account? <Link to="/login" state={{ from }}>Log in</Link></> : <>New here? <Link to="/signup" state={{ from }}>Create an account</Link></>}</p>
    </div>
  );
}
