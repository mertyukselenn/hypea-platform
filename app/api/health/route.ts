import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cache } from "@/lib/cache"

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    // Check cache
    const cacheStats = cache.getStats()
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        cache: 'healthy'
      },
      metrics: {
        responseTime: `${responseTime}ms`,
        cache: cacheStats
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: error instanceof Error ? 'unhealthy' : 'unknown',
        cache: 'unknown'
      },
      metrics: {
        responseTime: `${responseTime}ms`
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}
