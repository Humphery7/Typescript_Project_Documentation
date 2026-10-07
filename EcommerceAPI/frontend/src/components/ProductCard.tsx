import { Link } from "react-router-dom";
import type { Product } from "../types";
import { money } from "../format";
import Plate from "./Plate";
import Stock from "./Stock";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link to={`/p/${p.id}`} className={`card ${p.inventory === 0 ? "soldout" : ""}`}>
      <div className="card-art"><Plate seed={p.id} label={p.name} />{p.inventory === 0 && <span className="stamp">Sold out</span>}</div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <span className="price">{money(p.price)}</span>
      </div>
      <Stock n={p.inventory} />
    </Link>
  );
}
