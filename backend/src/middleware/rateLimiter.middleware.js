/**
 * Rate limiting middleware
 * Protects against brute force and DoS attacks
 */

// Simple in-memory rate limiter
// For production, use Redis-based solution like express-rate-limit with Redis store

class RateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
    
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now - data.resetTime > this.windowMs) {
        this.requests.delete(key);
      }
    }
  }
  
  getKey(req) {
    // Use IP address and user agent for better tracking
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }
  
  middleware() {
    return (req, res, next) => {
      const key = this.getKey(req);
      const now = Date.now();
      
      let requestData = this.requests.get(key);
      
      if (!requestData || now - requestData.resetTime > this.windowMs) {
        // New window
        requestData = {
          count: 1,
          resetTime: now
        };
        this.requests.set(key, requestData);
        return next();
      }
      
      if (requestData.count >= this.maxRequests) {
        const retryAfter = Math.ceil((this.windowMs - (now - requestData.resetTime)) / 1000);
        
        res.set('Retry-After', retryAfter);
        res.set('X-RateLimit-Limit', this.maxRequests);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', new Date(requestData.resetTime + this.windowMs).toISOString());
        
        return res.status(429).json({
          message: 'Too many requests, please try again later',
          retryAfter: `${retryAfter} seconds`
        });
      }
      
      requestData.count++;
      this.requests.set(key, requestData);
      
      res.set('X-RateLimit-Limit', this.maxRequests);
      res.set('X-RateLimit-Remaining', this.maxRequests - requestData.count);
      res.set('X-RateLimit-Reset', new Date(requestData.resetTime + this.windowMs).toISOString());
      
      next();
    };
  }
}

// Login rate limiter - 5 attempts per 15 minutes
export const loginLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  5 // 5 attempts
).middleware();

// Registration rate limiter - 3 attempts per hour
export const registerLimiter = new RateLimiter(
  60 * 60 * 1000, // 1 hour
  3 // 3 attempts
).middleware();

// OTP verification rate limiter - 10 attempts per 15 minutes
export const otpVerifyLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  10 // 10 attempts
).middleware();

// OTP resend rate limiter - 5 attempts per 15 minutes
export const otpResendLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  5 // 5 attempts
).middleware();

// Password change rate limiter - 5 attempts per hour
export const passwordChangeLimiter = new RateLimiter(
  60 * 60 * 1000, // 1 hour
  5 // 5 attempts
).middleware();

// General API rate limiter - 100 requests per 15 minutes
export const generalLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  100 // 100 requests
).middleware();

/**
 * Strict rate limiter for sensitive operations
 * 3 attempts per 30 minutes
 */
export const strictLimiter = new RateLimiter(
  30 * 60 * 1000, // 30 minutes
  3 // 3 attempts
).middleware();

/**
 * NOTE: For production use, replace this with express-rate-limit + Redis
 * 
 * Example:
 * 
 * import rateLimit from 'express-rate-limit';
 * import RedisStore from 'rate-limit-redis';
 * import { createClient } from 'redis';
 * 
 * const redisClient = createClient({
 *   url: process.env.REDIS_URL
 * });
 * 
 * export const loginLimiter = rateLimit({
 *   store: new RedisStore({
 *     client: redisClient,
 *     prefix: 'rl:login:'
 *   }),
 *   windowMs: 15 * 60 * 1000,
 *   max: 5,
 *   message: 'Too many login attempts',
 *   standardHeaders: true,
 *   legacyHeaders: false
 * });
 */
