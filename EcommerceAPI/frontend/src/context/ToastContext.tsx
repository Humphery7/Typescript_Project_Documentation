import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface ToastOptions {
  tone?: "info" | "error";
  action?: { label: string; to: string };
}

interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

interface ToastApi {
  push: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-2), { id, message, ...options }]);
      window.setTimeout(() => dismiss(id), options.tone === "error" ? 6000 : 3500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast${t.tone === "error" ? " toast--error" : ""}`}>
            <span>{t.message}</span>
            {t.action && (
              <Link to={t.action.to} onClick={() => dismiss(t.id)}>
                {t.action.label}
              </Link>
            )}
            <button type="button" aria-label="Dismiss message" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
