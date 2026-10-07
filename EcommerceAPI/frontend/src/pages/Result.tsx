import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Order, OrderItem } from "../types";
import { Receipt } from "./Orders";
import { useCart } from "../context/Cart";

export function Success() {
  const { refresh } = useCart();
  const id = sessionStorage.getItem("sr_last_order");
  const [d, setD] = useState<{ order: Order; items: OrderItem[] } | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    refresh();
    if (!id) return;
    let tries = 0, live = true;
    const tick = async () => {
      try {
        const r = await api<{ order: Order; items: OrderItem[] }>(`/orders/${id}`);
        if (!live) return; setD(r);
        if (r.order.status === "paid") return;
      } catch { /* keep trying */ }
      if (++tries >= 15) return live && setGaveUp(true);
      setTimeout(tick, 2000);
    };
    tick();
    return () => { live = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const paid = d?.order.status === "paid";
  return (
    <div className="result">
      <h1>{paid ? "Payment received." : "Thanks. Confirming your payment…"}</h1>
      <p className="muted">{paid ? "Your order is confirmed." : gaveUp ? "Stripe is taking longer than usual to confirm. Check your orders in a minute." : "This usually takes a few seconds."}</p>
      {d && <Receipt order={d.order} items={d.items} />}
      <Link to="/" className="btn">Keep shopping</Link>
    </div>
  );
}

export function Cancel() {
  const id = sessionStorage.getItem("sr_last_order");
  return (
    <div className="result">
      <h1>You haven't been charged.</h1>
      <p className="muted">Payment was cancelled. Your items stay reserved for 30 minutes, then go back on the shelf.</p>
      {id && <Link to={`/orders/${id}`} className="btn">View the held order</Link>}
      <Link to="/" className="btn ghost">Back to the shelves</Link>
    </div>
  );
}
