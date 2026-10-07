import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { money } from "../format";
import Plate from "../components/Plate";
import Qty from "../components/Qty";
import { useCart } from "../context/Cart";
import { useToast } from "../context/Toast";

interface CheckoutRes { order: { id: string }; payment: { checkoutUrl: string | null } }

export default function CartPage() {
  const { cart, loading, setQty, remove, clear } = useCart();
  const toast = useToast();
  const [paying, setPaying] = useState(false);

  const checkout = async () => {
    setPaying(true);
    try {
      const r = await api<CheckoutRes>("/orders/checkout", { method: "POST", body: {} });
      if (!r.payment.checkoutUrl) throw new Error("Stripe didn't return a payment page. Try again.");
      sessionStorage.setItem("sr_last_order", r.order.id);
      window.location.href = r.payment.checkoutUrl;
    } catch (e) { toast((e as Error).message, "bad"); setPaying(false); }
  };

  if (!cart.items.length) {
    return <div className="empty"><h2>{loading ? "Loading your bag…" : "Your bag is empty."}</h2>{!loading && <><p>Items you add will be held here until you check out.</p><Link to="/" className="btn">Browse the shelves</Link></>}</div>;
  }

  return (
    <div className="cart">
      <h1>Your bag</h1>
      <div className="slip">
        <ul>
          {cart.items.map((i) => (
            <li key={i.id}>
              <Link to={`/p/${i.product_id}`} className="thumb"><Plate seed={i.product_id} label={i.name} /></Link>
              <div className="li-main">
                <Link to={`/p/${i.product_id}`}><b>{i.name}</b></Link>
                <span className="muted">{money(i.price)} each</span>
                <button className="linkish" onClick={() => remove(i.product_id)}>Remove</button>
              </div>
              <Qty value={i.quantity} max={i.inventory} onChange={(n) => setQty(i.product_id, n)} />
              <span className="li-total">{money(i.item_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="sum">
          <div><dt>{cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"}</dt><dd>{money(cart.totalAmount)}</dd></div>
          <div><dt>Shipping and tax</dt><dd>Not included</dd></div>
          <div className="grand"><dt>Total due</dt><dd>{money(cart.totalAmount)}</dd></div>
        </dl>
        <button className="btn wide" disabled={paying} onClick={checkout}>{paying ? "Opening Stripe…" : "Pay with Stripe"}</button>
        <p className="muted small">Your items are reserved while you pay. If you leave without paying, they go back on the shelf after 30 minutes.</p>
        <button className="linkish" onClick={clear}>Empty bag</button>
      </div>
    </div>
  );
}
