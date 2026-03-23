import type { FlightEvent } from '@/types/events'
import { detectCategory } from '@/lib/aircraftTypes'
import { getOpenSkyToken } from '@/lib/openskyAuth'

type StateVector = [
  string,  // 0: icao24
  string,  // 1: callsign
  string,  // 2: origin_country
  number,  // 3: time_position
  number,  // 4: last_contact
  number,  // 5: longitude
  number,  // 6: latitude
  number,  // 7: baro_altitude
  boolean, // 8: on_ground
  number,  // 9: velocity
  number,  // 10: true_track
  number,  // 11: vertical_rate
  unknown, // 12: sensors
  number,  // 13: geo_altitude
  string,  // 14: squawk
  boolean, // 15: spi
  number,  // 16: position_source
]

interface OpenSkyStates {
  states: StateVector[] | null
  time: number
}

async function buildHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {}

  // Try OAuth2 token first (new method)
  const token = await getOpenSkyToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  // Fall back to Basic Auth if credentials available (legacy)
  const username = process.env.OPENSKY_USERNAME
  const password = process.env.OPENSKY_PASSWORD
  if (username && password) {
    headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  }

  return headers
}

// ─── Primary: OpenSky Network ────────────────────────────────────────────────
async function fetchFromOpenSky(): Promise<FlightEvent[]> {
  const headers = await buildHeaders()

  const res = await fetch('https://opensky-network.org/api/states/all', {
    headers,
    signal: AbortSignal.timeout(12000),
    // Force fresh data — no caching on Vercel
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`OpenSky states responded ${res.status} ${res.statusText}`)
  }

  const data: OpenSkyStates = await res.json()

  // OpenSky returns null states when rate-limited or no data available
  if (!data?.states || data.states.length === 0) {
    throw new Error('OpenSky returned null/empty states — likely rate-limited')
  }

  console.log('[OpenSky] Fetched', data.states.length, 'state vectors')

  return data.states
    .filter((s) => s[5] != null && s[6] != null && !s[8]) // airborne only
    .map((s): FlightEvent => {
      const callsign = (s[1] ?? '').trim()
      const squawk = s[14] ?? ''
      const icao24 = s[0]?.toLowerCase() ?? ''

      const { category, airline, isEmergency } = detectCategory(callsign, squawk)

      return {
        id: icao24,
        lat: s[6],
        lon: s[5],
        timestamp: new Date((s[4] ?? Date.now() / 1000) * 1000).toISOString(),
        severity: isEmergency ? 'critical' : category === 'military' ? 'high' : 'info',
        title: callsign || icao24.toUpperCase(),
        source: 'opensky',
        callsign: callsign || icao24.toUpperCase(),
        icao24,
        altitude: s[7] ?? 0,
        speed: s[9] ?? 0,
        heading: s[10] ?? 0,
        squawk,
        onGround: s[8],
        category,
        airline: airline ?? undefined,
        originCountry: s[2] ?? undefined,
      } as FlightEvent & {
        airline?: string
        originCountry?: string
      }
    })
}

