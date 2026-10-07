import "dotenv/config";
import pg from "pg";
const { Pool } = pg;
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import AppError from "./errorService.js"

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
export const client = pool

export interface Product {
    id: string;
    name: string;
    price: number | string;
    description?: string | null;
    inventory: number;
    created_at?: Date;
}

export interface CartItem {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    name?: string;
    price?: number | string;
    description?: string | null;
    inventory?: number;
}

export interface Order {
    id: string;
    user_id: string;
    total_amount: number | string;
    status: string;
    created_at?: Date;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number | string;
    product_name?: string;
}

export async function connectDB() {
    try {
        console.log("Successfully connected to db")

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(50) NOT NULL,
                email VARCHAR(50) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(50) NOT NULL,
                price NUMERIC(10, 2) NOT NULL,
                description TEXT,
                inventory INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS carts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                cart_id UUID NOT NULL,
                product_id UUID NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,

                FOREIGN KEY (cart_id)
                    REFERENCES carts(id)
                    ON DELETE CASCADE,

                FOREIGN KEY (product_id)
                    REFERENCES products(id)
                    ON DELETE CASCADE,

                UNIQUE (cart_id, product_id)
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                total_amount NUMERIC(10, 2) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `)

        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID NOT NULL,
                product_id UUID NOT NULL,
                quantity INTEGER NOT NULL,
                price NUMERIC(10, 2) NOT NULL,

                FOREIGN KEY (order_id)
                    REFERENCES orders(id)
                    ON DELETE CASCADE,

                FOREIGN KEY (product_id)
                    REFERENCES products(id)
                    ON DELETE CASCADE
            )
        `)

        console.log("Tables created successfully")

    } catch (err) {
        console.error(err)
    }
}

export async function disconnectDB() {
    await client.end()
}

export async function signupService(
    name: string,
    email: string,
    password_hash: string
) {
    try {
        const query = `
            INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, created_at
        `

        const result = await client.query(query, [
            name,
            email,
            password_hash
        ])

        console.log("User created successfully")
        return result.rows[0]

    } catch (err: any) {
        if (err.code === "23505") {
            throw new AppError("Email is already registered", 409)
        }
        console.error(err)
        throw err
    }
}

export async function loginService(
    email: string,
    password: string
) {
    try {
        const query = `
            SELECT *
            FROM users
            WHERE email = $1
        `

        const result = await client.query(query, [email])
        const user = result.rows[0]

        if (!user) {
            throw new AppError("Invalid email or password", 401)
        }

        const isValid = await bcrypt.compare(
            password,
            user.password_hash
        )

        if (!isValid) {
            throw new AppError("Invalid email or password", 401)
        }

        const token = jwt.sign({
            userId: user.id,
            email: user.email
        }, process.env.JWT_SECRET!, {
            expiresIn: "1h"
        })

        // Return user without sensitive password hash
        const { password_hash, ...safeUser } = user
        return { user: safeUser, token }

    } catch (err) {
        console.error(err)
        throw err
    }
}