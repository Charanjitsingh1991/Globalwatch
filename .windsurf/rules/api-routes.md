# Rules — API Routes

## Applies To
All files in `src/app/api/`

---

## Required Imports (every route)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
```

---

## Required Response Shape
```typescript
interface ApiResponse<T> {
  data: T[]
  stale: boolean        // true = data from cache, upstream failed
  baseline: boolean     // true = no cache exists, returning empty
  timestamp: string     // ISO 8601 — when data was fetched
  source: string        // e.g. "usgs", "acled", "opensky"
  count: number
}
```

---

## Circuit Breaker Template
```typescript
export async function GET(request: NextRequest) {
  const cacheKey = 'globalwatch:SOURCE_NAME:all'
  const TTL = 120 // seconds

  try {
    // 1. Try Redis cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached as string), {
        headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' }
      })
    }

    // 2. Fetch from upstream
    const response = await fetch('UPSTREAM_URL', {
      next: { revalidate: TTL },
      signal: AbortSignal.timeout(8000) // 8 second timeout
    })

    if (!response.ok) throw new Error(`Upstream ${response.status}`)

    const raw = await response.json()

    // 3. Normalize to internal type
    const data = normalizeData(raw)

    // 4. Build response
    const result: ApiResponse<typeof data[0]> = {
      data,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'SOURCE_NAME',
      count: data.length
    }

    // 5. Cache in Redis
    await redis.set(cacheKey, JSON.stringify(result), { ex: TTL })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' }
    })

  } catch (error) {
    logger.error('SOURCE_NAME fetch failed', error)

    // 6. Try stale cache
    const stale = await redis.get(cacheKey)
    if (stale) {
      const staleData = JSON.parse(stale as string)
      return NextResponse.json({ ...staleData, stale: true })
    }

    // 7. Baseline fallback
    return NextResponse.json({
      data: [],
      stale: false,
      baseline: true,
      timestamp: new Date().toISOString(),
      source: 'SOURCE_NAME',
      count: 0
    })
  }
}
```

---

## Rate Limiting
- Add rate limiting header check on expensive routes (intel-brief, classify-news)
- Use Upstash Redis rate limiter for AI routes: max 10 req/min per IP

---

## CORS
- All API routes are internal — no CORS headers needed
- RSS proxy routes need `Access-Control-Allow-Origin: *` for potential external use

---

## Validation
- Validate all query params with Zod before using them
- Reject requests with invalid params: return 400 with error message
- Never trust upstream data shape — always validate before normalizing
