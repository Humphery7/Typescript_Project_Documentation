import express, { type Request, type Router, type Response, type NextFunction } from "express"
import { connectDB } from "../services/databaseService.js"

const router: Router = express.Router()

router.get('/health', async (req: Request, res: Response, next: NextFunction) => {

    try {
        const result = await connectDB();
        return res.status(200).json({ message: result })
    } catch (err) {
        console.error(err);
    }

})

export default router;