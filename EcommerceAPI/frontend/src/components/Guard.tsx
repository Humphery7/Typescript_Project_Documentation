import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth";
import type { ReactNode } from "react";

export default function Guard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const loc = useLocation();
  return user ? <>{children}</> : <Navigate to="/login" state={{ from: loc.pathname }} replace />;
}
