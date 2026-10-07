import { pool, type Order, type OrderItem } from "./databaseService.js";
import AppError from "./errorService.js";
import { createCheckoutSession } from "./stripeService.js";

export interface PaymentDetails {
    currency?: string; // e.g. "usd" — defaults to "usd" if not provided
}

/**
 * Checkout flow for all items in the authenticated user's cart.
 * Executes atomically within a PostgreSQL transaction:
 * 1. Locks products and verifies available inventory.
 * 2. Calculates total amount.
 * 3. Creates a 'pending' order in the DB.
 * 4. Creates a Stripe Checkout Session (redirect-based payment).
 * 5. Returns the Stripe `session_url` — the caller redirects the user there.
 *
 * The order is only marked 'paid' after the Stripe webhook
 * (`checkout.session.completed`) fires and is handled in the webhook route.
 */
export async function checkoutAndPay(userId: string, paymentDetails: PaymentDetails = {}) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Get user's cart
        const cartResult = await client.query(
            "SELECT id FROM carts WHERE user_id = $1",
            [userId]
        );

        if (cartResult.rows.length === 0) {
            throw new AppError("No cart found for this user", 400);
        }

        const cartId = cartResult.rows[0].id;

        // 2. Fetch cart items with row locking on products to prevent race conditions
        const itemsQuery = `
            SELECT 
                ci.product_id,
                ci.quantity,
                p.name,
                p.price,
                p.inventory
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1
            FOR UPDATE OF p
        `;

        const itemsResult = await client.query(itemsQuery, [cartId]);
        const cartItems = itemsResult.rows;

        if (cartItems.length === 0) {
            throw new AppError("Your cart is empty. Add products before checking out.", 400);
        }

        // 3. Verify stock availability and calculate total
        let totalAmount = 0;

        for (const item of cartItems) {
            const requestedQty = item.quantity;
            const availableStock = item.inventory;

            if (availableStock < requestedQty) {
                throw new AppError(
                    `Insufficient stock for "${item.name}". Requested: ${requestedQty}, Available: ${availableStock}`,
                    400
                );
            }

            totalAmount += parseFloat(item.price) * requestedQty;
        }

        totalAmount = Number(totalAmount.toFixed(2));

        // 4. Decrement product inventory (inside transaction — rolled back if anything fails)
        for (const item of cartItems) {
            await client.query(
                `UPDATE products
                 SET inventory = inventory - $1
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        // 5. Create order record with 'pending' status.
        //    It will be marked 'paid' by the Stripe webhook after the user
        //    completes payment on Stripe's hosted checkout page.
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total_amount, status)
             VALUES ($1, $2, 'pending')
             RETURNING id, user_id, total_amount, status, created_at`,
            [userId, totalAmount]
        );

        const order: Order = orderResult.rows[0];

        // 7. Insert order items
        const insertedItems: OrderItem[] = [];
        for (const item of cartItems) {
            const orderItemResult = await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, order_id, product_id, quantity, price`,
                [order.id, item.product_id, item.quantity, item.price]
            );
            insertedItems.push({
                ...orderItemResult.rows[0],
                product_name: item.name
            });
        }

        // 6. Clear user's cart
        await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);

        // Commit the DB transaction before calling Stripe
        // (so DB state is clean regardless of Stripe outcome)
        await client.query("COMMIT");

        // 7. Create Stripe Checkout Session AFTER committing the order.
        //    We need the real orderId to store in Stripe metadata so the
        //    webhook can look up and update this order later.
        const session = await createCheckoutSession({
            amount: totalAmount,
            currency: paymentDetails.currency ?? "usd",
            userId,
            orderId: order.id,
            successUrl: `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/success`,
            cancelUrl: `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/cancel`,
        });

        return {
            order,                          // status is 'pending' until webhook fires
            items: insertedItems,
            payment: {
                status: "pending",
                amountDue: totalAmount,
                currency: paymentDetails.currency ?? "usd",
                // Redirect the user to this URL to complete payment on Stripe
                checkoutUrl: session.url,
                sessionId: session.id,
            }
        };

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Retrieves past orders for a user.
 */
export async function getUserOrders(userId: string) {
    const ordersQuery = `
        SELECT id, user_id, total_amount, status, created_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    const ordersResult = await pool.query(ordersQuery, [userId]);
    return ordersResult.rows as Order[];
}

/**
 * Retrieves details of a specific order along with its purchased items.
 */
export async function getOrderById(userId: string, orderId: string) {
    const orderResult = await pool.query(
        "SELECT id, user_id, total_amount, status, created_at FROM orders WHERE id = $1 AND user_id = $2",
        [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
        throw new AppError("Order not found", 404);
    }

    const itemsQuery = `
        SELECT 
            oi.id,
            oi.order_id,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.name as product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [orderId]);

    return {
        order: orderResult.rows[0] as Order,
        items: itemsResult.rows as OrderItem[]
    };
}
