import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'globalwatch:windy:webcams:v4'
const TTL = 840 // 14 minutes

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
  playerLiveUrl: string
  playerDayUrl: string
  detailUrl: string
  viewCount: number
}

interface WindyCamImage {
  current?: {
    preview?: string
    icon?: string
  }
}

interface WindyCam {
  webcamId: number
  title: string
  status: string
  viewCount: number
  lastUpdatedOn: string
  location?: {
    city: string
    country: string
    country_code: string
    latitude: number
    longitude: number
  }
  images?: WindyCamImage
  player?: {
    live?: string
    day?: string
    month?: string
  }
  urls?: {
    detail?: string
  }
}

interface WindyResponse {
  total: number
  webcams: WindyCam[]
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
    status: cam.status ?? 'unknown',
    previewUrl: cam.images?.current?.preview ?? '',
    iconUrl: cam.images?.current?.icon ?? '',
    playerLiveUrl: cam.player?.live ?? '',
    playerDayUrl: cam.player?.day ?? '',
    detailUrl: cam.urls?.detail ?? '',
    viewCount: cam.viewCount ?? 0,
  }
}

async function fetchWebcams(
  apiKey: string,
  params: Record<string, string | string[]>,
  zoneName: string
): Promise<WindyWebcamEvent[]> {
  try {
    const url = new URL('https://api.windy.com/webcams/api/v3/webcams')

    // Add all params — handle arrays
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v))
      } else {
        url.searchParams.set(key, value)
      }
    })

    // Always add these
    url.searchParams.set('lang', 'en')
    url.searchParams.set('limit', '50')
    url.searchParams.set('offset', '0')

    // Correct include format from docs
    ;['location', 'images', 'player', 'urls'].forEach(inc => {
      url.searchParams.append('include', inc)
    })

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-windy-api-key': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'GlobalWatch/1.0',
      },
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    })

    if (!res.ok) {
      const body = await res.text()
      logger.warn(`Windy ${zoneName}: HTTP ${res.status} — ${body.slice(0, 200)}`)
      return []
    }

    const data: WindyResponse = await res.json()
    return (data.webcams ?? [])
      .filter(c => c.location?.latitude && c.location?.longitude)
      .filter(c => c.status === 'active')
      .map(c => normalizeCam(c, zoneName))
      .filter((c): c is WindyWebcamEvent => c !== null)

  } catch (err) {
    logger.warn(`Windy ${zoneName} error: ${String(err)}`)
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

    function addCams(cams: WindyWebcamEvent[]) {
      cams.forEach(cam => {
        if (!seen.has(cam.id)) {
          seen.add(cam.id)
          allCams.push(cam)
        }
      })
    }

    // STRATEGY 1: Use NEARBY param (correct format: lat,lon,radius)
    // for key conflict/crisis locations
    const nearbyLocations = [
      { label: 'Gaza/Israel',     lat: 31.50, lon: 34.80, radius: 150 },
      { label: 'Kyiv Ukraine',    lat: 50.45, lon: 30.52, radius: 200 },
      { label: 'Kharkiv Ukraine', lat: 49.99, lon: 36.23, radius: 150 },
      { label: 'Damascus Syria',  lat: 33.51, lon: 36.29, radius: 200 },
      { label: 'Tehran Iran',     lat: 35.68, lon: 51.38, radius: 150 },
      { label: 'Baghdad Iraq',    lat: 33.34, lon: 44.40, radius: 150 },
      { label: 'Karachi Pakistan',lat: 24.86, lon: 67.01, radius: 150 },
      { label: 'Taipei Taiwan',   lat: 25.03, lon: 121.56,radius: 100 },
      { label: 'Seoul Korea',     lat: 37.56, lon: 126.97,radius: 100 },
      { label: 'Khartoum Sudan',  lat: 15.55, lon: 32.53, radius: 200 },
      { label: 'Mogadishu',       lat: 2.05,  lon: 45.34, radius: 200 },
      { label: 'Tripoli Libya',   lat: 32.90, lon: 13.18, radius: 200 },
      { label: 'Caracas Venez',   lat: 10.48, lon: -66.87,radius: 150 },
      { label: 'Moscow Russia',   lat: 55.75, lon: 37.61, radius: 100 },
      { label: 'Beijing China',   lat: 39.90, lon: 116.40,radius: 100 },
    ]

    // Process nearby in batches of 4
    for (let i = 0; i < nearbyLocations.length; i += 4) {
      const batch = nearbyLocations.slice(i, i + 4)
      const results = await Promise.allSettled(
        batch.map(loc =>
          fetchWebcams(
            apiKey,
            // CORRECT format from docs: lat,lon,radius
            { nearby: `${loc.lat},${loc.lon},${loc.radius}` },
            loc.label
          )
        )
      )
      results.forEach(r => {
        if (r.status === 'fulfilled') addCams(r.value)
      })
      if (i + 4 < nearbyLocations.length) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    // STRATEGY 2: Use COUNTRIES filter for crisis countries
    // where nearby didn't get enough cams
    if (allCams.length < 20) {
      logger.info('Windy: nearby got few results, trying countries filter')
      const crisisCountries = ['IL', 'UA', 'SY', 'IQ', 'IR',
        'PK', 'AF', 'SD', 'YE', 'MM', 'TW', 'LY', 'VE', 'HT']

      // countries is an array param
      const countryCams = await fetchWebcams(
        apiKey,
        { countries: crisisCountries },
        'Crisis Countries'
      )
      addCams(countryCams)
    }

    // STRATEGY 3: Use BBOX with CORRECT format
    // Format: north_lat,east_lon,south_lat,west_lon
    if (allCams.length < 10) {
      logger.info('Windy: trying bbox with correct format')
      const bboxZones = [
        // north_lat,east_lon,south_lat,west_lon
        { label: 'Middle East', bbox: '37.0,63.0,12.0,25.0' },
        { label: 'Eastern Europe', bbox: '55.0,42.0,44.0,22.0' },
        { label: 'South Asia', bbox: '37.0,80.0,20.0,60.0' },
      ]
      for (const zone of bboxZones) {
        const bboxCams = await fetchWebcams(
          apiKey,
          { bbox: zone.bbox },
          zone.label
        )
        addCams(bboxCams)
      }
    }

    logger.info(`Windy: total ${allCams.length} webcams collected`)

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
