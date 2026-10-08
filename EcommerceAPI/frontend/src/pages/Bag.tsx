import { useState } from "react";
import { Link } from "react-router-dom";
import { Plate } from "../components/Plate";
import { QuantityStepper } from "../components/QuantityStepper";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { STRIPE_TEST_HINT } from "../config";
import { useCart } from "../context/CartContext";
import { useTitle } from "../hooks";
import { api, ApiError, errorMessage } from "../lib/api";
import { money } from "../lib/format";

export default function Bag() {
  useTitle("Bag");
  const { cart, error, refresh, setQuantity, remove, clear } = useCart();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!cart) {
    return error ? <ErrorState error={new Error(error)} onRetry={refresh} /> : <Loading label="Loading your bag" />;
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState title="Your bag is empty">
        <p>Pick something from the shelf and it will show up here.</p>
        <Link to="/" className="btn btn--solid">
          Browse the shop
        </Link>
      </EmptyState>
    );
  }

  const overStock = cart.items.some((item) => item.quantity > item.inventory);

  async function change(productId: string, quantity: number) {
    setBusyId(productId);
    await setQuantity(productId, quantity);
    setBusyId(null);
  }

  async function checkout() {
    setPaying(true);
    setPayError(null);
    try {
      const result = await api.checkout();
      const url = result.payment.checkoutUrl;
      if (!url) throw new Error("Stripe didn't return a payment page. Your order is saved as unpaid under Orders.");
      window.location.assign(url);
    } catch (err) {
      let message = errorMessage(err);
      if (err instanceof ApiError && err.status >= 500) {
        message += " If an order was created, you'll find it unpaid under Orders.";
      }
      setPayError(message);
      setPaying(false);
      void refresh();
    }
  }

  return (
    <div className="bag">
      <section className="bag__lines" aria-label="Items in your bag">
        <div className="bag__head">
          <h1 className="page-title">Your bag</h1>
          <button type="button" className="linkbtn" onClick={() => void clear()}>
            Empty bag
          </button>
        </div>

        {cart.items.map((item) => (
          <article className="line" key={item.id}>
            <Link to={`/products/${item.product_id}`} className="line__plate" aria-hidden="true" tabIndex={-1}>
              <Plate seed={item.product_id} />
            </Link>
            <div className="line__main">
              <h2 className="line__name">
                <Link to={`/products/${item.product_id}`}>{item.name}</Link>
              </h2>
              <p className="line__unit">{money(item.price)} each</p>
              {item.quantity > item.inventory && (
                <p className="line__warn" role="alert">
                  {item.inventory === 0 ? "No longer in stock." : `Only ${item.inventory} left.`} Lower the quantity or
                  remove it to check out.
                </p>
              )}
              <div className="line__controls">
                <QuantityStepper
                  value={item.quantity}
                  max={item.inventory}
                  label={`Quantity for ${item.name}`}
                  disabled={busyId === item.product_id}
                  onChange={(next) => void change(item.product_id, next)}
                />
                <button
                  type="button"
                  className="linkbtn"
                  disabled={busyId === item.product_id}
                  onClick={() => void remove(item.product_id)}
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="line__total">{money(item.item_total)}</p>
          </article>
        ))}
      </section>

      <aside className="summary" aria-label="Order summary">
        <h2 className="summary__title">Summary</h2>
        <dl className="summary__rows">
          <div>
            <dt>Items</dt>
            <dd>{cart.totalQuantity}</dd>
          </div>
          <div className="summary__total">
            <dt>Total</dt>
            <dd>{money(cart.totalAmount)}</dd>
          </div>
        </dl>

        {payError && (
          <p className="form__error" role="alert">
            {payError}
          </p>
        )}

        <button type="button" className="btn btn--solid btn--block" disabled={paying || overStock} onClick={checkout}>
          {paying ? "Opening Stripe…" : "Pay with Stripe"}
        </button>
        <p className="summary__note">You'll finish paying on Stripe's secure page.</p>
        {STRIPE_TEST_HINT && (
          <p className="summary__note">Test mode: card 4242 4242 4242 4242, any future date, any CVC.</p>
        )}
      </aside>
    </div>
  );
}
