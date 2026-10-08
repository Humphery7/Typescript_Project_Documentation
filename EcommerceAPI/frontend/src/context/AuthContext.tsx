import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, configureApi } from "../lib/api";
import { tokenExpiry } from "../lib/jwt";
import type { User } from "../lib/types";

interface Session {
  token: string;
  user: User;
}

interface AuthApi {
  user: User | null;
  notice: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: (reason?: string) => void;
}

const STORAGE_KEY = "storefront.session";
const EXPIRED = "Your session expired. Sign in again.";

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    const exp = tokenExpiry(session.token);
    if (!exp || exp <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable (private mode); the session just won't survive a reload */
  }
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);
  const [notice, setNotice] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(session?.token ?? null);

  const logout = useCallback((reason?: string) => {
    tokenRef.current = null;
    writeSession(null);
    setSession(null);
    setNotice(reason ?? null);
  }, []);

  // Layout effects run before any child's useEffect, so the API client is
  // wired up before the bag fetches on first load.
  useLayoutEffect(() => {
    configureApi({
      getToken: () => tokenRef.current,
      onUnauthorized: () => logout(EXPIRED),
    });
  }, [logout]);

  // JWTs from this backend last one hour: sign out when the token runs out.
  useEffect(() => {
    if (!session) return;
    const exp = tokenExpiry(session.token);
    if (!exp) return;
    const remaining = exp - Date.now();
    if (remaining <= 0) {
      logout(EXPIRED);
      return;
    }
    const id = window.setTimeout(() => logout(EXPIRED), Math.min(remaining, 2 ** 31 - 1));
    return () => window.clearTimeout(id);
  }, [session, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    tokenRef.current = res.token;
    const next = { token: res.token, user: res.user };
    writeSession(next);
    setSession(next);
    setNotice(null);
  }, []);

  // The backend's signup doesn't return a token, so sign in right after.
  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      await api.signup(name, email, password);
      await login(email, password);
    },
    [login],
  );

  const value = useMemo<AuthApi>(
    () => ({ user: session?.user ?? null, notice, login, signup, logout }),
    [session, notice, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
