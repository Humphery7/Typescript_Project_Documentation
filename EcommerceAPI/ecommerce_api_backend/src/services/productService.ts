import { pool, type Product } from "./databaseService.js";
import AppError from "./errorService.js";

export interface GetProductsFilter {
    search?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}

export async function getProducts(filter: GetProductsFilter = {}) {
    const {
        search,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20
    } = filter;

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (search && search.trim() !== "") {
        values.push(`%${search.trim()}%`);
        conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
        values.push(minPrice);
        conditions.push(`price >= $${values.length}`);
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
        values.push(maxPrice);
        conditions.push(`price <= $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (Math.max(1, page) - 1) * limit;

    const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    const dataValues = [...values, limit, offset];
    const dataQuery = `
        SELECT id, name, price, description, inventory, created_at
        FROM products
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}
    `;

    const result = await pool.query(dataQuery, dataValues);

    return {
        products: result.rows as Product[],
        pagination: {
            total: totalCount,
            page: Math.max(1, page),
            limit,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
}

export async function getProductById(id: string): Promise<Product> {
    const query = `
        SELECT id, name, price, description, inventory, created_at
        FROM products
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
        throw new AppError("Product not found", 404);
    }

    return result.rows[0] as Product;
}

export async function createProduct(data: {
    name: string;
    price: number;
    description?: string;
    inventory?: number;
}): Promise<Product> {
    const { name, price, description = null, inventory = 0 } = data;

    if (!name || name.trim() === "") {
        throw new AppError("Product name is required", 400);
    }

    if (price === undefined || isNaN(price) || price < 0) {
        throw new AppError("A valid positive price is required", 400);
    }

    if (inventory < 0) {
        throw new AppError("Inventory count cannot be negative", 400);
    }

    const query = `
        INSERT INTO products (name, price, description, inventory)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, price, description, inventory, created_at
    `;

    const result = await pool.query(query, [
        name.trim(),
        price,
        description,
        inventory
    ]);

    return result.rows[0] as Product;
}
