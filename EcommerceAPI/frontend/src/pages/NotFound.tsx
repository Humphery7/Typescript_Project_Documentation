import { Link } from "react-router-dom";
export default function NotFound() {
  return <div className="empty"><h2>That page isn't on the shelves.</h2><Link to="/" className="btn">Back to the shop</Link></div>;
}
