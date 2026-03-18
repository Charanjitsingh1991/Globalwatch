import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'globalwatch:windy:webcams:v5'
const TTL = 840

export interface WindyWebcamEvent {
  id: string
  lat: number
  lon: number
  title: string
  city: string
  country: string
  countryCode: string
  zone: string
  status: string
  previewUrl: string
  iconUrl: string
  thumbnailUrl: string
  playerLiveUrl: string
  playerDayUrl: string
  detailUrl: string
  viewCount: number
}

interface WindyCam {
  webcamId: number
  title: string
  status: string
  viewCount: number
  clusterSize?: number
  location?: {
    city?: string
    country?: string
    country_code?: string
    latitude: number
    longitude: number
  }
  images?: {
    current?: {
      preview?: string
      icon?: string
      thumbnail?: string
    }
  }
  player?: {
    live?: string
    day?: string
    month?: string
  }
  urls?: {
    detail?: string
  }
}

function normalizeCam(
  cam: WindyCam,
  zoneName: string
): WindyWebcamEvent | null {
  const lat = cam.location?.latitude
  const lon = cam.location?.longitude
  if (!lat || !lon) return null

  return {
    id: String(cam.webcamId),
    lat,
    lon,
    title: cam.title ?? 'Live Webcam',
    city: cam.location?.city ?? '',
    country: cam.location?.country ?? '',
    countryCode: cam.location?.country_code ?? '',
    zone: zoneName,
    status: cam.status ?? 'active',
    previewUrl: cam.images?.current?.preview ?? '',
    iconUrl: cam.images?.current?.icon ?? '',
    thumbnailUrl: cam.images?.current?.thumbnail ?? '',
    playerLiveUrl: cam.player?.live ?? '',
    playerDayUrl: cam.player?.day ?? '',
    detailUrl: cam.urls?.detail ?? '',
    viewCount: cam.viewCount ?? 0,
  }
}

// Fetch webcams using NEARBY param (correct format)
async function fetchNearby(
  apiKey: string,
  lat: number,
  lon: number,
  radiusKm: number,
  zoneName: string,
  limit = 10
): Promise<WindyWebcamEvent[]> {
  try {
    // Correct nearby format: lat,lon,radius
    const params = new URLSearchParams({
      lang: 'en',
      limit: String(Math.min(limit, 50)),
      offset: '0',
      nearby: `${lat},${lon},${radiusKm}`,
    })
    // include must be appended multiple times
    ;['location', 'images', 'player', 'urls'].forEach(v =>
      params.append('include', v)
    )

    const url = `https://api.windy.com/webcams/api/v3/webcams?${params}`
    const res = await fetch(url, {
      headers: {
        'x-windy-api-key': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'GlobalWatch/1.0',
      },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    })

    if (!res.ok) {
      const body = await res.text()
      logger.warn(`Windy nearby ${zoneName}: ${res.status} ${body.slice(0,100)}`)
      return []
    }

    const data = await res.json() as { webcams: WindyCam[] }
    return (data.webcams ?? [])
      .filter(c => c.location?.latitude && c.location?.longitude)
      .filter(c => c.status === 'active')
      .map(c => normalizeCam(c, zoneName))
      .filter((c): c is WindyWebcamEvent => c !== null)

  } catch (err) {
    logger.warn(`Windy nearby ${zoneName}: ${String(err)}`)
    return []
  }
}

// Fetch webcams by country codes
async function fetchByCountries(
  apiKey: string,
  countryCodes: string[],
  zoneName: string,
  limit = 50
): Promise<WindyWebcamEvent[]> {
  try {
    const params = new URLSearchParams({
      lang: 'en',
      limit: String(Math.min(limit, 50)),
      offset: '0',
    })
    countryCodes.forEach(c => params.append('countries', c))
    ;['location', 'images', 'player', 'urls'].forEach(v =>
      params.append('include', v)
    )

    const url = `https://api.windy.com/webcams/api/v3/webcams?${params}`
    const res = await fetch(url, {
      headers: {
        'x-windy-api-key': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'GlobalWatch/1.0',
      },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    })

    if (!res.ok) return []
    const data = await res.json() as { webcams: WindyCam[] }
    return (data.webcams ?? [])
      .filter(c => c.location?.latitude && c.location?.longitude)
      .filter(c => c.status === 'active')
      .map(c => normalizeCam(c, zoneName))
      .filter((c): c is WindyWebcamEvent => c !== null)

  } catch (err) {
    logger.warn(`Windy countries ${zoneName}: ${String(err)}`)
    return []
  }
}

