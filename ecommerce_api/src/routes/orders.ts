import express, { type Request, type Response, type NextFunction, type Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { checkoutAndPay, getUserOrders, getOrderById } from "../services/orderService.js";
import AppError from "../services/errorService.js";

const router: Router = express.Router();

// All order and checkout routes require authentication
router.use(authMiddleware);

// POST /orders/checkout - Checkout and pay for items in cart
router.post("/checkout", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const { paymentMethod, cardNumber, simulateFailure } = req.body;
        const result = await checkoutAndPay(userId, { paymentMethod, cardNumber, simulateFailure });

        res.status(201).json({
            message: "Order placed and payment processed successfully",
            ...result
        });
    } catch (err) {
        next(err);
    }
});

// GET /orders - View authenticated user's order history
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const orders = await getUserOrders(userId);
        res.status(200).json({ orders });
    } catch (err) {
        next(err);
    }
});

// GET /orders/:id - View specific order receipt and items
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }

        const orderDetails = await getOrderById(userId, req.params.id as string);
        res.status(200).json(orderDetails);
    } catch (err) {
        next(err);
    }
});

export default router;
