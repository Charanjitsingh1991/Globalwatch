import type { FireEvent } from '@/types/events'

interface FIRMSRow {
  latitude: string
  longitude: string
  brightness: string
  confidence: string
  frp: string
  daynight: string
  acq_date: string
  acq_time: string
  satellite: string
}

export function normalizeFIRMS(rows: unknown[]): FireEvent[] {
  return (rows as FIRMSRow[])
    .filter((r) => r.latitude && r.longitude)
    .map((r, i): FireEvent => {
      const brightness = parseFloat(r.brightness ?? '300')
      const frp = parseFloat(r.frp ?? '0')
      const conf = r.confidence?.toLowerCase() ?? 'nominal'

      let severity: FireEvent['severity'] = 'info'
      if (brightness > 450 || frp > 1000) severity = 'critical'
      else if (brightness > 400 || frp > 500) severity = 'high'
      else if (brightness > 350 || frp > 100) severity = 'medium'
      else severity = 'low'

      const timeStr = r.acq_time?.padStart(4, '0') ?? '0000'
      const hours = timeStr.slice(0, 2)
      const mins = timeStr.slice(2, 4)
      const timestamp = new Date(`${r.acq_date}T${hours}:${mins}:00Z`).toISOString()

      return {
        id: `firms-${i}-${r.acq_date}-${r.acq_time}`,
        lat: parseFloat(r.latitude),
        lon: parseFloat(r.longitude),
        timestamp,
        severity,
        title: `Active fire detected`,
        source: 'nasa-firms',
        brightness,
        confidence: conf.includes('high') ? 'high' : conf.includes('low') ? 'low' : 'nominal',
        frp,
        satellite: (r.satellite ?? 'VIIRS') as FireEvent['satellite'],
        daynight: (r.daynight ?? 'D') as FireEvent['daynight'],
      }
    })
}

export async function fetchFires(): Promise<FireEvent[]> {
  const key = process.env.NASA_FIRMS_API_KEY
  if (!key) throw new Error('NASA_FIRMS_API_KEY not configured')

  const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${key}/VIIRS_SNPP_NRT/World/1` 
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`FIRMS responded ${res.status}`)

  const text = await res.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim())
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? '']))
  })

  return normalizeFIRMS(rows)
}
