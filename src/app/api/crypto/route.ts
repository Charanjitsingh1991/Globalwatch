import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'globalwatch:crypto:all'
const TTL = 60

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

    const ids = 'bitcoin,ethereum,tether,binancecoin,solana,ripple,usd-coin,cardano,avalanche-2,dogecoin'
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true` 

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`)

    const raw = await res.json()

    const COIN_META: Record<string, { name: string; symbol: string; icon: string }> = {
      bitcoin:       { name: 'Bitcoin',   symbol: 'BTC', icon: '₿' },
      ethereum:      { name: 'Ethereum',  symbol: 'ETH', icon: 'Ξ' },
      tether:        { name: 'Tether',    symbol: 'USDT', icon: '₮' },
      binancecoin:   { name: 'BNB',       symbol: 'BNB', icon: 'B' },
      solana:        { name: 'Solana',    symbol: 'SOL', icon: '◎' },
      ripple:        { name: 'XRP',       symbol: 'XRP', icon: '✕' },
      'usd-coin':    { name: 'USD Coin',  symbol: 'USDC', icon: '$' },
      cardano:       { name: 'Cardano',   symbol: 'ADA', icon: '₳' },
      'avalanche-2': { name: 'Avalanche', symbol: 'AVAX', icon: 'A' },
      dogecoin:      { name: 'Dogecoin',  symbol: 'DOGE', icon: 'Ð' },
    }

    const data = Object.entries(raw).map(([id, values]) => {
      const v = values as { usd: number; usd_24h_change: number; usd_market_cap: number }
      const meta = COIN_META[id] ?? { name: id, symbol: id.toUpperCase(), icon: '?' }
      return {
        id,
        ...meta,
        price: v.usd ?? 0,
        change24h: v.usd_24h_change ?? 0,
        marketCap: v.usd_market_cap ?? 0,
      }
    }).sort((a, b) => b.marketCap - a.marketCap)

    const result = {
      data,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'coingecko',
      count: data.length,
    }

    if (redis) await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate' },
    })
  } catch (error) {
    logger.error('Crypto fetch failed', error)
    return NextResponse.json({
      data: [], stale: false, baseline: true,
      timestamp: new Date().toISOString(),
      source: 'coingecko', count: 0,
    })
  }
}
