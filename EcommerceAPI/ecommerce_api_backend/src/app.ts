import express, { type Request, type Response, type Express, type Router } from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import productRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import orderRouter from "./routes/orders.js";
import errorHandler from "./middleware/errorMiddleware.js";

const app: Express = express();

// Enable CORS for frontend applications
app.use(cors({
    origin: true, // Allow frontend origin (e.g. http://localhost:5173, http://localhost:3000, etc.)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const apiRouter: Router = express.Router();

// Mount Routes
apiRouter.use("/auth", authRouter);
apiRouter.use(authRouter); // Support /signup and /login directly
apiRouter.use("/products", productRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use(healthRouter);

app.use('/api/v1', apiRouter);


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "E-commerce API is running",
        endpoints: {
            auth: ["/api/v1/auth/signup", "/api/v1/auth/login"],
            products: ["GET /api/v1/products", "GET /api/v1/products/:id", "POST /api/v1/products"],
            cart: ["GET /api/v1/cart", "POST /api/v1/cart/items", "PUT /api/v1/cart/items/:productId", "DELETE /api/v1/cart/items/:productId", "DELETE /api/v1/cart"],
            orders: ["POST /api/v1/orders/checkout", "GET /api/v1/orders", "GET /api/v1/orders/:id"],
            health: ["GET /api/v1/health"]
        }
    });
});



// Centralized error handling
app.use(errorHandler);

export default app;