import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { fetchFires } from '@/services/firmsService'

const CACHE_KEY = 'globalwatch:fires:all'
const TTL = 600

export async function GET() {
  const redis = getRedis()

  try {
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        return NextResponse.json(parsed, {
          headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate' },
        })
      }
    }

    const data = await fetchFires()

    const result = {
      data,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'nasa-firms',
      count: data.length,
    }

    if (redis) {
      await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate' },
    })
  } catch (error) {
    logger.error('Fires fetch failed', error)

    if (redis) {
      const stale = await redis.get(CACHE_KEY)
      if (stale) {
        const parsed = typeof stale === 'string' ? JSON.parse(stale) : stale
        return NextResponse.json({ ...parsed, stale: true })
      }
    }

    return NextResponse.json({
      data: [],
      stale: false,
      baseline: true,
      timestamp: new Date().toISOString(),
      source: 'nasa-firms',
      count: 0,
    })
  }
}