// ─── Fallback: OpenSky by region (smaller requests, less rate limiting) ───────
async function fetchFromOpenSkyRegional(): Promise<FlightEvent[]> {
  const headers = await buildHeaders()
  const allFlights: FlightEvent[] = []
  const seen = new Set<string>()

  // Fetch key regions separately — smaller requests, less likely to be blocked
  const regions = [
    { name: 'Europe',       lamin: 35, lamax: 72, lomin: -10, lomax: 40 },
    { name: 'Middle East',  lamin: 10, lamax: 40, lomin: 30,  lomax: 65 },
    { name: 'South Asia',   lamin: 5,  lamax: 40, lomin: 60,  lomax: 95 },
    { name: 'East Asia',    lamin: 15, lamax: 55, lomin: 95,  lomax: 145 },
    { name: 'North America',lamin: 25, lamax: 75, lomin: -130,lomax: -60 },
  ]

  for (const region of regions) {
    try {
      const url = `https://opensky-network.org/api/states/all?lamin=${region.lamin}&lamax=${region.lamax}&lomin=${region.lomin}&lomax=${region.lomax}`
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      })

      if (!res.ok) continue

      const data: OpenSkyStates = await res.json()
      if (!data?.states) continue

      console.log(`[OpenSky Regional] ${region.name}: ${data.states.length} vectors`)

      for (const s of data.states) {
        if (!s[5] || !s[6] || s[8]) continue // skip ground/null
        const icao24 = s[0]?.toLowerCase() ?? ''
        if (seen.has(icao24)) continue
        seen.add(icao24)

        const callsign = (s[1] ?? '').trim()
        const squawk = s[14] ?? ''
        const { category, airline, isEmergency } = detectCategory(callsign, squawk)

        allFlights.push({
          id: icao24,
          lat: s[6],
          lon: s[5],
          timestamp: new Date((s[4] ?? Date.now() / 1000) * 1000).toISOString(),
          severity: isEmergency ? 'critical' : category === 'military' ? 'high' : 'info',
          title: callsign || icao24.toUpperCase(),
          source: 'opensky-regional',
          callsign: callsign || icao24.toUpperCase(),
          icao24,
          altitude: s[7] ?? 0,
          speed: s[9] ?? 0,
          heading: s[10] ?? 0,
          squawk,
          onGround: s[8],
          category,
          airline: airline ?? undefined,
          originCountry: s[2] ?? undefined,
        } as FlightEvent & { airline?: string; originCountry?: string })
      }
    } catch (e) {
      console.warn(`[OpenSky Regional] ${region.name} failed:`, e)
    }
  }

  if (allFlights.length === 0) {
    throw new Error('OpenSky regional: no flights returned from any region')
  }

  return allFlights
}

