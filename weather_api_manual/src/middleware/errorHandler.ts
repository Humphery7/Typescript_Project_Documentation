import { type Request, type Response, type NextFunction } from "express";
import AppError from "../services/errorService.js";




const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message })
    }

    return res.status(500).json({ message: "Internal Server Error, try again later" })

}


export default errorHandler