import rateLimit from "express-rate-limit";

const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    statusCode: 429,
    error: `Too many requests from this IP. Rate limit is ${maxRequests} requests per 15 minutes.`,
  },
});

export default apiRateLimiter;
