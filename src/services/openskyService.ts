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

interface OpenSkyFlight {
  icao24: string
  firstSeen: number
  estDepartureAirport: string | null
  lastSeen: number
  estArrivalAirport: string | null
  callsign: string | null
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

async function fetchRoutes(): Promise<Map<string, { dep: string | null; arr: string | null }>> {
  const routes = new Map<string, { dep: string | null; arr: string | null }>()
  try {
    const headers = await buildHeaders()
    const now = Math.floor(Date.now() / 1000)
    const begin = now - 7200 // last 2 hours
    const url = `https://opensky-network.org/api/flights/all?begin=${begin}&end=${now}` 

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.warn('[OpenSky Routes] Failed:', res.status, res.statusText)
      return routes
    }

    const flights: OpenSkyFlight[] = await res.json()
    for (const f of flights) {
      if (f.icao24) {
        routes.set(f.icao24.toLowerCase(), {
          dep: f.estDepartureAirport,
          arr: f.estArrivalAirport,
        })
      }
    }
    console.log('[OpenSky Routes] Loaded', routes.size, 'routes')
  } catch (err) {
    console.warn('[OpenSky Routes] Fetch failed:', err)
  }
  return routes
}

export async function fetchFlights(): Promise<FlightEvent[]> {
  const headers = await buildHeaders()

  // Fetch positions and routes in parallel
  const [statesRes, routes] = await Promise.all([
    fetch('https://opensky-network.org/api/states/all', {
      headers,
      signal: AbortSignal.timeout(12000),
    }),
    fetchRoutes(),
  ])

  if (!statesRes.ok) {
    throw new Error(`OpenSky states responded ${statesRes.status} ${statesRes.statusText}`)
  }

  const data: OpenSkyStates = await statesRes.json()
  if (!data?.states) return []

  console.log('[OpenSky] Fetched', data.states.length, 'state vectors,', routes.size, 'routes')

  return data.states
    .filter((s) => s[5] != null && s[6] != null && !s[8]) // airborne only
    .map((s): FlightEvent => {
      const callsign = (s[1] ?? '').trim()
      const squawk = s[14] ?? ''
      const icao24 = s[0]?.toLowerCase() ?? ''

      const { category, airline, isEmergency } = detectCategory(callsign, squawk)
      const route = routes.get(icao24) ?? { dep: null, arr: null }

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
        originAirport: route.dep ?? undefined,
        destAirport: route.arr ?? undefined,
        originCountry: s[2] ?? undefined,
      } as FlightEvent & {
        airline?: string
        originAirport?: string
        destAirport?: string
        originCountry?: string
      }
    })
}
