import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'globalwatch:markets:all'
const TTL = 60

interface MarketItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  type: 'index' | 'commodity' | 'forex' | 'crypto'
}

async function fetchYahooQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d` 
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta) return null
    const price = meta.regularMarketPrice ?? 0
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price
    const change = price - prevClose
    const changePercent = prevClose ? (change / prevClose) * 100 : 0
    return { price, change, changePercent }
  } catch {
    return null
  }
}

export async function GET() {
  const redis = getRedis()

  try {
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        return NextResponse.json(parsed, {
          headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate' },
        })
      }
    }

    const SYMBOLS: Omit<MarketItem, 'price' | 'change' | 'changePercent'>[] = [
      { symbol: '^GSPC',   name: 'S&P 500',     type: 'index' },
      { symbol: '^DJI',    name: 'Dow Jones',    type: 'index' },
      { symbol: '^IXIC',   name: 'NASDAQ',       type: 'index' },
      { symbol: '^FTSE',   name: 'FTSE 100',     type: 'index' },
      { symbol: '^N225',   name: 'Nikkei 225',   type: 'index' },
      { symbol: 'CL=F',    name: 'Crude Oil',    type: 'commodity' },
      { symbol: 'GC=F',    name: 'Gold',         type: 'commodity' },
      { symbol: 'SI=F',    name: 'Silver',       type: 'commodity' },
      { symbol: 'NG=F',    name: 'Nat. Gas',     type: 'commodity' },
      { symbol: 'EURUSD=X', name: 'EUR/USD',     type: 'forex' },
      { symbol: 'GBPUSD=X', name: 'GBP/USD',     type: 'forex' },
      { symbol: 'USDJPY=X', name: 'USD/JPY',     type: 'forex' },
      { symbol: 'USDRUB=X', name: 'USD/RUB',     type: 'forex' },
    ]

    const results = await Promise.allSettled(
      SYMBOLS.map((s) => fetchYahooQuote(s.symbol))
    )

    const data: MarketItem[] = SYMBOLS.map((s, i) => {
      const r = results[i]
      const quote = r.status === 'fulfilled' ? r.value : null
      return {
        ...s,
        price: quote?.price ?? 0,
        change: quote?.change ?? 0,
        changePercent: quote?.changePercent ?? 0,
      }
    })

    const result = {
      data,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'yahoo-finance',
      count: data.length,
    }

    if (redis) await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate' },
    })
  } catch (error) {
    logger.error('Markets fetch failed', error)
    return NextResponse.json({
      data: [], stale: false, baseline: true,
      timestamp: new Date().toISOString(),
      source: 'yahoo-finance', count: 0,
    })
  }
}
