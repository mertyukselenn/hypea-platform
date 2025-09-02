// Simple in-memory cache implementation
// In production, use Redis or similar

interface CacheEntry<T> {
  data: T
  expiresAt: number
  tags?: string[]
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private tagIndex = new Map<string, Set<string>>()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return null
    }
    
    return entry.data
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300, tags?: string[]): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    
    this.cache.set(key, {
      data,
      expiresAt,
      tags
    })
    
    // Update tag index
    if (tags) {
      tags.forEach(tag => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set())
        }
        this.tagIndex.get(tag)!.add(key)
      })
    }
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (entry?.tags) {
      // Remove from tag index
      entry.tags.forEach(tag => {
        const tagSet = this.tagIndex.get(tag)
        if (tagSet) {
          tagSet.delete(key)
          if (tagSet.size === 0) {
            this.tagIndex.delete(tag)
          }
        }
      })
    }
    
    return this.cache.delete(key)
  }

  invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag)
    
    if (!keys) {
      return 0
    }
    
    let deletedCount = 0
    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++
      }
    })
    
    return deletedCount
  }

  clear(): void {
    this.cache.clear()
    this.tagIndex.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now()
    let deletedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.delete(key)
        deletedCount++
      }
    }
    
    return deletedCount
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++
      } else {
        active++
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired,
      tags: this.tagIndex.size
    }
  }
}

// Global cache instance
export const cache = new MemoryCache()

// Cache utility functions
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300,
  tags?: string[]
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  const data = await fetcher()
  
  // Store in cache
  cache.set(key, data, ttlSeconds, tags)
  
  return data
}

export function invalidateCache(keyOrTag: string, isTag: boolean = false): number {
  if (isTag) {
    return cache.invalidateByTag(keyOrTag)
  } else {
    return cache.delete(keyOrTag) ? 1 : 0
  }
}

// Cache decorators
export function cached(ttlSeconds: number = 300, tags?: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`
      
      return getCachedData(
        cacheKey,
        () => originalMethod.apply(this, args),
        ttlSeconds,
        tags
      )
    }
    
    return descriptor
  }
}

// Specific cache functions for common use cases
export const userCache = {
  get: (userId: string) => cache.get(`user:${userId}`),
  set: (userId: string, user: any, ttl = 900) => 
    cache.set(`user:${userId}`, user, ttl, ['users']),
  delete: (userId: string) => cache.delete(`user:${userId}`),
  invalidateAll: () => cache.invalidateByTag('users')
}

export const productCache = {
  get: (productId: string) => cache.get(`product:${productId}`),
  set: (productId: string, product: any, ttl = 1800) => 
    cache.set(`product:${productId}`, product, ttl, ['products']),
  delete: (productId: string) => cache.delete(`product:${productId}`),
  invalidateAll: () => cache.invalidateByTag('products')
}

export const newsCache = {
  get: (newsId: string) => cache.get(`news:${newsId}`),
  set: (newsId: string, news: any, ttl = 3600) => 
    cache.set(`news:${newsId}`, news, ttl, ['news']),
  delete: (newsId: string) => cache.delete(`news:${newsId}`),
  invalidateAll: () => cache.invalidateByTag('news')
}

// Start cleanup interval
if (typeof window === 'undefined') {
  // Only run cleanup on server
  setInterval(() => {
    const deleted = cache.cleanup()
    if (deleted > 0) {
      console.log(`Cache cleanup: removed ${deleted} expired entries`)
    }
  }, 60000) // Cleanup every minute
}

// Next.js revalidation helpers
export function revalidateTag(tag: string) {
  // In Next.js 13+, you would use revalidateTag from 'next/cache'
  // For now, we'll use our cache invalidation
  return invalidateCache(tag, true)
}

export function revalidatePath(path: string) {
  // In Next.js 13+, you would use revalidatePath from 'next/cache'
  // For now, we'll invalidate related cache entries
  return invalidateCache(`path:${path}`)
}
