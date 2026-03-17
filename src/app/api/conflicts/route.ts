import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { fetchACLED, normalizeACLED } from '@/services/conflictService'

const CACHE_KEY = 'globalwatch:conflicts:all'
const TTL = 300

export async function GET() {
  const redis = getRedis()

  try {
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        return NextResponse.json(parsed, {
          headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
        })
      }
    }

    const data = await fetchACLED()

    const result = {
      data,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'acled',
      count: data.length,
    }

    if (redis) {
      await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
    })
  } catch (error) {
    logger.error('Conflict fetch failed', error)

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
      source: 'acled',
      count: 0,
    })
  }
}
