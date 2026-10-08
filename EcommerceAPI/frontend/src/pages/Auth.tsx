import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTitle } from "../hooks";
import { errorMessage } from "../lib/api";

export default function AuthPage() {
  const { user, login, signup, notice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const state = (location.state ?? {}) as { from?: string; notice?: string };

  const mode = params.get("mode") === "signup" ? "signup" : "signin";
  useTitle(mode === "signup" ? "Create account" : "Sign in");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate(state.from ?? "/", { replace: true });
  }, [user, navigate, state.from]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") await signup(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setError(null);
    setParams(mode === "signup" ? {} : { mode: "signup" }, { replace: true, state: location.state });
  }

  const message = state.notice ?? notice;

  return (
    <div className="auth">
      <h1 className="page-title">{mode === "signup" ? "Create your account" : "Sign in"}</h1>
      <p className="auth__lede">
        {mode === "signup"
          ? "An account keeps your bag and your order history in one place."
          : "Welcome back. Your bag and orders are waiting."}
      </p>

      {message && <p className="notice">{message}</p>}

      <form className="form" onSubmit={onSubmit}>
        {mode === "signup" && (
          <div className="field">
            <label htmlFor="auth-name">Name</label>
            <input
              id="auth-name"
              autoComplete="name"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            maxLength={50}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={mode === "signup" ? "auth-password-hint" : undefined}
          />
          {mode === "signup" && (
            <p className="field__hint" id="auth-password-hint">
              At least 8 characters.
            </p>
          )}
        </div>

        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--solid btn--block" disabled={busy}>
          {busy ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="form__alt">
        {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
        <button type="button" className="linkbtn" onClick={switchMode}>
          {mode === "signup" ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
