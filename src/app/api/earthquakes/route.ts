import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { fetchEarthquakes, normalizeUSGS } from '@/services/usgsService'

const CACHE_KEY = 'globalwatch:earthquakes:all'
const TTL = 120

export async function GET() {
  const redis = getRedis()

  try {
    // 1. Check cache first
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        return NextResponse.json(parsed, {
          headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
        })
      }
    }

    // 2. Fetch fresh from USGS
    const data = await fetchEarthquakes()

    const result = {
      data,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'usgs',
      count: data.length,
    }

    // 3. Cache result
    if (redis) {
      await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
    })
  } catch (error) {
    logger.error('Earthquake fetch failed', error)

    // 4. Try stale cache
    if (redis) {
      const stale = await redis.get(CACHE_KEY)
      if (stale) {
        const parsed = typeof stale === 'string' ? JSON.parse(stale) : stale
        return NextResponse.json({ ...parsed, stale: true })
      }
    }

    // 5. Baseline fallback
    return NextResponse.json({
      data: [],
      stale: false,
      baseline: true,
      timestamp: new Date().toISOString(),
      source: 'usgs',
      count: 0,
    })
  }
}
