import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { Providers } from "./Providers";

/* A fake backend that mirrors ecommerce_api's response shapes (string prices, {message} errors). */

const P1 = "11111111-1111-4111-8111-111111111111";
const P2 = "22222222-2222-4222-8222-222222222222";
const P3 = "33333333-3333-4333-8333-333333333333";

const products = [
  { id: P1, name: "Linen Tote", price: "29.99", description: "Heavy canvas.", inventory: 12, created_at: "2026-01-01T00:00:00Z" },
  { id: P2, name: "Brass Pen", price: "8.50", description: null, inventory: 3, created_at: "2026-01-02T00:00:00Z" },
  { id: P3, name: "Enamel Mug", price: "14.00", description: "Camp mug.", inventory: 0, created_at: "2026-01-03T00:00:00Z" },
];

function fakeToken(): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${b64({ alg: "HS256" })}.${b64({ exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
}

const user = { id: "u-1", name: "Ada Obi", email: "ada@example.com", created_at: "2026-01-01T00:00:00Z" };

function installFakeApi(opts: { orderStatus?: string; rejectAuth?: boolean } = {}) {
  const cart = new Map<string, number>();
  const orders = [
    { id: "aaaaaaaa-0000-4000-8000-000000000001", user_id: "u-1", total_amount: "38.49", status: opts.orderStatus ?? "pending", created_at: "2026-02-01T10:00:00Z" },
  ];
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

  const fetchMock = vi.fn(async (input: string | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    const path = url.pathname;
    const method = init.method ?? "GET";
    const body = init.body ? JSON.parse(String(init.body)) : null;
    const authed = Boolean((init.headers as Record<string, string>)?.Authorization) && !opts.rejectAuth;
    const denied = () => json({ status: "error", message: "Invalid or expired token" }, 401);

    if (path === "/auth/signup") return json({ message: "ok", data: user });
    if (path === "/auth/login") {
      if (body.password === "wrong-password") return json({ status: "error", message: "Invalid email or password" }, 401);
      return json({ message: "ok", user, token: fakeToken() });
    }
    if (path === "/products" && method === "GET") {
      return json({ products, pagination: { total: products.length, page: 1, limit: 12, totalPages: 1 } });
    }
    const productMatch = path.match(/^\/products\/(.+)$/);
    if (productMatch) {
      const found = products.find((p) => p.id === productMatch[1]);
      return found ? json({ product: found }) : json({ status: "error", message: "Product not found" }, 404);
    }

    if (!authed) return denied();

    if (path === "/cart" && method === "GET") {
      const items = [...cart].map(([pid, quantity]) => {
        const p = products.find((x) => x.id === pid)!;
        return { id: `ci-${pid}`, cart_id: "c-1", product_id: pid, quantity, name: p.name, price: p.price, description: p.description, inventory: p.inventory, item_total: (Number(p.price) * quantity).toFixed(2) };
      });
      const totalAmount = items.reduce((s, i) => s + Number(i.item_total), 0);
      return json({ cartId: "c-1", items, totalQuantity: items.reduce((s, i) => s + i.quantity, 0), totalAmount });
    }
    if (path === "/cart/items" && method === "POST") {
      cart.set(body.productId, (cart.get(body.productId) ?? 0) + body.quantity);
      return json({ message: "Item added" });
    }
    const itemMatch = path.match(/^\/cart\/items\/(.+)$/);
    if (itemMatch && method === "PUT") {
      if (body.quantity <= 0) cart.delete(itemMatch[1]!);
      else cart.set(itemMatch[1]!, body.quantity);
      return json({ message: "Updated" });
    }
    if (itemMatch && method === "DELETE") {
      cart.delete(itemMatch[1]!);
      return json({ message: "Removed" });
    }
    if (path === "/cart" && method === "DELETE") {
      cart.clear();
      return json({ message: "Cleared" });
    }
    if (path === "/orders/checkout") {
      return json({
        message: "Order created",
        order: orders[0],
        items: [],
        payment: { status: "requires_payment", amountDue: 29.99, currency: "usd", checkoutUrl: "https://checkout.stripe.test/session", sessionId: "cs_test_1" },
      });
    }
    if (path === "/orders") return json({ orders });
    const orderMatch = path.match(/^\/orders\/(.+)$/);
    if (orderMatch) {
      return json({
        order: orders[0],
        items: [{ id: "oi-1", order_id: orders[0]!.id, product_id: P1, quantity: 1, price: "29.99", product_name: "Linen Tote" }],
      });
    }
    return json({ status: "error", message: "Not found" }, 404);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function signInStorage() {
  localStorage.setItem("storefront.session", JSON.stringify({ token: fakeToken(), user }));
}

function mount(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Providers>
        <App />
      </Providers>
    </MemoryRouter>,
  );
}

let assign: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  assign = vi.fn();
  Object.defineProperty(window, "location", { value: { ...window.location, assign }, writable: true });
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("storefront against the backend contract", () => {
  it("lists products with prices, low-stock and sold-out states", async () => {
    installFakeApi();
    mount("/");
    expect(await screen.findByText("Linen Tote")).toBeTruthy();
    expect(screen.getByText("$29.99")).toBeTruthy();
    expect(screen.getByText("Only 3 left")).toBeTruthy();
    expect(screen.getAllByText("Sold out").length).toBeGreaterThan(0);
    expect(screen.getByText("3 products")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Add Enamel Mug to bag" })).toBeNull();
    expect(screen.getByRole("button", { name: "Add Brass Pen to bag" })).toBeTruthy();
  });

  it("sends signed-out visitors to sign up, then back to the shop, then through add to bag and checkout", async () => {
    installFakeApi();
    const u = userEvent.setup();
    mount("/");

    await u.click(await screen.findByRole("button", { name: "Add Linen Tote to bag" }));
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeTruthy();
    expect(screen.getByText("Sign in to add items to your bag.")).toBeTruthy();

    await u.click(screen.getByRole("button", { name: "Create an account" }));
    await u.type(screen.getByLabelText("Name"), "Ada Obi");
    await u.type(screen.getByLabelText("Email"), "ada@example.com");
    await u.type(screen.getByLabelText("Password"), "correct-horse");
    await u.click(screen.getByRole("button", { name: "Create account" }));

    // signup returns no token, so the app signs in itself and returns to the shop
    await u.click(await screen.findByRole("button", { name: "Add Linen Tote to bag" }));
    expect(await screen.findByText("Added to bag")).toBeTruthy();
    expect(await screen.findByRole("link", { name: "Bag, 1 item" })).toBeTruthy();

    await u.click(screen.getByRole("link", { name: "Bag, 1 item" }));
    expect(await screen.findByRole("heading", { name: "Your bag" })).toBeTruthy();
    expect(screen.getAllByText("$29.99").length).toBeGreaterThan(0);

    await u.click(screen.getByRole("button", { name: "Pay with Stripe" }));
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.stripe.test/session"));
  });

  it("shows the API's error message on a failed sign in", async () => {
    installFakeApi();
    const u = userEvent.setup();
    mount("/account");
    await u.type(screen.getByLabelText("Email"), "ada@example.com");
    await u.type(screen.getByLabelText("Password"), "wrong-password");
    await u.click(screen.getByRole("button", { name: "Sign in" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Invalid email or password");
  });

  it("signs out when the API rejects the token", async () => {
    installFakeApi({ rejectAuth: true });
    signInStorage();
    mount("/");
    await screen.findByText("Linen Tote");
    await waitFor(() => expect(screen.getByRole("link", { name: "Sign in" })).toBeTruthy());
    expect(localStorage.getItem("storefront.session")).toBeNull();
  });

  it("renders orders, an order receipt, and the paid success state", async () => {
    installFakeApi({ orderStatus: "paid" });
    signInStorage();
    const u = userEvent.setup();
    mount("/orders");
    expect(await screen.findByText("Order AAAAAAAA")).toBeTruthy();
    expect(screen.getByText("Paid")).toBeTruthy();
    await u.click(screen.getByText("Order AAAAAAAA"));
    expect(await screen.findByRole("heading", { name: "Order AAAAAAAA" })).toBeTruthy();
    expect(screen.getByText("Linen Tote")).toBeTruthy();
    cleanup();

    mount("/success");
    expect(await screen.findByRole("heading", { name: "Payment received" })).toBeTruthy();
  });

  it("handles unknown product ids and unknown routes", async () => {
    installFakeApi();
    mount("/products/not-a-real-id");
    expect(await screen.findByText("We can't find that product")).toBeTruthy();
    cleanup();
    mount("/nope");
    expect(await screen.findByText("That page doesn't exist")).toBeTruthy();
  });
});
