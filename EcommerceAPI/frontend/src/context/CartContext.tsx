import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, errorMessage } from "../lib/api";
import type { Cart } from "../lib/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface CartApi {
  cart: Cart | null;
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<boolean>;
  setQuantity: (productId: string, quantity: number) => Promise<boolean>;
  remove: (productId: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { push } = useToast();
  const userId = user?.id ?? null;

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      setCart(await api.cart());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Run a mutation, then re-read the bag so totals always come from the server.
  const mutate = useCallback(
    async (action: () => Promise<unknown>, success?: string): Promise<boolean> => {
      try {
        await action();
        await refresh();
        if (success) push(success, { action: { label: "View bag", to: "/bag" } });
        return true;
      } catch (err) {
        push(errorMessage(err), { tone: "error" });
        return false;
      }
    },
    [refresh, push],
  );

  const value = useMemo<CartApi>(
    () => ({
      cart,
      count: cart?.totalQuantity ?? 0,
      loading,
      error,
      refresh,
      add: (productId, quantity = 1) => mutate(() => api.addToCart(productId, quantity), "Added to bag"),
      setQuantity: (productId, quantity) => mutate(() => api.setQuantity(productId, quantity)),
      remove: (productId) => mutate(() => api.removeItem(productId)),
      clear: () => mutate(() => api.clearCart()),
    }),
    [cart, loading, error, refresh, mutate],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
