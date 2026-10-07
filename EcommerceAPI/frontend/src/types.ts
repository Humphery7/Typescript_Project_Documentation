export interface Product { id: string; name: string; price: string | number; description: string | null; inventory: number; created_at?: string }
export interface CartItem { id: string; product_id: string; quantity: number; name: string; price: string; description: string | null; inventory: number; item_total: string }
export interface Cart { cartId: string; items: CartItem[]; totalQuantity: number; totalAmount: number }
export interface Order { id: string; total_amount: string; status: string; created_at: string }
export interface OrderItem { id: string; product_id: string; quantity: number; price: string; product_name: string }
export interface User { id: string; name: string; email: string }
