import { Link } from "react-router-dom";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { useResource, useTitle } from "../hooks";
import { api } from "../lib/api";
import { formatDate, money, shortId, statusInfo } from "../lib/format";

export default function Orders() {
  useTitle("Orders");
  const { data, error, reload } = useResource((signal) => api.orders(signal), []);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return <Loading label="Loading your orders" />;

  return (
    <div className="orders">
      <h1 className="page-title">Your orders</h1>
      {data.orders.length === 0 ? (
        <EmptyState title="No orders yet">
          <p>Once you check out, your orders will be listed here.</p>
          <Link to="/" className="btn btn--solid">
            Browse the shop
          </Link>
        </EmptyState>
      ) : (
        <ul className="order-list">
          {data.orders.map((order) => {
            const status = statusInfo(order.status);
            return (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`} className="order-row">
                  <span className="order-row__main">
                    <strong>Order {shortId(order.id)}</strong>
                    <span className="order-row__date">{formatDate(order.created_at)}</span>
                  </span>
                  <span className={`pill pill--${status.tone}`}>{status.label}</span>
                  <span className="order-row__total">{money(order.total_amount)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
