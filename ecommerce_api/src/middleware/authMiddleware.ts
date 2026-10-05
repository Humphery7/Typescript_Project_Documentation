import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Shape of the JWT payload signed during login in databaseService.ts
export interface AuthPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Extend Express Request type to include the authenticated user payload
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

/**
 * Authentication middleware that verifies incoming JWT Bearer tokens.
 * Decodes the token and attaches `req.user` for downstream route handlers.
 */
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Access denied. No token provided or invalid format."
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({
                message: "Access denied. Token missing."
            });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not configured in environment variables");
            res.status(500).json({
                message: "Internal server error: authentication configuration missing."
            });
            return;
        }

        const decoded = jwt.verify(token, secret) as AuthPayload;

        // Attach authenticated user information to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "Token has expired." });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid token." });
            return;
        }

        res.status(500).json({ message: "Authentication failed." });
    }
};

export default authMiddleware;