export async function GET() {
  const apiKey = process.env.WINDY_WEBCAMS_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      data: [], baseline: true, stale: false,
      timestamp: new Date().toISOString(),
      source: 'windy', count: 0,
    })
  }

  const redis = getRedis()

  try {
    // Check cache
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const parsed = typeof cached === 'string'
          ? JSON.parse(cached) : cached
        logger.info('Windy: serving from cache')
        return NextResponse.json(parsed, {
          headers: { 'Cache-Control': 'no-store' },
        })
      }
    }

    const allCams: WindyWebcamEvent[] = []
    const seen = new Set<string>()

    const addCams = (cams: WindyWebcamEvent[]) => {
      cams.forEach(cam => {
        if (!seen.has(cam.id)) {
          seen.add(cam.id)
          allCams.push(cam)
        }
      })
    }

    // Crisis/conflict zone locations with nearby radius
    const nearbyLocations = [
      // Middle East
      { label: 'Jerusalem/Gaza', lat: 31.50, lon: 34.80, r: 150 },
      { label: 'Tel Aviv',       lat: 32.08, lon: 34.78, r: 50  },
      { label: 'Tehran',         lat: 35.68, lon: 51.38, r: 150 },
      { label: 'Damascus',       lat: 33.51, lon: 36.29, r: 150 },
      { label: 'Baghdad',        lat: 33.34, lon: 44.40, r: 150 },
      { label: 'Beirut',         lat: 33.88, lon: 35.50, r: 80  },
      { label: 'Mecca',          lat: 21.42, lon: 39.83, r: 80  },
      { label: 'Istanbul',       lat: 41.01, lon: 28.97, r: 80  },
      // Europe/Ukraine
      { label: 'Kyiv',           lat: 50.45, lon: 30.52, r: 150 },
      { label: 'Kharkiv',        lat: 49.99, lon: 36.23, r: 100 },
      { label: 'Odessa',         lat: 46.47, lon: 30.73, r: 100 },
      { label: 'Moscow',         lat: 55.75, lon: 37.61, r: 80  },
      // South/East Asia
      { label: 'Karachi',        lat: 24.86, lon: 67.01, r: 100 },
      { label: 'Kabul',          lat: 34.52, lon: 69.17, r: 150 },
      { label: 'Taipei',         lat: 25.03, lon: 121.56,r: 80  },
      { label: 'Seoul',          lat: 37.56, lon: 126.97,r: 80  },
      { label: 'Beijing',        lat: 39.90, lon: 116.40,r: 80  },
      // Africa
      { label: 'Khartoum',       lat: 15.55, lon: 32.53, r: 200 },
      { label: 'Mogadishu',      lat: 2.05,  lon: 45.34, r: 200 },
      { label: 'Nairobi',        lat: -1.28, lon: 36.82, r: 100 },
      // Americas
      { label: 'Caracas',        lat: 10.48, lon: -66.87,r: 100 },
      { label: 'Port-au-Prince', lat: 18.54, lon: -72.33,r: 100 },
    ]

    // Process in batches of 5
    for (let i = 0; i < nearbyLocations.length; i += 5) {
      const batch = nearbyLocations.slice(i, i + 5)
      const results = await Promise.allSettled(
        batch.map(loc =>
          fetchNearby(apiKey, loc.lat, loc.lon, loc.r, loc.label, 10)
        )
      )
      results.forEach(r => {
        if (r.status === 'fulfilled') addCams(r.value)
      })
      if (i + 5 < nearbyLocations.length) {
        await new Promise(resolve => setTimeout(resolve, 250))
      }
    }

    // Also fetch by crisis countries for broader coverage
    const crisisCountries = [
      ['IL', 'PS'],          // Israel + Palestine
      ['UA', 'BY'],          // Ukraine + Belarus
      ['SY', 'IQ', 'LB'],   // Syria, Iraq, Lebanon
      ['IR', 'YE', 'AF'],   // Iran, Yemen, Afghanistan
      ['PK', 'MM', 'SD'],   // Pakistan, Myanmar, Sudan
      ['TW', 'KP', 'LY'],   // Taiwan, N.Korea, Libya
    ]

    for (const group of crisisCountries) {
      const cams = await fetchByCountries(
        apiKey, group, group.join('/'), 20
      )
      addCams(cams)
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    logger.info(`Windy: fetched ${allCams.length} total webcams`)

    const result = {
      data: allCams,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'windy',
      count: allCams.length,
    }

    if (redis && allCams.length > 0) {
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
