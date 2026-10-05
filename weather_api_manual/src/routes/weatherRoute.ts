import express, { type Router, type Request, type Response, type NextFunction } from "express";
import getWeather from "../services/weatherService.js"


const router: Router = express.Router();

router.get("/:city", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const city: string = String(req.params.city);
        const weatherData = await getWeather(city);
        res.status(200).json({ status: "success", data: weatherData });
    } catch (error) {
        next(error)
    }
});

export default router;