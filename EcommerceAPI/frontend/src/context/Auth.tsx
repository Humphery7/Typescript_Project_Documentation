import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "../api";
import type { User } from "../types";
import { useToast } from "./Toast";

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

function expired(token: string) {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" && exp * 1000 < Date.now();
  } catch { return true; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(() => {
    const t = tokenStore.get();
    const raw = localStorage.getItem("sr_user");
    if (!t || !raw || expired(t)) { tokenStore.clear(); localStorage.removeItem("sr_user"); return null; }
    return JSON.parse(raw);
  });

  const logout = useCallback(() => {
    tokenStore.clear(); localStorage.removeItem("sr_user"); setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ user: User; token: string }>("/auth/login", { method: "POST", body: { email, password } });
    tokenStore.set(r.token);
    localStorage.setItem("sr_user", JSON.stringify(r.user));
    setUser(r.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await api("/auth/signup", { method: "POST", body: { name, email, password } });
    await login(email, password);
  }, [login]);

  useEffect(() => {
    const h = () => { logout(); toast("Your session ended. Log in again to continue.", "bad"); };
    window.addEventListener("sr:unauthorized", h);
    return () => window.removeEventListener("sr:unauthorized", h);
  }, [logout, toast]);

  return <Ctx.Provider value={{ user, login, signup, logout }}>{children}</Ctx.Provider>;
}
