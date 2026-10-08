import { Link } from "react-router-dom";
import { SHOW_ADMIN, STORE_NAME } from "../config";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__row">
        <p>{STORE_NAME}. Prices in US dollars. Card payments are handled by Stripe.</p>
        <nav aria-label="Footer">
          <Link to="/">Shop</Link>
          <Link to="/orders">Orders</Link>
          {SHOW_ADMIN && <Link to="/admin/new-product">Add product</Link>}
        </nav>
      </div>
    </footer>
  );
}