// ─── Static fallback: realistic global flight positions ───────────────────────
// Used when all live APIs fail. Gives the layer something to display.
function getStaticFlights(): FlightEvent[] {
  const now = new Date().toISOString()
  const staticFlights = [
    // Transatlantic
    { icao: 'a1b2c3', cs: 'BAW1', lat: 50.2, lon: -30.0, alt: 11000, spd: 240, hdg: 270, cat: 'passenger' as const, air: 'British Airways', country: 'United Kingdom' },
    { icao: 'a2b3c4', cs: 'DAL101', lat: 48.5, lon: -25.0, alt: 10500, spd: 235, hdg: 280, cat: 'passenger' as const, air: 'Delta Air Lines', country: 'United States' },
    { icao: 'a3b4c5', cs: 'AAL7', lat: 47.0, lon: -20.0, alt: 12000, spd: 245, hdg: 275, cat: 'passenger' as const, air: 'American Airlines', country: 'United States' },
    // Europe
    { icao: 'b1c2d3', cs: 'DLH400', lat: 51.5, lon: 8.0, alt: 9000, spd: 220, hdg: 90, cat: 'passenger' as const, air: 'Lufthansa', country: 'Germany' },
    { icao: 'b2c3d4', cs: 'KLM600', lat: 52.1, lon: 4.5, alt: 8500, spd: 215, hdg: 135, cat: 'passenger' as const, air: 'KLM', country: 'Netherlands' },
    { icao: 'b3c4d5', cs: 'AFR212', lat: 48.8, lon: 2.3, alt: 10000, spd: 230, hdg: 180, cat: 'passenger' as const, air: 'Air France', country: 'France' },
    { icao: 'b4c5d6', cs: 'RYR4321', lat: 53.2, lon: -2.0, alt: 7500, spd: 205, hdg: 220, cat: 'passenger' as const, air: 'Ryanair', country: 'Ireland' },
    // Middle East
    { icao: 'c1d2e3', cs: 'UAE201', lat: 24.0, lon: 55.0, alt: 11500, spd: 250, hdg: 310, cat: 'passenger' as const, air: 'Emirates', country: 'United Arab Emirates' },
    { icao: 'c2d3e4', cs: 'QTR405', lat: 25.2, lon: 51.0, alt: 10800, spd: 245, hdg: 320, cat: 'passenger' as const, air: 'Qatar Airways', country: 'Qatar' },
    { icao: 'c3d4e5', cs: 'THY56', lat: 38.5, lon: 35.0, alt: 9500, spd: 225, hdg: 110, cat: 'passenger' as const, air: 'Turkish Airlines', country: 'Turkey' },
    // Asia
    { icao: 'd1e2f3', cs: 'CPA101', lat: 22.3, lon: 113.9, alt: 10000, spd: 235, hdg: 50, cat: 'passenger' as const, air: 'Cathay Pacific', country: 'China' },
    { icao: 'd2e3f4', cs: 'SIA7', lat: 1.3, lon: 103.8, alt: 11000, spd: 240, hdg: 315, cat: 'passenger' as const, air: 'Singapore Airlines', country: 'Singapore' },
    { icao: 'd3e4f5', cs: 'JAL1', lat: 35.7, lon: 139.7, alt: 9000, spd: 220, hdg: 60, cat: 'passenger' as const, air: 'Japan Airlines', country: 'Japan' },
    { icao: 'd4e5f6', cs: 'KAL902', lat: 37.5, lon: 126.9, alt: 8500, spd: 215, hdg: 90, cat: 'passenger' as const, air: 'Korean Air', country: 'Republic of Korea' },
    // Cargo
    { icao: 'e1f2g3', cs: 'FDX5231', lat: 36.0, lon: -85.0, alt: 11800, spd: 255, hdg: 230, cat: 'cargo' as const, air: 'FedEx', country: 'United States' },
    { icao: 'e2f3g4', cs: 'UPS123', lat: 39.5, lon: -80.0, alt: 11200, spd: 248, hdg: 265, cat: 'cargo' as const, air: 'UPS Airlines', country: 'United States' },
    // Military
    { icao: 'f1g2h3', cs: 'REACH401', lat: 40.0, lon: 50.0, alt: 11000, spd: 260, hdg: 90, cat: 'military' as const, air: 'Military', country: 'United States' },
    { icao: 'f2g3h4', cs: 'NATO214', lat: 52.0, lon: 18.0, alt: 9500, spd: 250, hdg: 180, cat: 'military' as const, air: 'Military', country: 'NATO' },
    // Crisis zones
    { icao: 'g1h2i3', cs: 'DWN401', lat: 31.5, lon: 35.0, alt: 7000, spd: 180, hdg: 0, cat: 'unknown' as const, air: undefined, country: 'Israel' },
    { icao: 'g2h3i4', cs: 'UKR001', lat: 49.5, lon: 32.0, alt: 6000, spd: 160, hdg: 270, cat: 'unknown' as const, air: undefined, country: 'Ukraine' },
    { icao: 'g3h4i5', cs: 'KBL11', lat: 34.5, lon: 69.2, alt: 5500, spd: 150, hdg: 45, cat: 'unknown' as const, air: undefined, country: 'Afghanistan' },
  ]

  return staticFlights.map(f => ({
    id: f.icao,
    lat: f.lat + (Math.random() - 0.5) * 2,
    lon: f.lon + (Math.random() - 0.5) * 2,
    timestamp: now,
    severity: f.cat === 'military' ? 'high' : 'info',
    title: f.cs,
    source: 'static',
    callsign: f.cs,
    icao24: f.icao,
    altitude: f.alt,
    speed: f.spd,
    heading: f.hdg + (Math.random() - 0.5) * 20,
    squawk: '',
    onGround: false,
    category: f.cat,
    airline: f.air,
    originCountry: f.country,
  } as FlightEvent & { airline?: string; originCountry?: string }))
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function fetchFlights(): Promise<FlightEvent[]> {
  // Try global fetch
  try {
    const flights = await fetchFromOpenSky()
    if (flights.length > 0) return flights
  } catch (e) {
    console.warn('[OpenSky] Global fetch failed:', e)
  }

  // Try regional fetches (smaller requests, more resilient)
  try {
    const flights = await fetchFromOpenSkyRegional()
    if (flights.length > 0) return flights
  } catch (e) {
    console.warn('[OpenSky Regional] All regions failed:', e)
  }

  // Final fallback: static representative flights
  console.warn('[Flights] All live sources failed — using static fallback')
  return getStaticFlights()
}
