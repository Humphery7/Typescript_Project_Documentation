import express, { type Request, type Response, type Express } from "express";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import productRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import orderRouter from "./routes/orders.js";
import errorHandler from "./middleware/errorMiddleware.js";

const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "E-commerce API is running",
        endpoints: {
            auth: ["/auth/signup", "/auth/login"],
            products: ["GET /products", "GET /products/:id", "POST /products"],
            cart: ["GET /cart", "POST /cart/items", "PUT /cart/items/:productId", "DELETE /cart/items/:productId", "DELETE /cart"],
            orders: ["POST /orders/checkout", "GET /orders", "GET /orders/:id"],
            health: ["GET /health"]
        }
    });
});

// Mount Routes
app.use("/auth", authRouter);
app.use(authRouter); // Support /signup and /login directly
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use(healthRouter);

// Centralized error handling
app.use(errorHandler);

export default app;