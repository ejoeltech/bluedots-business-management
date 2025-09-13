import { NextRequest } from 'next/server'

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options

  return (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }

    // Get current rate limit data for this IP
    const current = rateLimitMap.get(ip)
    
    if (!current || current.resetTime < now) {
      // First request or window expired
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs
      })
      return { allowed: true, remaining: maxRequests - 1 }
    }

    if (current.count >= maxRequests) {
      // Rate limit exceeded
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    // Increment counter
    current.count++
    rateLimitMap.set(ip, current)

    return { 
      allowed: true, 
      remaining: maxRequests - current.count 
    }
  }
}

// Predefined rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
})

export const emailRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 emails per minute
})
