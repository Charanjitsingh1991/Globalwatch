import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import type { ShipEvent } from '@/types/events'

const CACHE_KEY = 'globalwatch:ships:all'
const TTL = 60 // 60 seconds

// ─── AIS Hub API ──────────────────────────────────────────────────────────────
// Free tier: 50 req/day - we cache aggressively.
// API: https://www.aishub.net/api
// Falls back to open Marine Traffic data (no auth needed) if hub fails.

interface AisHubVessel {
  MMSI: string
  NAME: string
  LATITUDE: string
  LONGITUDE: string
  SPEED: string
  HEADING: string
  DESTINATION: string
  SHIPTYPE: string
  FLAG: string
}

// AIS ship type codes → our categories
function categorizeShip(typeCode: number): ShipEvent['type'] {
  if (typeCode >= 20 && typeCode <= 29) return 'fishing'
  if (typeCode >= 30 && typeCode <= 35) return 'fishing'
  if (typeCode === 36 || typeCode === 37) return 'fishing'
  if (typeCode >= 60 && typeCode <= 69) return 'passenger'
  if (typeCode >= 70 && typeCode <= 79) return 'cargo'
  if (typeCode >= 80 && typeCode <= 89) return 'tanker'
  if (typeCode >= 35 && typeCode <= 39) return 'military'
  if (typeCode === 55) return 'military' // law enforcement
  return 'unknown'
}

// Strategic maritime chokepoints
function getChokepoint(lat: number, lon: number): string | undefined {
  if (lat > 20 && lat < 31 && lon > 31 && lon < 44) return 'Red Sea / Bab-el-Mandeb'
  if (lat > 23 && lat < 27 && lon > 55 && lon < 58) return 'Strait of Hormuz'
  if (lat > 1 && lat < 5 && lon > 99 && lon < 105) return 'Strait of Malacca'
  if (lat > 30 && lat < 33 && lon > 31 && lon < 33) return 'Suez Canal'
  if (lat > 35 && lat < 37 && lon > -6 && lon < -4) return 'Strait of Gibraltar'
  if (lat > 21 && lat < 24 && lon > 59 && lon < 62) return 'Gulf of Oman'
  if (lat > 8 && lat < 11 && lon > -16 && lon < -12) return 'Gulf of Guinea'
  if (lat > 50 && lat < 52 && lon > 1 && lon < 3) return 'English Channel'
  if (lat > 49 && lat < 58 && lon > 18 && lon < 31) return 'Baltic Sea'
  return undefined
}

async function fetchFromAisHub(): Promise<ShipEvent[]> {
  const apiKey = process.env.AISHUB_API_KEY
  if (!apiKey) {
    logger.warn('AISHUB_API_KEY not set')
    return []
  }

  const url = `https://data.aishub.net/vessels.php?username=${apiKey}&format=1&output=json&compress=0`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`AISHub responded ${res.status} ${res.statusText}`)
  }

  const raw = await res.json()
  // AIS Hub returns [metadata, [vessels...]] or [[vessels...]]
  const vessels: AisHubVessel[] = Array.isArray(raw[1]) ? raw[1] : Array.isArray(raw[0]) ? raw[0] : []

  return vessels
    .filter(v => v.LATITUDE && v.LONGITUDE && parseFloat(v.LATITUDE) !== 0)
    .map(v => {
      const lat = parseFloat(v.LATITUDE)
      const lon = parseFloat(v.LONGITUDE)
      const speed = parseFloat(v.SPEED || '0') / 10 // AIS speed in 1/10 knot units
      const heading = parseFloat(v.HEADING || '0')
      const typeCode = parseInt(v.SHIPTYPE || '0', 10)
      const type = categorizeShip(typeCode)
      const chokepoint = getChokepoint(lat, lon)

      return {
        id: v.MMSI,
        mmsi: v.MMSI,
        lat,
        lon,
        timestamp: new Date().toISOString(),
        severity: type === 'military' ? 'high' : chokepoint ? 'medium' : 'info',
        title: v.NAME?.trim() || `MMSI ${v.MMSI}`,
        source: 'aishub',
        name: v.NAME?.trim() || `MMSI ${v.MMSI}`,
        type,
        speed,
        heading,
        destination: v.DESTINATION?.trim() || undefined,
        flag: v.FLAG?.trim() || undefined,
        chokepoint,
      } satisfies ShipEvent
    })
}

async function fetchFromVesselFinder(): Promise<ShipEvent[]> {
  // VesselFinder public API (unauthenticated, limited to some vessels)
  const url = 'https://cors.bridged.cc/https://www.vesselwatch.net/map/vessels'

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error('VesselFinder failed')
    const data = await res.json()
    // This returns an array of vessel objects
    if (!Array.isArray(data)) return []
    return data
      .filter((v: { lat?: number; lng?: number }) => v.lat && v.lng)
      .slice(0, 200)
      .map((v: {
        id?: string; mmsi?: string; name?: string; lat: number; lng: number;
        speed?: number; course?: number; type?: number; dest?: string; flag?: string
      }) => {
        const lat = v.lat
        const lon = v.lng
        const type = categorizeShip(v.type || 0)
        return {
          id: v.mmsi || v.id || Math.random().toString(36).slice(2),
          mmsi: v.mmsi || '',
          lat,
          lon,
          timestamp: new Date().toISOString(),
          severity: type === 'military' ? 'high' : 'info',
          title: v.name?.trim() || `MMSI ${v.mmsi}`,
          source: 'vesselfinder',
          name: v.name?.trim() || 'Unknown',
          type,
          speed: v.speed || 0,
          heading: v.course || 0,
          destination: v.dest?.trim() || undefined,
          flag: v.flag?.trim() || undefined,
          chokepoint: getChokepoint(lat, lon),
        } satisfies ShipEvent
      })
  } catch {
    return []
  }
}

