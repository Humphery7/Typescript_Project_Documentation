import { pool, type CartItem } from "./databaseService.js";
import AppError from "./errorService.js";

/**
 * Retrieves the cart ID for a user, creating one if it doesn't already exist.
 */
export async function getOrCreateCart(userId: string): Promise<string> {
    const query = `
        INSERT INTO carts (user_id)
        VALUES ($1)
        ON CONFLICT (user_id)
        DO UPDATE SET user_id = EXCLUDED.user_id
        RETURNING id
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0].id;
}

/**
 * Gets a user's active cart with all product details and calculated totals.
 */
export async function getCartWithItems(userId: string) {
    const cartId = await getOrCreateCart(userId);

    const query = `
        SELECT 
            ci.id,
            ci.cart_id,
            ci.product_id,
            ci.quantity,
            p.name,
            p.price,
            p.description,
            p.inventory,
            (ci.quantity * p.price) as item_total
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
        ORDER BY ci.id ASC
    `;

    const result = await pool.query(query, [cartId]);
    const items = result.rows;

    let totalQuantity = 0;
    let totalAmount = 0;

    for (const item of items) {
        totalQuantity += item.quantity;
        totalAmount += parseFloat(item.item_total);
    }

    return {
        cartId,
        items,
        totalQuantity,
        totalAmount: Number(totalAmount.toFixed(2))
    };
}

/**
 * Adds a product to the user's cart, verifying inventory availability.
 */
export async function addToCart(userId: string, productId: string, quantity: number = 1) {
    if (!productId) {
        throw new AppError("Product ID is required", 400);
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
        throw new AppError("Quantity must be a positive integer", 400);
    }

    // Check if product exists and has sufficient stock
    const productResult = await pool.query(
        "SELECT id, name, price, inventory FROM products WHERE id = $1",
        [productId]
    );

    if (productResult.rows.length === 0) {
        throw new AppError("Product not found", 404);
    }

    const product = productResult.rows[0];
    const cartId = await getOrCreateCart(userId);

    // Check current quantity in cart
    const existingItemResult = await pool.query(
        "SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2",
        [cartId, productId]
    );

    const currentQtyInCart = existingItemResult.rows.length > 0 ? existingItemResult.rows[0].quantity : 0;
    const requestedTotalQty = currentQtyInCart + quantity;

    if (requestedTotalQty > product.inventory) {
        throw new AppError(
            `Cannot add ${quantity} item(s). Only ${product.inventory} in stock (${currentQtyInCart} already in cart).`,
            400
        );
    }

    const upsertQuery = `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (cart_id, product_id)
        DO UPDATE SET quantity = cart_items.quantity + $3
        RETURNING *
    `;

    const result = await pool.query(upsertQuery, [cartId, productId, quantity]);
    return result.rows[0] as CartItem;
}

/**
 * Updates the quantity of a product in the cart. If quantity is 0, removes the item.
 */
export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    if (!productId) {
        throw new AppError("Product ID is required", 400);
    }

    if (quantity < 0 || !Number.isInteger(quantity)) {
        throw new AppError("Quantity must be a non-negative integer", 400);
    }

    if (quantity === 0) {
        return removeFromCart(userId, productId);
    }

    // Check product inventory
    const productResult = await pool.query(
        "SELECT inventory FROM products WHERE id = $1",
        [productId]
    );

    if (productResult.rows.length === 0) {
        throw new AppError("Product not found", 404);
    }

    const product = productResult.rows[0];
    if (quantity > product.inventory) {
        throw new AppError(`Cannot update quantity to ${quantity}. Only ${product.inventory} available in stock.`, 400);
    }

    const cartId = await getOrCreateCart(userId);

    const query = `
        UPDATE cart_items
        SET quantity = $3
        WHERE cart_id = $1 AND product_id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [cartId, productId, quantity]);

    if (result.rows.length === 0) {
        throw new AppError("Product is not in your cart", 404);
    }

    return result.rows[0] as CartItem;
}

/**
 * Removes a product from the user's cart.
 */
export async function removeFromCart(userId: string, productId: string) {
    const cartId = await getOrCreateCart(userId);

    const result = await pool.query(
        "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING id",
        [cartId, productId]
    );

    if (result.rows.length === 0) {
        throw new AppError("Item not found in your cart", 404);
    }

    return { message: "Item removed from cart successfully" };
}

/**
 * Clears all items from the user's cart.
 */
export async function clearCart(userId: string) {
    const cartId = await getOrCreateCart(userId);
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
    return { message: "Cart cleared successfully" };
}
