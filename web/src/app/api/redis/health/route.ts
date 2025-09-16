import { NextResponse } from 'next/server'
import { createClient } from 'redis'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Redis client configuration
const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  return createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 5000,
    },
  })
}

export async function GET() {
  let client
  
  try {
    client = getRedisClient()
    
    // Test connection with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ])
    
    // Test basic operation
    const pong = await client.ping()
    
    if (pong !== 'PONG') {
      throw new Error('Redis ping failed')
    }
    
    // Get Redis info
    const info = await client.info()
    const lines = info.split('\r\n')
    const redisInfo: Record<string, string> = {}
    
    lines.forEach(line => {
      if (line.includes(':') && !line.startsWith('#')) {
        const [key, value] = line.split(':')
        redisInfo[key] = value
      }
    })
    
    return NextResponse.json({
      status: 'healthy',
      connected: true,
      redis_version: redisInfo.redis_version || 'unknown',
      used_memory: redisInfo.used_memory_human || 'unknown',
      connected_clients: parseInt(redisInfo.connected_clients) || 0,
      uptime_seconds: parseInt(redisInfo.uptime_in_seconds) || 0,
      total_keys: redisInfo.db0 ? parseInt(redisInfo.db0.split('keys=')[1]?.split(',')[0]) || 0 : 0,
      timestamp: new Date().toISOString(),
      service: 'redis'
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        connected: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        service: 'redis'
      },
      { status: 503 }
    )
  } finally {
    // Clean up connection
    if (client) {
      try {
        await client.quit()
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}