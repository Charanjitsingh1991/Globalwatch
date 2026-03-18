import type { BaseEvent } from '@/types/events'

interface OTXPulse {
  id: string
  name: string
  description: string
  created: string
  modified: string
  tags: string[]
  targeted_countries: string[]
  adversary: string
}

interface OTXResponse {
  results: OTXPulse[]
}

export interface CyberEvent extends BaseEvent {
  adversary: string
  tags: string[]
  targetedCountries: string[]
  pulseId: string
}

export function normalizeOTX(raw: unknown): CyberEvent[] {
  const data = raw as OTXResponse
  if (!data?.results) return []

  return data.results.slice(0, 50).map((pulse): CyberEvent => {
    const tags = pulse.tags ?? []
    const isCritical = tags.some((t) =>
      ['ransomware', 'apt', 'critical infrastructure', 'nation-state'].includes(t.toLowerCase())
    )

    return {
      id: pulse.id,
      lat: 0,
      lon: 0,
      timestamp: pulse.modified ?? pulse.created ?? new Date().toISOString(),
      severity: isCritical ? 'critical' : 'high',
      title: pulse.name,
      source: 'alienvault-otx',
      adversary: pulse.adversary ?? 'Unknown',
      tags,
      targetedCountries: pulse.targeted_countries ?? [],
      pulseId: pulse.id,
    }
  })
}

export async function fetchCyberThreats(): Promise<CyberEvent[]> {
  const key = process.env.ALIENVAULT_OTX_KEY
  if (!key) throw new Error('ALIENVAULT_OTX_KEY not configured')

  const url = 'https://otx.alienvault.com/api/v1/pulses/subscribed?limit=50&page=1'
  const res = await fetch(url, {
    headers: { 'X-OTX-API-KEY': key },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`OTX responded ${res.status}`)
  const raw = await res.json()
  return normalizeOTX(raw)
}
