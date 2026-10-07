import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { Product } from "../types";
import { money } from "../format";
import Plate from "../components/Plate";
import Qty from "../components/Qty";
import Stock from "../components/Stock";
import { useAsync } from "../components/useAsync";
import { useAuth } from "../context/Auth";
import { useCart } from "../context/Cart";

export default function ProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { cart, add } = useCart();
  const nav = useNavigate();
  const loc = useLocation();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const { data, error, loading } = useAsync(() => api<{ product: Product }>(`/products/${id}`), [id]);

  if (loading) return <div className="detail"><div className="skeleton tall" /></div>;
  if (error || !data) return <div className="empty"><h2>We can't find that product.</h2><p>{error}</p><Link to="/" className="btn">Back to the shelves</Link></div>;

  const p = data.product;
  const inBag = cart.items.find((i) => i.product_id === p.id)?.quantity ?? 0;
  const room = Math.max(0, p.inventory - inBag);

  const onAdd = async () => {
    if (!user) return nav("/login", { state: { from: loc.pathname } });
    setBusy(true); const ok = await add(p.id, qty); setBusy(false); if (ok) setQty(1);
  };

  return (
    <article className="detail">
      <div className="detail-art"><Plate seed={p.id} label={p.name} /></div>
      <div className="detail-info">
        <Link to="/" className="back">Back to the shelves</Link>
        <h1>{p.name}</h1>
        <p className="big-price">{money(p.price)}</p>
        <p className="desc">{p.description || "No description yet."}</p>
        <Stock n={p.inventory} />
        {p.inventory > 0 && (
          <div className="buy">
            {room > 0 ? (<>
              <Qty value={qty} max={room} onChange={setQty} />
              <button className="btn" disabled={busy || qty < 1} onClick={onAdd}>{busy ? "Adding…" : `Add to bag · ${money(Number(p.price) * Math.max(qty, 1))}`}</button>
            </>) : <p className="notice">Your bag already holds all {p.inventory} we have.</p>}
          </div>
        )}
        {inBag > 0 && <p className="muted">{inBag} in your bag. <Link to="/cart">View bag</Link></p>}
        {!user && p.inventory > 0 && <p className="muted">You'll be asked to log in before adding to your bag.</p>}
      </div>
    </article>
  );
}
