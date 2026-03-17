import type { FlightEvent } from '@/types/events'

type StateVector = [
  string,   // 0: icao24
  string,   // 1: callsign
  string,   // 2: origin_country
  number,   // 3: time_position
  number,   // 4: last_contact
  number,   // 5: longitude
  number,   // 6: latitude
  number,   // 7: baro_altitude
  boolean,  // 8: on_ground
  number,   // 9: velocity
  number,   // 10: true_track
  number,   // 11: vertical_rate
  unknown,  // 12: sensors
  number,   // 13: geo_altitude
  string,   // 14: squawk
  boolean,  // 15: spi
  number,   // 16: position_source
]

interface OpenSkyResponse {
  states: StateVector[] | null
}

const MILITARY_PREFIXES = ['RRR', 'USAF', 'USMC', 'UAF', 'VVAF', 'MMF', 'RFF']
const EMERGENCY_SQUAWKS = ['7700', '7600', '7500']

export function normalizeOpenSky(raw: unknown): FlightEvent[] {
  const data = raw as OpenSkyResponse
  if (!data?.states) return []

  return data.states
    .filter((s) => s[5] != null && s[6] != null && !s[8])
    .map((s): FlightEvent => {
      const callsign = (s[1] ?? '').trim()
      const squawk = s[14] ?? ''
      const isMilitary = MILITARY_PREFIXES.some((p) => callsign.startsWith(p))
      const isEmergency = EMERGENCY_SQUAWKS.includes(squawk)

      let category: FlightEvent['category'] = 'unknown'
      if (isMilitary) category = 'military'
      else if (callsign.length > 0) category = 'passenger'

      return {
        id: s[0],
        lat: s[6],
        lon: s[5],
        timestamp: new Date((s[4] ?? Date.now() / 1000) * 1000).toISOString(),
        severity: isEmergency ? 'critical' : isMilitary ? 'high' : 'info',
        title: callsign || s[0],
        source: 'opensky',
        callsign,
        icao24: s[0],
        altitude: s[7] ?? 0,
        speed: s[9] ?? 0,
        heading: s[10] ?? 0,
        squawk,
        onGround: s[8],
        category,
      }
    })
}

export async function fetchFlights(): Promise<FlightEvent[]> {
  const url = 'https://opensky-network.org/api/states/all'
  
  const res = await fetch(url, { 
    signal: AbortSignal.timeout(10000) 
  })
  if (!res.ok) throw new Error(`OpenSky responded ${res.status}`)
  const raw = await res.json()
  return normalizeOpenSky(raw)
}
