import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api";
import type { Cart } from "../types";
import { useAuth } from "./Auth";
import { useToast } from "./Toast";

const empty: Cart = { cartId: "", items: [], totalQuantity: 0, totalAmount: 0 };
interface CartCtx {
  cart: Cart;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, quantity: number) => Promise<boolean>;
  setQty: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}
const Ctx = createContext<CartCtx>(null!);
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState<Cart>(empty);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setCart(empty); return; }
    setLoading(true);
    try { setCart(await api<Cart>("/cart")); } catch { /* 401 handled globally */ } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const run = async (fn: () => Promise<unknown>, okMsg?: string) => {
    try { await fn(); await refresh(); if (okMsg) toast(okMsg); return true; }
    catch (e) { toast((e as Error).message, "bad"); return false; }
  };

  const value: CartCtx = {
    cart, loading, refresh,
    add: (productId, quantity) => run(() => api("/cart/items", { method: "POST", body: { productId, quantity } }), "Added to your bag."),
    setQty: async (productId, quantity) => { await run(() => api(`/cart/items/${productId}`, { method: "PUT", body: { quantity } })); },
    remove: async (productId) => { await run(() => api(`/cart/items/${productId}`, { method: "DELETE" }), "Removed from your bag."); },
    clear: async () => { await run(() => api("/cart", { method: "DELETE" }), "Bag emptied."); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
