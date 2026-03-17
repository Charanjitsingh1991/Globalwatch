import type { DisasterEvent } from '@/types/events'

interface EONETEvent {
  id: string
  title: string
  categories: { id: string; title: string }[]
  geometry: {
    date: string
    type: string
    coordinates: number[] | number[][]
  }[]
}

interface EONETResponse {
  events: EONETEvent[]
}

export function normalizeEONET(raw: unknown): DisasterEvent[] {
  const data = raw as EONETResponse
  if (!data?.events) return []

  const results: DisasterEvent[] = []

  for (const event of data.events) {
    if (!event.geometry?.length) continue
    const geo = event.geometry[event.geometry.length - 1]
    if (!geo?.coordinates) continue

    let lat: number, lon: number
    if (geo.type === 'Point') {
      [lon, lat] = geo.coordinates as number[]
    } else continue

    const category = event.categories?.[0]?.title?.toLowerCase() ?? ''
    let type: DisasterEvent['type'] = 'flood'
    if (category.includes('wildfire') || category.includes('fire')) type = 'wildfire'
    else if (category.includes('volcano')) type = 'volcano'
    else if (category.includes('storm') || category.includes('cyclone')) type = 'hurricane'
    else if (category.includes('flood')) type = 'flood'
    else if (category.includes('drought')) type = 'drought'
    else if (category.includes('earthquake')) type = 'earthquake'

    results.push({
      id: event.id,
      lat,
      lon,
      timestamp: new Date(geo.date).toISOString(),
      severity: 'high',
      title: event.title,
      source: 'nasa-eonet',
      type,
      alertLevel: 'orange',
    })
  }

  return results
}

export async function fetchDisasters(): Promise<DisasterEvent[]> {
  const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200'
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`EONET responded ${res.status}`)
  const raw = await res.json()
  return normalizeEONET(raw)
}
