import express, { type Router, type Request, type Response } from "express";
import getWeather from "../services/weatherService"


const router: Router = express.Router();

router.get("/:city", async (req: Request, res: Response) => {
    const city: string = String(req.params.city);
    const weatherData = await getWeather(city);
    res.status(200).json({ status: "success", data: weatherData });
});

export default router;