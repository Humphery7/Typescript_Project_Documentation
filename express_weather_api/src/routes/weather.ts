import express, { type Request, type Response, type NextFunction, type Router } from "express";
import { fetchWeatherData } from "../services/weatherService.js";
import { cacheService } from "../services/cacheService.js";

const router: Router = express.Router();

async function handleWeatherRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const rawCity = (req.params.city || req.query.city) as string;

    if (!rawCity || typeof rawCity !== "string" || !rawCity.trim()) {
      res.status(400).json({
        status: "error",
        statusCode: 400,
        error: "City parameter is required. Example usage: GET /api/v1/weather/Lagos or GET /api/v1/weather?city=Lagos",
      });
      return;
    }

    const city = rawCity.trim();

    // 1. Check Cache
    const cachedData = await cacheService.get(city);

    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      res.status(200).json({
        status: "success",
        cached: true,
        source: "cache",
        data: cachedData,
      });
      return;
    }

    // 2. Fetch from 3rd Party API on Cache Miss
    const weatherData = await fetchWeatherData(city);

    // 3. Save result to cache (TTL: 12 hours by default)
    await cacheService.set(city, weatherData);

    res.setHeader("X-Cache", "MISS");
    res.status(200).json({
      status: "success",
      cached: false,
      source: "api",
      data: weatherData,
    });
  } catch (error) {
    next(error);
  }
}

// Routes
router.get("/weather/:city", handleWeatherRequest);
router.get("/weather", handleWeatherRequest);

export default router;