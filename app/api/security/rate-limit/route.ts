import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/security"

// Create rate limiter instances for different endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per window
  keyGenerator: (request) => {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return `auth:${ip}`
  }
})

export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 webhook calls per minute
})

// Rate limit middleware function
export async function withRateLimit(
  request: NextRequest,
  rateLimiter: ReturnType<typeof rateLimit>
) {
  const result = await rateLimiter(request)
  
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', rateLimiter.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers
      }
    )
  }
  
  return { success: true, headers }
}

// Test endpoint to check rate limiting
export async function GET(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, apiRateLimit)
  
  if ('success' in rateLimitResult && !rateLimitResult.success) {
    return rateLimitResult
  }
  
  return NextResponse.json(
    { message: 'Rate limit check passed' },
    { headers: rateLimitResult.headers }
  )
}
