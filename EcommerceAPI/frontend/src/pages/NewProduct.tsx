import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTitle } from "../hooks";
import { api, errorMessage } from "../lib/api";
import type { Product } from "../lib/types";

const EMPTY = { name: "", price: "", inventory: "10", description: "" };

/**
 * Stocks the shelf. Note: the backend's POST /products is not protected, so this page
 * is hidden unless VITE_SHOW_ADMIN=true. Lock the endpoint down before going public.
 */
export default function NewProduct() {
  useTitle("Add product");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Product | null>(null);

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    setBusy(true);
    try {
      const description = form.description.trim();
      const { product } = await api.createProduct({
        name: form.name.trim(),
        price: parseFloat(form.price),
        inventory: parseInt(form.inventory, 10),
        ...(description ? { description } : {}),
      });
      setCreated(product);
      setForm(EMPTY);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <h1 className="page-title">Add a product</h1>
      <p className="auth__lede">New products appear on the shelf right away.</p>

      {created && (
        <p className="notice" role="status">
          Added {created.name}. <Link to={`/products/${created.id}`}>View it</Link>
        </p>
      )}

      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="np-name">Name</label>
          <input id="np-name" required maxLength={50} value={form.name} onChange={set("name")} />
        </div>
        <div className="form__pair">
          <div className="field">
            <label htmlFor="np-price">Price ($)</label>
            <input
              id="np-price"
              type="number"
              inputMode="decimal"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={set("price")}
            />
          </div>
          <div className="field">
            <label htmlFor="np-stock">In stock</label>
            <input
              id="np-stock"
              type="number"
              inputMode="numeric"
              required
              min="0"
              step="1"
              value={form.inventory}
              onChange={set("inventory")}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="np-desc">Description</label>
          <textarea id="np-desc" rows={4} value={form.description} onChange={set("description")} />
        </div>

        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--solid btn--block" disabled={busy}>
          {busy ? "Adding…" : "Add product"}
        </button>
      </form>
    </div>
  );
}
