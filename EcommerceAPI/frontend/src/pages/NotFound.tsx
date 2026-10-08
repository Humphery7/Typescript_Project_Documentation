import { Link } from "react-router-dom";
import { useTitle } from "../hooks";

export default function NotFound() {
  useTitle("Page not found");
  return (
    <div className="state state--wide">
      <h1 className="state__title">That page doesn't exist</h1>
      <p>The link may be old, or the address may have a typo.</p>
      <div className="state__actions">
        <Link to="/" className="btn btn--solid">
          Back to the shop
        </Link>
      </div>
    </div>
  );
}
