import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'globalwatch:windy:webcams'
const TTL = 900

const CRISIS_ZONES = [
  { name: 'Gaza/Israel',        box: [29.0,  33.0,  33.5,  36.5]  },
  { name: 'Ukraine East',       box: [46.0,  30.0,  52.0,  40.0]  },
  { name: 'Ukraine West',       box: [48.0,  22.0,  52.0,  32.0]  },
  { name: 'Syria/Lebanon',      box: [32.0,  35.0,  37.5,  42.0]  },
  { name: 'Iraq',               box: [29.0,  38.0,  37.5,  48.0]  },
  { name: 'Iran',               box: [29.0,  44.0,  39.0,  63.0]  },
  { name: 'Pakistan/Afghan',    box: [23.0,  60.0,  37.0,  75.0]  },
  { name: 'Sudan/Sahel',        box: [8.0,   22.0,  22.0,  38.0]  },
  { name: 'Yemen/Red Sea',      box: [12.0,  42.0,  18.0,  55.0]  },
  { name: 'Myanmar',            box: [16.0,  92.0,  28.0, 101.0]  },
  { name: 'Taiwan Strait',      box: [22.0, 118.0,  27.0, 122.0]  },
  { name: 'South China Sea',    box: [5.0,  108.0,  22.0, 120.0]  },
  { name: 'Korea Peninsula',    box: [34.0, 124.0,  42.0, 130.0]  },
  { name: 'Ethiopia/Horn',      box: [3.0,   33.0,  15.0,  45.0]  },
  { name: 'Libya',              box: [19.0,  10.0,  33.0,  25.0]  },
  { name: 'Venezuela',          box: [0.0,  -73.0,  12.0, -59.0]  },
  { name: 'Haiti',              box: [17.5, -74.5,  20.5, -71.5]  },
  { name: 'Moscow',             box: [55.0,  36.0,  56.5,  38.5]  },
  { name: 'Beijing',            box: [39.5, 115.5,  40.5, 117.0]  },
  { name: 'Washington DC',      box: [38.5, -77.5,  39.2, -76.5]  },
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

async function fetchZoneWebcams(
  apiKey: string,
  zone: typeof CRISIS_ZONES[0]
): Promise<WindyWebcam[]> {
  const [latMin, lonMin, latMax, lonMax] = zone.box
  const url = new URL('https://api.windy.com/webcams/api/v3/webcams')
  url.searchParams.set('lang', 'en')
  url.searchParams.set('limit', '10')
  url.searchParams.set('offset', '0')
  url.searchParams.set('show', 'webcams:location,image,player,urls')
  url.searchParams.set(
    'bbox',
    `${latMin},${lonMin},${latMax},${lonMax}` 
  )

  const res = await fetch(url.toString(), {
    headers: {
      'x-windy-api-key': apiKey,
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    logger.warn(`Windy zone ${zone.name} failed: ${res.status}`)
    return []
  }

  const data: WindyResponse = await res.json()
  return data?.result?.webcams ?? []
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

    const batches: typeof CRISIS_ZONES[] = []
    for (let i = 0; i < CRISIS_ZONES.length; i += 4) {
      batches.push(CRISIS_ZONES.slice(i, i + 4) as typeof CRISIS_ZONES)
    }

    const allCams: WindyWebcamEvent[] = []

    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map(zone => fetchZoneWebcams(apiKey, zone))
      )
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const zone = batch[i]!
          result.value.forEach(cam => {
            const normalized = normalize(cam, zone.name)
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

    logger.info(`Windy: fetched ${allCams.length} webcams from ${CRISIS_ZONES.length} zones`)

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
