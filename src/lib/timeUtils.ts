import type { TimeFilter } from '@/types/events'

export function getStartTime(filter: TimeFilter): Date {
  const now = new Date()
  const map: Record<TimeFilter, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '48h': 48 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
  }
  return new Date(now.getTime() - map[filter])
}

export function isWithinFilter(timestamp: string, filter: TimeFilter): boolean {
  const start = getStartTime(filter)
  const eventTime = new Date(timestamp)
  return eventTime >= start
}

export const REGION_PRESETS = {
  global:   { center: [20, 0] as [number, number],    zoom: 2 },
  americas: { center: [15, -80] as [number, number],  zoom: 3 },
  europe:   { center: [50, 15] as [number, number],   zoom: 4 },
  mena:     { center: [25, 40] as [number, number],   zoom: 4 },
  asia:     { center: [35, 100] as [number, number],  zoom: 3 },
  latam:    { center: [-15, -65] as [number, number], zoom: 3 },
  africa:   { center: [5, 20] as [number, number],    zoom: 3 },
  oceania:  { center: [-25, 140] as [number, number], zoom: 4 },
} as const

export type RegionKey = keyof typeof REGION_PRESETS
