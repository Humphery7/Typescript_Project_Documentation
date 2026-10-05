import express, { type Request, type Response, type NextFunction, type Router } from "express";
import { getProducts, getProductById, createProduct } from "../services/productService.js";

const router: Router = express.Router();

// GET /products - View and search products with optional filters
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = (req.query.search as string) || (req.query.q as string) || undefined;
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

        const result = await getProducts({ search, minPrice, maxPrice, page, limit });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// GET /products/:id - View details of a specific product
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await getProductById(req.params.id as string);
        res.status(200).json({ product });
    } catch (err) {
        next(err);
    }
});

// POST /products - Create a new product (catalog management)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, price, description, inventory } = req.body;
        const newProduct = await createProduct({
            name,
            price: Number(price),
            description,
            inventory: inventory !== undefined ? Number(inventory) : 0
        });
        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (err) {
        next(err);
    }
});

export default router;
