import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./context/Toast";
import { AuthProvider } from "./context/Auth";
import { CartProvider } from "./context/Cart";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
