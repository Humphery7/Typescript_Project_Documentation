import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Guard from "./components/Guard";
import Home from "./pages/Home";
import ProductPage from "./pages/Product";
import AuthPage from "./pages/Auth";
import CartPage from "./pages/Cart";
import { OrderDetail, OrderList } from "./pages/Orders";
import { Cancel, Success } from "./pages/Result";
import StockDesk from "./pages/Stock";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="p/:id" element={<ProductPage />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="signup" element={<AuthPage mode="signup" />} />
        <Route path="cart" element={<Guard><CartPage /></Guard>} />
        <Route path="orders" element={<Guard><OrderList /></Guard>} />
        <Route path="orders/:id" element={<Guard><OrderDetail /></Guard>} />
        <Route path="success" element={<Guard><Success /></Guard>} />
        <Route path="cancel" element={<Guard><Cancel /></Guard>} />
        <Route path="stock" element={<Guard><StockDesk /></Guard>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
