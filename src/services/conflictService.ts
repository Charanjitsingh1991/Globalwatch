import type { ConflictEvent } from '@/types/events'
import { getFatalitySeverity } from '@/lib/utils'

interface ACLEDEvent {
  event_id_cnty: string
  event_date: string
  event_type: string
  sub_event_type: string
  actor1: string
  actor2: string
  country: string
  region: string
  latitude: string
  longitude: string
  fatalities: string
  notes: string
}

interface ACLEDResponse {
  data: ACLEDEvent[]
}

export function normalizeACLED(raw: unknown): ConflictEvent[] {
  const resp = raw as ACLEDResponse
  if (!resp?.data) return []

  return resp.data
    .filter((e) => e.latitude && e.longitude)
    .map((e): ConflictEvent => {
      const fatalities = parseInt(e.fatalities ?? '0', 10)
      const eventType = e.event_type?.toLowerCase() ?? ''

      let type: ConflictEvent['type'] = 'strategic'
      if (eventType.includes('battle')) type = 'battle'
      else if (eventType.includes('explo') || eventType.includes('remote')) type = 'explosion'
      else if (eventType.includes('protest')) type = 'protest'
      else if (eventType.includes('riot')) type = 'riot'
      else if (eventType.includes('remote')) type = 'remote'

      return {
        id: e.event_id_cnty,
        lat: parseFloat(e.latitude),
        lon: parseFloat(e.longitude),
        timestamp: new Date(e.event_date).toISOString(),
        severity: getFatalitySeverity(fatalities),
        title: `${e.event_type} — ${e.country}`,
        source: 'acled',
        type,
        actor1: e.actor1 ?? 'Unknown',
        actor2: e.actor2 || undefined,
        fatalities,
        country: e.country ?? 'Unknown',
        region: e.region ?? 'Unknown',
      }
    })
}

export async function fetchACLED(): Promise<ConflictEvent[]> {
  const key = process.env.ACLED_API_KEY
  const email = process.env.ACLED_EMAIL

  if (!key || !email) {
    throw new Error('ACLED credentials not configured')
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0]
  const toDate = new Date().toISOString().split('T')[0]

  const url = new URL('https://api.acleddata.com/acled/read.json')
  url.searchParams.set('key', key)
  url.searchParams.set('email', email)
  url.searchParams.set('limit', '1000')
  url.searchParams.set('fields', 'event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|country|region|latitude|longitude|fatalities|notes')
  url.searchParams.set('event_date_where', 'BETWEEN')
  url.searchParams.set('event_date_from', fromDate)
  url.searchParams.set('event_date_to', toDate)

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`ACLED responded ${res.status}`)
  const raw = await res.json()
  return normalizeACLED(raw)
}
