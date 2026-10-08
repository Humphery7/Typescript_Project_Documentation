import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../components/States";
import { useCart } from "../context/CartContext";
import { useTitle } from "../hooks";
import { api } from "../lib/api";
import { money, shortId } from "../lib/format";
import type { Order } from "../lib/types";

const MAX_CHECKS = 8;
const CHECK_EVERY_MS = 2500;

/**
 * Stripe sends people here after paying. The backend marks the order "paid" from a
 * webhook, which can land a moment later, so poll the latest order for a short while.
 */
export default function Success() {
  useTitle("Payment");
  const { refresh } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;

    async function check(attempt: number) {
      let paid = false;
      try {
        const { orders } = await api.orders();
        const latest = orders[0] ?? null;
        if (stopped) return;
        setOrder(latest);
        paid = latest?.status === "paid";
      } catch {
        if (stopped) return;
      }
      if (paid || attempt >= MAX_CHECKS) {
        setDone(true);
        return;
      }
      timer = window.setTimeout(() => void check(attempt + 1), CHECK_EVERY_MS);
    }

    void check(1);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, []);

  const paid = order?.status === "paid";

  if (paid && order) {
    return (
      <div className="state state--wide">
        <h1 className="state__title">Payment received</h1>
        <p>
          Order {shortId(order.id)} for {money(order.total_amount)} is paid. Thank you.
        </p>
        <div className="state__actions">
          <Link to={`/orders/${order.id}`} className="btn btn--solid">
            View order
          </Link>
          <Link to="/" className="btn btn--ghost">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!done) return <Loading label="Checking your payment" />;

  return (
    <div className="state state--wide">
      <h1 className="state__title">We're still confirming your payment</h1>
      <p>
        Stripe hasn't told the shop about this payment yet. That can take a minute. Your order is listed under Orders
        and will switch to Paid once it arrives.
      </p>
      <div className="state__actions">
        <Link to="/orders" className="btn btn--solid">
          View orders
        </Link>
        <Link to="/" className="btn btn--ghost">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
