import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { RequireAuth } from "./components/RequireAuth";
import { ServerStatus } from "./components/ServerStatus";
import AuthPage from "./pages/Auth";
import Bag from "./pages/Bag";
import Cancel from "./pages/Cancel";
import NewProduct from "./pages/NewProduct";
import NotFound from "./pages/NotFound";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import ProductPage from "./pages/Product";
import Shop from "./pages/Shop";
import Success from "./pages/Success";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <ServerStatus />
      <main id="main" className="wrap">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Shop />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="account" element={<AuthPage />} />
        <Route path="bag" element={<RequireAuth><Bag /></RequireAuth>} />
        <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
        <Route path="success" element={<RequireAuth><Success /></RequireAuth>} />
        <Route path="cancel" element={<Cancel />} />
        <Route path="admin/new-product" element={<NewProduct />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
