import "dotenv/config";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import weatherRouter from "./routes/weather.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { WeatherApiError } from "./services/weatherService.js";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
app.use(apiRateLimiter);

// Health check / welcome route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Express Weather API!",
    endpoints: {
      getWeatherByPath: "/api/v1/weather/:city",
      getWeatherByQuery: "/api/v1/weather?city=:city",
    },
  });
});

// Routes
app.use("/api/v1", weatherRouter);
app.use(weatherRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    statusCode: 404,
    error: `Cannot ${req.method} ${req.path}`,
  });
});

// Global Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof WeatherApiError) {
    res.status(err.statusCode).json({
      status: "error",
      statusCode: err.statusCode,
      error: err.message,
    });
    return;
  }

  res.status(500).json({
    status: "error",
    statusCode: 500,
    error: "Internal Server Error",
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Weather API running on http://localhost:${PORT}`);
});

export default app;
