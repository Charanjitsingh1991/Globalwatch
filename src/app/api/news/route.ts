import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { RSS_FEEDS } from '@/lib/rssFeeds'
import { classify } from '@/lib/classifier'
import type { NewsEvent } from '@/types/events'

const CACHE_KEY = 'globalwatch:news:all'
const TTL = 180

interface RSSItem {
  title?: string
  link?: string
  contentSnippet?: string
  isoDate?: string
  pubDate?: string
  creator?: string
}

async function fetchFeed(name: string, url: string): Promise<NewsEvent[]> {
  try {
    const Parser = (await import('rss-parser')).default
    const parser = new Parser({ timeout: 5000 })
    const feed = await parser.parseURL(url)

    return (feed.items ?? []).slice(0, 10).map((item: RSSItem, i: number): NewsEvent => {
      const headline = item.title ?? ''
      const desc = item.contentSnippet ?? ''
      const { severity, category, confidence } = classify(headline, desc)

      return {
        id: `${name}-${i}-${Date.now()}`,
        lat: 0,
        lon: 0,
        timestamp: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        severity,
        title: headline,
        source: name,
        url: item.link ?? '#',
        summary: desc.slice(0, 200),
        category,
        tone: confidence,
      }
    })
  } catch {
    return []
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
          headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
        })
      }
    }

    const results = await Promise.allSettled(
      RSS_FEEDS.map((f) => fetchFeed(f.name, f.url))
    )

    const allItems = results
      .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 200)

    const result = {
      data: allItems,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'rss-aggregator',
      count: allItems.length,
    }

    if (redis) await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' },
    })
  } catch (error) {
    logger.error('News fetch failed', error)

    if (redis) {
      const stale = await redis.get(CACHE_KEY)
      if (stale) {
        const parsed = typeof stale === 'string' ? JSON.parse(stale) : stale
        return NextResponse.json({ ...parsed, stale: true })
      }
    }

    return NextResponse.json({
      data: [], stale: false, baseline: true,
      timestamp: new Date().toISOString(),
      source: 'rss-aggregator', count: 0,
    })
  }
}
