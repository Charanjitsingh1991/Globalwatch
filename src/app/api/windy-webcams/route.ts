import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'globalwatch:windy:webcams'
const TTL = 840 // 14 minutes

const LOCATIONS = [
  { name: 'Jerusalem', lat: 31.77, lon: 35.21, radius: 100 },
  { name: 'Tehran', lat: 35.68, lon: 51.38, radius: 150 },
  { name: 'Kyiv', lat: 50.45, lon: 30.52, radius: 200 },
  { name: 'Damascus', lat: 33.51, lon: 36.29, radius: 150 },
  { name: 'Baghdad', lat: 33.34, lon: 44.40, radius: 150 },
  { name: 'Karachi', lat: 24.86, lon: 67.01, radius: 100 },
  { name: 'Kabul', lat: 34.52, lon: 69.17, radius: 100 },
  { name: 'Khartoum', lat: 15.55, lon: 32.53, radius: 200 },
  { name: 'Sanaa', lat: 15.35, lon: 44.20, radius: 150 },
  { name: 'Naypyidaw', lat: 19.76, lon: 96.07, radius: 200 },
  { name: 'Taipei', lat: 25.03, lon: 121.56, radius: 100 },
  { name: 'Seoul', lat: 37.56, lon: 126.97, radius: 100 },
  { name: 'Tripoli', lat: 32.90, lon: 13.18, radius: 150 },
  { name: 'Caracas', lat: 10.48, lon: -66.87, radius: 100 },
  { name: 'Port-au-Prince', lat: 18.54, lon: -72.33, radius: 100 },
  { name: 'Moscow', lat: 55.75, lon: 37.61, radius: 100 },
  { name: 'Beijing', lat: 39.90, lon: 116.40, radius: 100 },
]

interface WindyWebcam {
  id: string
  title: string
  status: string
  viewCount: number
  location: {
    city: string
    country: string
    latitude: number
    longitude: number
    timezone: string
  }
  image: {
    current: {
      preview: string
      icon: string
    }
  }
  player: {
    day: {
      embed: string
    }
  }
  urls: {
    detail: string
  }
}

interface WindyResponse {
  result: {
    webcams: WindyWebcam[]
    total: number
    limit: number
    offset: number
  }
}

async function fetchNearbyWebcams(
  apiKey: string,
  loc: typeof LOCATIONS[0]
): Promise<WindyWebcam[]> {
  const url = new URL(`https://api.windy.com/webcams/api/v3/webcams/nearby/${loc.lat},${loc.lon}/${loc.radius}`)
  url.searchParams.set('lang', 'en')
  url.searchParams.set('limit', '5')
  url.searchParams.set('show', 'webcams:location,image,player,urls')

  const res = await fetch(url.toString(), {
    headers: {
      'x-windy-api-key': apiKey,
      'Accept': 'application/json',
      'User-Agent': 'GlobalWatch/1.0',
    },
    signal: AbortSignal.timeout(15000),
    // @ts-ignore
    cache: 'no-store',
  })

  if (!res.ok) {
    logger.warn(`Windy loc ${loc.name} failed: ${res.status}`)
    return []
  }

  const data: WindyResponse = await res.json()
  return (data?.result?.webcams ?? []).filter(cam => cam.status === 'active')
}

export interface WindyWebcamEvent {
  id: string
  lat: number
  lon: number
  title: string
  city: string
  country: string
  zone: string
  previewUrl: string
  iconUrl: string
  embedUrl: string
  detailUrl: string
  viewCount: number
}

function normalize(
  cam: WindyWebcam,
  zone: string
): WindyWebcamEvent | null {
  const lat = cam.location?.latitude
  const lon = cam.location?.longitude
  if (!lat || !lon) return null

  return {
    id: cam.id,
    lat,
    lon,
    title: cam.title ?? 'Live Webcam',
    city: cam.location?.city ?? '',
    country: cam.location?.country ?? '',
    zone,
    previewUrl: cam.image?.current?.preview ?? '',
    iconUrl: cam.image?.current?.icon ?? '',
    embedUrl: cam.player?.day?.embed ?? '',
    detailUrl: cam.urls?.detail ?? '',
    viewCount: cam.viewCount ?? 0,
  }
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.WINDY_WEBCAMS_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      data: [], baseline: true,
      timestamp: new Date().toISOString(),
      source: 'windy', count: 0,
    })
  }

  const redis = getRedis()

  try {
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const parsed = typeof cached === 'string'
          ? JSON.parse(cached) : cached
        return NextResponse.json(parsed, {
          headers: { 'Cache-Control': 'no-store' },
        })
      }
    }

    const batches: typeof LOCATIONS[] = []
    for (let i = 0; i < LOCATIONS.length; i += 4) {
      batches.push(LOCATIONS.slice(i, i + 4) as typeof LOCATIONS)
    }

    const allCams: WindyWebcamEvent[] = []

    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map(loc => fetchNearbyWebcams(apiKey, loc))
      )
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const loc = batch[i]!
          result.value.forEach(cam => {
            const normalized = normalize(cam, loc.name)
            if (normalized) {
              if (!allCams.find(c => c.id === normalized.id)) {
                allCams.push(normalized)
              }
            }
          })
        }
      })
      await new Promise(r => setTimeout(r, 200))
    }

    logger.info(`Windy: fetched ${allCams.length} webcams from ${LOCATIONS.length} locations`)

    const result = {
      data: allCams,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'windy',
      count: allCams.length,
    }

    if (redis) {
      await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    logger.error('Windy webcams failed', error)
    return NextResponse.json({
      data: [], stale: false, baseline: true,
      timestamp: new Date().toISOString(),
      source: 'windy', count: 0,
    })
  }
}
