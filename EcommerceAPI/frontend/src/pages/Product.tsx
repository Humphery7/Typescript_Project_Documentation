import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plate } from "../components/Plate";
import { Price } from "../components/Price";
import { QuantityStepper } from "../components/QuantityStepper";
import { EmptyState, ErrorState, Loading } from "../components/States";
import { useCart } from "../context/CartContext";
import { useAddToBag, useResource, useTitle } from "../hooks";
import { api, ApiError } from "../lib/api";

export default function ProductPage() {
  const { id = "" } = useParams();
  const { data, error, reload } = useResource((signal) => api.product(id, signal), [id]);
  const product = data?.product ?? null;
  useTitle(product?.name ?? "Product");

  const addToBag = useAddToBag();
  const { cart } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const inBag = cart?.items.find((item) => item.product_id === id)?.quantity ?? 0;
  const room = product ? Math.max(0, product.inventory - inBag) : 0;

  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), Math.max(1, room)));
  }, [room]);

  if (error) {
    // The API answers 404 for unknown ids, and a database error for ids that aren't UUIDs at all.
    const missing = error instanceof ApiError && (error.status === 404 || /uuid/i.test(error.message));
    return missing ? (
      <EmptyState title="We can't find that product">
        <Link to="/">Back to the shop</Link>
      </EmptyState>
    ) : (
      <ErrorState error={error} onRetry={reload} />
    );
  }
  if (!product) return <Loading label="Loading product" />;

  const soldOut = product.inventory <= 0;

  async function add() {
    setBusy(true);
    const ok = await addToBag(id, qty);
    setBusy(false);
    if (ok) setQty(1);
  }

  return (
    <article className="product">
      <Plate seed={product.id} soldOut={soldOut} className="product__plate" />

      <div className="product__info">
        <Link to="/" className="product__back">
          All products
        </Link>
        <h1 className="product__name">{product.name}</h1>
        <Price value={product.price} size="lg" />

        <p className="product__desc">{product.description?.trim() || "No description yet."}</p>

        <div className="product__buy">
          {soldOut ? (
            <p className="product__note product__note--out">Sold out</p>
          ) : room === 0 ? (
            <p className="product__note">
              All {product.inventory} in stock {product.inventory === 1 ? "is" : "are"} already in your{" "}
              <Link to="/bag">bag</Link>.
            </p>
          ) : (
            <>
              <QuantityStepper value={qty} max={room} label="Quantity" onChange={setQty} />
              <button type="button" className="btn btn--solid" disabled={busy} onClick={add}>
                {busy ? "Adding…" : "Add to bag"}
              </button>
            </>
          )}
        </div>

        {!soldOut && (
          <p className="product__note">
            {product.inventory <= 5 ? `Only ${product.inventory} left. ` : `${product.inventory} in stock. `}
            {inBag > 0 && (
              <>
                {inBag} in your <Link to="/bag">bag</Link>.
              </>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