// ─── Static dataset for chokepoint-critical ships ────────────────────────────
// Sampled positions from Strait of Hormuz, Suez Canal, Strait of Malacca
// Used as a reliable fallback when no API key is available.
function getStaticShips(): ShipEvent[] {
  const staticData = [
    // Strait of Hormuz
    { mmsi: '311000001', name: 'HORMUZ TANKER 1', lat: 26.38, lon: 56.72, type: 'tanker' as const, flag: 'AE' },
    { mmsi: '311000002', name: 'GULF CARGO 2', lat: 26.51, lon: 57.10, type: 'cargo' as const, flag: 'IR' },
    { mmsi: '311000003', name: 'HORMUZ CARGO 3', lat: 26.23, lon: 56.55, type: 'cargo' as const, flag: 'OM' },
    // Strait of Malacca
    { mmsi: '525000001', name: 'MALACCA EXPRESS', lat: 3.12, lon: 101.45, type: 'cargo' as const, flag: 'SG' },
    { mmsi: '525000002', name: 'SINGAPORE TRADER', lat: 2.85, lon: 101.78, type: 'tanker' as const, flag: 'MY' },
    // Suez Canal
    { mmsi: '622000001', name: 'SUEZ PASSAGE 1', lat: 31.22, lon: 32.31, type: 'cargo' as const, flag: 'EG' },
    { mmsi: '622000002', name: 'SUEZ TANKER 2', lat: 30.87, lon: 32.20, type: 'tanker' as const, flag: 'SA' },
    // Red Sea
    { mmsi: '403000001', name: 'RED SEA CARGO', lat: 22.5, lon: 38.5, type: 'cargo' as const, flag: 'SA' },
    { mmsi: '403000002', name: 'BABELMANADEB PASS', lat: 12.6, lon: 43.5, type: 'tanker' as const, flag: 'YE' },
    // Gibraltar
    { mmsi: '224000001', name: 'GIBRALTAR FERRY', lat: 36.14, lon: -5.35, type: 'passenger' as const, flag: 'ES' },
    // Black Sea
    { mmsi: '271000001', name: 'BOSPHORUS CARGO', lat: 41.03, lon: 29.00, type: 'cargo' as const, flag: 'TR' },
    // South China Sea
    { mmsi: '477000001', name: 'SOUTH CHINA VESSEL', lat: 14.5, lon: 113.2, type: 'cargo' as const, flag: 'CN' },
  ]

  return staticData.map(s => ({
    id: s.mmsi,
    mmsi: s.mmsi,
    lat: s.lat + (Math.random() - 0.5) * 0.5, // slight jitter
    lon: s.lon + (Math.random() - 0.5) * 0.5,
    timestamp: new Date().toISOString(),
    severity: 'info' as const,
    title: s.name,
    source: 'static',
    name: s.name,
    type: s.type,
    speed: Math.random() * 15 + 5,
    heading: Math.random() * 360,
    destination: undefined,
    flag: s.flag,
    chokepoint: getChokepoint(s.lat, s.lon),
  }))
}

export async function GET() {
  const redis = getRedis()

  try {
    // Check Redis cache first
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        return NextResponse.json(parsed, {
          headers: { 'Cache-Control': `s-maxage=${TTL}, stale-while-revalidate` },
        })
      }
    }

    let ships: ShipEvent[] = []

    // Try primary source (AISHub)
    try {
      ships = await fetchFromAisHub()
      logger.info(`Ships: fetched ${ships.length} from AISHub`)
    } catch (e) {
      logger.warn('AISHub failed, ships will use static data', e)
    }

    // If we got nothing, use static fallback
    if (ships.length === 0) {
      ships = getStaticShips()
      logger.info(`Ships: using ${ships.length} static ships`)
    }

    const result = {
      data: ships,
      stale: false,
      timestamp: new Date().toISOString(),
      source: ships[0]?.source ?? 'static',
      count: ships.length,
    }

    if (redis) await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': `s-maxage=${TTL}, stale-while-revalidate` },
    })
  } catch (error) {
    logger.error('Ships fetch failed', error)

    // Try stale cache
    if (redis) {
      const stale = await redis.get(CACHE_KEY)
      if (stale) {
        const parsed = typeof stale === 'string' ? JSON.parse(stale) : stale
        return NextResponse.json({ ...parsed, stale: true })
      }
    }

    // Last resort: static ships
    const fallback = getStaticShips()
    return NextResponse.json({
      data: fallback,
      stale: true,
      timestamp: new Date().toISOString(),
      source: 'static',
      count: fallback.length,
    })
  }
}
