import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return (
      <Navigate
        to="/account"
        replace
        state={{ from: location.pathname + location.search, notice: "Sign in to continue." }}
      />
    );
  }
  return <>{children}</>;
}
