import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { Product } from "../types";
import { useToast } from "../context/Toast";

export default function StockDesk() {
  const toast = useToast();
  const blank = { name: "", price: "", inventory: "1", description: "" };
  const [f, setF] = useState(blank);
  const [added, setAdded] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await api<{ product: Product }>("/products", { method: "POST", body: { name: f.name, price: f.price, inventory: f.inventory, description: f.description } });
      setAdded(r.product); setF(blank); toast("Product added to the shelves.");
    } catch (e) { toast((e as Error).message, "bad"); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <h1>Stock desk</h1>
      <p className="muted">Add products to the catalog. Lock this route down with an admin check before going public.</p>
      <form onSubmit={submit} className="form">
        <label>Name<input required maxLength={50} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <div className="two">
          <label>Price (USD)<input required inputMode="decimal" pattern="\d+(\.\d{1,2})?" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></label>
          <label>In stock<input required inputMode="numeric" pattern="\d+" value={f.inventory} onChange={(e) => setF({ ...f, inventory: e.target.value })} /></label>
        </div>
        <label>Description<textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <button className="btn" disabled={busy}>{busy ? "Adding…" : "Add product"}</button>
      </form>
      {added && <p className="notice">Added “{added.name}”. <Link to={`/p/${added.id}`}>View it</Link></p>}
    </div>
  );
}
