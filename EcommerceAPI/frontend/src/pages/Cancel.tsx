import { Link } from "react-router-dom";
import { useTitle } from "../hooks";

export default function Cancel() {
  useTitle("Payment not completed");
  return (
    <div className="state state--wide">
      <h1 className="state__title">Payment wasn't completed</h1>
      <p>
        You left Stripe before paying, so nothing was charged. The order is saved as unpaid under Orders.
      </p>
      <div className="state__actions">
        <Link to="/orders" className="btn btn--solid">
          View orders
        </Link>
        <Link to="/" className="btn btn--ghost">
          Back to the shop
        </Link>
      </div>
    </div>
  );
}
