import { NextRequest } from "next/server"
import crypto from "crypto"

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return async (request: NextRequest): Promise<{ success: boolean; remaining: number; resetTime: number }> => {
    const key = keyGenerator ? keyGenerator(request) : getDefaultKey(request)
    const now = Date.now()
    
    // Clean up expired entries
    cleanupExpiredEntries(now)
    
    const record = rateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      return {
        success: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }
    
    if (record.count >= maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: record.resetTime
      }
    }
    
    // Increment counter
    record.count++
    rateLimitStore.set(key, record)
    
    return {
      success: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime
    }
  }
}

function getDefaultKey(request: NextRequest): string {
  // Use IP address as default key
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  return `rate-limit:${ip}`
}

function cleanupExpiredEntries(now: number) {
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// CSRF Protection
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  )
}

// Input Sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

export function sanitizeHtmlContent(html: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Password Validation
export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  isStrong: boolean
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push("Password should be at least 8 characters long")
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Add uppercase letters")
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Add lowercase letters")
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push("Add numbers")
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push("Add special characters")
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    score = Math.max(0, score - 2)
    feedback.push("Avoid common passwords")
  }

  return {
    score: Math.min(4, score),
    feedback,
    isStrong: score >= 3
  }
}

// Email Validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// URL Validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Webhook Signature Verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    const providedSignature = signature.replace('sha256=', '')
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    )
  } catch {
    return false
  }
}

// Generate secure random string
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Hash sensitive data
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Idempotency key generation
export function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}

// Request fingerprinting for security
export function generateRequestFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || ''
  const acceptLanguage = request.headers.get('accept-language') || ''
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  const ip = request.headers.get('x-forwarded-for') || request.ip || ''
  
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`
  return hashData(fingerprint)
}
