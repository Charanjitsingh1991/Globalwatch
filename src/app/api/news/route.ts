import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { classify } from '@/lib/classifier'
import { RSS_FEEDS } from '@/lib/rssFeeds'
import type { NewsEvent } from '@/types/events'

// NO Redis cache for news — always fetch fresh
// News refreshes every 60 seconds via SWR anyway

interface RSSItem {
  title?: string
  link?: string
  contentSnippet?: string
  isoDate?: string
  pubDate?: string
}

function parseDate(item: RSSItem): Date | null {
  const raw = item.isoDate ?? item.pubDate
  if (!raw) return null
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

async function fetchFeed(name: string, url: string): Promise<NewsEvent[]> {
  try {
    const Parser = (await import('rss-parser')).default
    const parser = new Parser({ timeout: 5000 })
    const feed = await parser.parseURL(url)

    // Only articles from last 6 hours
    const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000)

    const items: NewsEvent[] = []
    for (const item of (feed.items ?? []).slice(0, 20)) {
      const headline = item.title?.trim() ?? ''
      if (!headline) continue

      const pubDate = parseDate(item as RSSItem)

      // Skip if no date or older than 6 hours
      if (!pubDate || pubDate < cutoff) continue

      const desc = item.contentSnippet?.slice(0, 300) ?? ''
      const { severity, category } = classify(headline, desc)

      items.push({
        id: `${name}-${pubDate.getTime()}-${headline.slice(0, 20).replace(/\s/g, '')}`,
        lat: 0,
        lon: 0,
        timestamp: pubDate.toISOString(),
        severity,
        title: headline,
        source: name,
        url: item.link ?? '#',
        summary: desc,
        category,
        tone: 0,
      })
    }
    return items
  } catch {
    return []
  }
}

export async function GET() {
  try {
    // Fetch all 105 feeds in parallel with 5s per feed timeout
    const results = await Promise.allSettled(
      RSS_FEEDS.map((f) => fetchFeed(f.name, f.url))
    )

    const allItems = results
      .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
      // Deduplicate by title
      .reduce((acc: NewsEvent[], item) => {
        const isDup = acc.some(
          (e) => e.title.slice(0, 50).toLowerCase() ===
                 item.title.slice(0, 50).toLowerCase()
        )
        if (!isDup) acc.push(item)
        return acc
      }, [])
      // Sort newest first
      .sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

    logger.info(`News: fetched ${allItems.length} fresh articles`)

    return NextResponse.json({
      data: allItems,
      stale: false,
      baseline: allItems.length === 0,
      timestamp: new Date().toISOString(),
      source: 'rss-aggregator',
      count: allItems.length,
    }, {
      headers: {
        // Tell browser not to cache this response
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    logger.error('News fetch failed', error)
    return NextResponse.json({
      data: [], stale: false, baseline: true,
      timestamp: new Date().toISOString(),
      source: 'rss-aggregator', count: 0,
    })
  }
}
