import type { Request, Response, NextFunction } from "express";
import AppError from "../services/errorService.js";

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message
        });
        return;
    }

    console.error("Unhandled Error:", err);
    res.status(500).json({
        status: "error",
        message: err.message || "Internal server error"
    });
};

export default errorHandler;
