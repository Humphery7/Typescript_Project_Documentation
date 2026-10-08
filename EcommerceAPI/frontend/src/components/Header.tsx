import { Link, NavLink, useNavigate } from "react-router-dom";
import { SHOW_ADMIN, STORE_NAME } from "../config";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link to="/" className="wordmark" aria-label={`${STORE_NAME}, home`}>
          {STORE_NAME}
        </Link>

        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>
            Shop
          </NavLink>
          {user && <NavLink to="/orders">Orders</NavLink>}
          {SHOW_ADMIN && <NavLink to="/admin/new-product">Add product</NavLink>}
        </nav>

        <div className="site-header__tools">
          {user ? (
            <>
              <span className="who">{user.name.split(" ")[0]}</span>
              <button
                type="button"
                className="linkbtn"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/account" className="linkbtn">
              Sign in
            </Link>
          )}
          <Link to="/bag" className="bagbtn" aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}>
            Bag <span className="bagbtn__count">({count})</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
