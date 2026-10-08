import { useState } from "react";
import { Link } from "react-router-dom";
import { useAddToBag } from "../hooks";
import { stockNote } from "../lib/format";
import type { Product } from "../lib/types";
import { Plate } from "./Plate";
import { Price } from "./Price";

export function ProductCard({ product }: { product: Product }) {
  const addToBag = useAddToBag();
  const [busy, setBusy] = useState(false);
  const soldOut = product.inventory <= 0;
  const note = stockNote(product.inventory);

  async function add() {
    setBusy(true);
    await addToBag(product.id);
    setBusy(false);
  }

  return (
    <article className="card">
      <div className="card__media">
        <Plate seed={product.id} soldOut={soldOut} />
        {!soldOut && (
          <button
            type="button"
            className="btn btn--solid btn--small card__add"
            disabled={busy}
            onClick={add}
            aria-label={`Add ${product.name} to bag`}
          >
            {busy ? "Adding…" : "Add to bag"}
          </button>
        )}
      </div>
      <div className="card__info">
        <h3 className="card__name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <Price value={product.price} />
      </div>
      {note && <p className={`card__stock${soldOut ? " card__stock--out" : ""}`}>{note}</p>}
    </article>
  );
}
