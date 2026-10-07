import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { useCart } from "../context/Cart";
import { STORE_NAME } from "../config";

export default function Layout() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const nav = useNavigate();
  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <Link to="/" className="logo"><b />{STORE_NAME}</Link>
          <nav>
            <NavLink to="/" end>Shop</NavLink>
            {user && <NavLink to="/orders">Orders</NavLink>}
            {user ? (
              <button className="linkish" onClick={() => { logout(); nav("/"); }}>Log out</button>
            ) : (
              <NavLink to="/login">Log in</NavLink>
            )}
            <NavLink to="/cart" className="bag">Bag<span>{cart.totalQuantity}</span></NavLink>
          </nav>
        </div>
      </header>
      <main className="wrap"><Outlet /></main>
      <footer className="foot wrap">
        <span>{STORE_NAME}. Payments are handled by Stripe, and card details never touch our servers.</span>
        <Link to="/stock">Stock desk</Link>
      </footer>
    </>
  );
}
