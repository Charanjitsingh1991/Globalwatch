import type { EarthquakeEvent } from '@/types/events'
import { getMagnitudeSeverity } from '@/lib/utils'

interface USGSFeature {
  id: string
  properties: {
    mag: number
    place: string
    time: number
    alert: string | null
    tsunami: number
    title: string
  }
  geometry: {
    coordinates: [number, number, number]
  }
}

interface USGSResponse {
  features: USGSFeature[]
}

export function normalizeUSGS(raw: unknown): EarthquakeEvent[] {
  const data = raw as USGSResponse
  if (!data?.features) return []

  return data.features
    .filter((f) => f.geometry?.coordinates && f.properties?.mag != null)
    .map((f): EarthquakeEvent => {
      const [lon, lat, depth] = f.geometry.coordinates
      const mag = f.properties.mag ?? 0
      return {
        id: f.id,
        lat,
        lon,
        timestamp: new Date(f.properties.time).toISOString(),
        severity: getMagnitudeSeverity(mag),
        title: f.properties.place ?? 'Unknown location',
        source: 'usgs',
        magnitude: mag,
        depth: Math.round(depth ?? 0),
        place: f.properties.place ?? 'Unknown',
        alert: (f.properties.alert as EarthquakeEvent['alert']) ?? null,
        tsunami: f.properties.tsunami === 1,
      }
    })
}

export async function fetchEarthquakes(): Promise<EarthquakeEvent[]> {
  const url =
    'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&orderby=time&limit=500'
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 120 },
  })
  if (!res.ok) throw new Error(`USGS responded ${res.status}`)
  const raw = await res.json()
  return normalizeUSGS(raw)
}
