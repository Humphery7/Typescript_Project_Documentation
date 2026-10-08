import { API_URL } from "../config";
import type {
  Cart,
  CheckoutResult,
  Order,
  OrderItem,
  Product,
  ProductList,
  User,
} from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* ---------- wiring supplied by AuthProvider ---------- */

let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureApi(opts: { getToken: () => string | null; onUnauthorized: () => void }) {
  getToken = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
}

/* ---------- slow-request tracking (drives the "waking the server" banner) ---------- */

const SLOW_AFTER_MS = 3000;
const listeners = new Set<() => void>();
let pending = 0;
let slow = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  listeners.forEach((l) => l());
}
function begin() {
  pending += 1;
  if (pending === 1) {
    timer = setTimeout(() => {
      slow = true;
      emit();
    }, SLOW_AFTER_MS);
  }
}
function end() {
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    if (timer) clearTimeout(timer);
    timer = null;
    if (slow) {
      slow = false;
      emit();
    }
  }
}

export const slowStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => slow,
};

/* ---------- core request ---------- */

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal | undefined;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, signal } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  begin();
  let res: Response;
  try {
    const init: RequestInit = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    if (signal) init.signal = signal;
    res = await fetch(`${API_URL}${path}`, init);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("Can't reach the shop server. Check your connection and try again.", 0);
  } finally {
    end();
  }

  let data: { message?: string } | null = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized();
    throw new ApiError(data?.message ?? `Request failed (${res.status}).`, res.status);
  }
  return data as T;
}

/* ---------- endpoints ---------- */

export interface ProductQuery {
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request<{ message: string; data: User }>("/auth/signup", {
      method: "POST",
      body: { name, email, password },
    }),

  login: (email: string, password: string) =>
    request<{ message: string; user: User; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  products: ({ search, minPrice, maxPrice, page, limit, signal }: ProductQuery = {}) => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (minPrice) qs.set("minPrice", minPrice);
    if (maxPrice) qs.set("maxPrice", maxPrice);
    if (page) qs.set("page", String(page));
    if (limit) qs.set("limit", String(limit));
    const query = qs.toString();
    return request<ProductList>(`/products${query ? `?${query}` : ""}`, { signal });
  },

  product: (id: string, signal?: AbortSignal) =>
    request<{ product: Product }>(`/products/${encodeURIComponent(id)}`, { signal }),

  createProduct: (body: { name: string; price: number; description?: string; inventory: number }) =>
    request<{ message: string; product: Product }>("/products", { method: "POST", body }),

  cart: () => request<Cart>("/cart", { auth: true }),

  addToCart: (productId: string, quantity = 1) =>
    request<{ message: string }>("/cart/items", {
      method: "POST",
      auth: true,
      body: { productId, quantity },
    }),

  setQuantity: (productId: string, quantity: number) =>
    request<{ message: string }>(`/cart/items/${encodeURIComponent(productId)}`, {
      method: "PUT",
      auth: true,
      body: { quantity },
    }),

  removeItem: (productId: string) =>
    request<{ message: string }>(`/cart/items/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      auth: true,
    }),

  clearCart: () => request<{ message: string }>("/cart", { method: "DELETE", auth: true }),

  checkout: (currency = "usd") =>
    request<CheckoutResult>("/orders/checkout", {
      method: "POST",
      auth: true,
      body: { currency },
    }),

  orders: (signal?: AbortSignal) =>
    request<{ orders: Order[] }>("/orders", { auth: true, signal }),

  order: (id: string, signal?: AbortSignal) =>
    request<{ order: Order; items: OrderItem[] }>(`/orders/${encodeURIComponent(id)}`, {
      auth: true,
      signal,
    }),
};

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Try again.";
}
