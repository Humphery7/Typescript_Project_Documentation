import express, { type Request, type Response, type NextFunction, type Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getCartWithItems,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart
} from "../services/cartService.js";
import AppError from "../services/errorService.js";

const router: Router = express.Router();

// All cart endpoints require user authentication
router.use(authMiddleware);

// GET /cart - View current user's cart
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const cart = await getCartWithItems(userId);
        res.status(200).json(cart);
    } catch (err) {
        next(err);
    }
});

// POST /cart/items - Add a product to the cart
router.post("/items", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { productId, quantity = 1 } = req.body;
        const item = await addToCart(userId, productId, Number(quantity));
        res.status(201).json({ message: "Product added to cart", item });
    } catch (err) {
        next(err);
    }
});

// PUT /cart/items/:productId - Update product quantity in cart
router.put("/items/:productId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined) {
            throw new AppError("Quantity is required", 400);
        }

        const updated = await updateCartItemQuantity(userId, productId as string, Number(quantity));
        res.status(200).json({ message: "Cart updated", item: updated });
    } catch (err) {
        next(err);
    }
});

// DELETE /cart/items/:productId - Remove a specific product from cart
router.delete("/items/:productId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { productId } = req.params;
        const result = await removeFromCart(userId, productId as string);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// DELETE /cart - Clear the entire cart
router.delete("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const result = await clearCart(userId);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

export default router;
