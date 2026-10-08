import { Link, useParams } from "react-router-dom";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { useResource, useTitle } from "../hooks";
import { api, ApiError } from "../lib/api";
import { formatDate, money, shortId, statusInfo, toNumber } from "../lib/format";

export default function OrderDetail() {
  const { id = "" } = useParams();
  const { data, error, reload } = useResource((signal) => api.order(id, signal), [id]);
  useTitle(data ? `Order ${shortId(data.order.id)}` : "Order");

  if (error) {
    const missing = error instanceof ApiError && (error.status === 404 || /uuid/i.test(error.message));
    return missing ? (
      <EmptyState title="We can't find that order">
        <Link to="/orders">Back to your orders</Link>
      </EmptyState>
    ) : (
      <ErrorState error={error} onRetry={reload} />
    );
  }
  if (!data) return <Loading label="Loading order" />;

  const { order, items } = data;
  const status = statusInfo(order.status);

  return (
    <div className="receipt">
      <Link to="/orders" className="product__back">
        All orders
      </Link>
      <div className="receipt__head">
        <h1 className="page-title">Order {shortId(order.id)}</h1>
        <span className={`pill pill--${status.tone}`}>{status.label}</span>
      </div>
      <p className="receipt__date">Placed {formatDate(order.created_at)}</p>

      {order.status === "pending" && (
        <p className="notice">
          This order is waiting for payment confirmation from Stripe. If you've already paid, give it a moment and
          refresh.
        </p>
      )}

      <table className="ledger">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col" className="num">Qty</th>
            <th scope="col" className="num">Price</th>
            <th scope="col" className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <Link to={`/products/${item.product_id}`}>{item.product_name}</Link>
              </td>
              <td className="num">{item.quantity}</td>
              <td className="num">{money(item.price)}</td>
              <td className="num">{money(toNumber(item.price) * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>
              Total
            </th>
            <td className="num">{money(order.total_amount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
