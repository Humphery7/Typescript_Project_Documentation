// Shapes returned by the ecommerce_api backend.
// Postgres NUMERIC columns arrive as strings ("29.99"), so prices are string | number.

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: string | number;
  description: string | null;
  inventory: number;
  created_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductList {
  products: Product[];
  pagination: Pagination;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: string | number;
  description: string | null;
  inventory: number;
  item_total: string | number;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: string | number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string | number;
  product_name: string;
}

export interface CheckoutResult {
  message: string;
  order: Order;
  items: OrderItem[];
  payment: {
    status: string;
    amountDue: number;
    currency: string;
    checkoutUrl: string | null;
    sessionId: string;
  };
}
