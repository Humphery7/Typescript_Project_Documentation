import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { Order, OrderItem } from "../types";
import { money, shortId, when } from "../format";
import { useAsync } from "../components/useAsync";

export const Status = ({ s }: { s: string }) => <span className={`pill ${s}`}>{s === "paid" ? "Paid" : s === "pending" ? "Awaiting payment" : s === "expired" ? "Expired" : s}</span>;

export function OrderList() {
  const { data, error, loading } = useAsync(() => api<{ orders: Order[] }>("/orders"), []);
  if (loading) return <div className="skeleton tall" />;
  if (error) return <p className="notice bad">{error}</p>;
  if (!data?.orders.length) return <div className="empty"><h2>No orders yet.</h2><p>When you check out, your receipts show up here.</p><Link to="/" className="btn">Start shopping</Link></div>;
  return (
    <div className="orders">
      <h1>Your orders</h1>
      <ul className="table">
        {data.orders.map((o) => (
          <li key={o.id}><Link to={`/orders/${o.id}`}>
            <b>Order {shortId(o.id)}</b><span className="muted">{when(o.created_at)}</span><Status s={o.status} /><span className="amt">{money(o.total_amount)}</span>
          </Link></li>
        ))}
      </ul>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { data, error, loading } = useAsync(() => api<{ order: Order; items: OrderItem[] }>(`/orders/${id}`), [id]);
  if (loading) return <div className="skeleton tall" />;
  if (error || !data) return <div className="empty"><h2>Order not found.</h2><p>{error}</p><Link to="/orders" className="btn">All orders</Link></div>;
  return <Receipt order={data.order} items={data.items} />;
}

export function Receipt({ order, items }: { order: Order; items: OrderItem[] }) {
  return (
    <div className="slip receipt">
      <Link to="/orders" className="back">All orders</Link>
      <h1>Order {shortId(order.id)}</h1>
      <p className="muted">{when(order.created_at)} <Status s={order.status} /></p>
      <ul>{items.map((i) => <li key={i.id}><span>{i.quantity} × {i.product_name}</span><span>{money(Number(i.price) * i.quantity)}</span></li>)}</ul>
      <dl className="sum"><div className="grand"><dt>Total</dt><dd>{money(order.total_amount)}</dd></div></dl>
    </div>
  );
}
