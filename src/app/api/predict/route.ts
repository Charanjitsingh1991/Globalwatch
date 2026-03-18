import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'globalwatch:predict:all'
const TTL = 300

interface PolymarketEvent {
  id: string
  question: string
  end_date_iso: string
  volume: number
  outcomes: string
  outcomePrices: string
  category?: string
}

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

    // Polymarket Gamma API — public, no key required
    const url = 'https://gamma-api.polymarket.com/events?active=true&closed=false&limit=50&tag_slug=politics'
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`Polymarket responded ${res.status}`)
    const raw = await res.json()

    const events = Array.isArray(raw) ? raw : (raw.events ?? raw.data ?? [])

    const normalized = events
      .filter((e: PolymarketEvent) => e.question && e.volume > 1000)
      .slice(0, 20)
      .map((e: PolymarketEvent) => {
        let yesProb = 50
        try {
          const prices = JSON.parse(e.outcomePrices ?? '["0.5","0.5"]')
          yesProb = Math.round(parseFloat(prices[0]) * 100)
        } catch { /* use default */ }

        return {
          id: e.id,
          question: e.question,
          yesProb,
          noProb: 100 - yesProb,
          volume: e.volume ?? 0,
          endDate: e.end_date_iso ?? '',
          category: e.category ?? 'politics',
        }
      })
      .sort((a: { volume: number }, b: { volume: number }) => b.volume - a.volume)

    const result = {
      data: normalized,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'polymarket',
      count: normalized.length,
    }

    if (redis) await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
    })
  } catch (error) {
    logger.error('Prediction markets fetch failed', error)
    return NextResponse.json({
      data: [], stale: false, baseline: true,
      timestamp: new Date().toISOString(),
      source: 'polymarket', count: 0,
    })
  }
}
