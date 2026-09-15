import Redis from "ioredis";

interface CacheEntry {
  data: any;
  expiresAt: number;
}

class CacheService {
  private redisClient: Redis | null = null;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private isRedisConnected: boolean = false;
  private defaultTtl: number;

  constructor() {
    this.defaultTtl = parseInt(process.env.CACHE_TTL_SECONDS || "43200", 10); // 12 hours default
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    try {
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts
          }
          return Math.min(times * 200, 1000);
        },
        lazyConnect: false,
      });

      this.redisClient.on("connect", () => {
        this.isRedisConnected = true;
        console.log(`[CacheService] Connected to Redis at ${redisUrl}`);
      });

      this.redisClient.on("error", (err) => {
        if (this.isRedisConnected) {
          console.warn("[CacheService] Redis connection error. Falling back to in-memory cache:", err.message);
        }
        this.isRedisConnected = false;
      });
    } catch (error) {
      console.warn("[CacheService] Failed to initialize Redis client. Using in-memory fallback cache.");
      this.isRedisConnected = false;
    }
  }

  /**
   * Fetch item from cache (Redis or in-memory fallback)
   */
  async get<T = any>(key: string): Promise<T | null> {
    const normalizedKey = `weather:${key.toLowerCase().trim()}`;

    if (this.isRedisConnected && this.redisClient) {
      try {
        const cachedData = await this.redisClient.get(normalizedKey);
        if (cachedData) {
          return JSON.parse(cachedData) as T;
        }
      } catch (err) {
        console.warn("[CacheService] Error reading from Redis, checking in-memory cache:", err);
      }
    }

    // In-memory fallback lookup
    const entry = this.memoryCache.get(normalizedKey);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(normalizedKey);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set item in cache with expiration in seconds
   */
  async set(key: string, data: any, ttlSeconds?: number): Promise<void> {
    const normalizedKey = `weather:${key.toLowerCase().trim()}`;
    const ttl = ttlSeconds || this.defaultTtl;

    // Always populate in-memory fallback
    this.memoryCache.set(normalizedKey, {
      data,
      expiresAt: Date.now() + ttl * 1000,
    });

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(normalizedKey, JSON.stringify(data), "EX", ttl);
      } catch (err) {
        console.warn("[CacheService] Failed to write to Redis:", err);
      }
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
