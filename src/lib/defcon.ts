import type { EarthquakeEvent, ConflictEvent, DisasterEvent } from '@/types/events'

export type DefconLevel = 1 | 2 | 3 | 4 | 5

export interface DefconState {
  level: DefconLevel
  label: string
  color: string
  reason: string
  score: number
}

const DEFCON_CONFIG: Record<DefconLevel, {
  label: string; color: string; minScore: number
}> = {
  1: { label: 'DEFCON 1', color: '#ff0000', minScore: 80 },
  2: { label: 'DEFCON 2', color: '#ff4400', minScore: 60 },
  3: { label: 'DEFCON 3', color: '#ffaa00', minScore: 40 },
  4: { label: 'DEFCON 4', color: '#ffdd00', minScore: 20 },
  5: { label: 'DEFCON 5', color: '#00cc44', minScore: 0  },
}

export function calculateDefcon(
  earthquakes: EarthquakeEvent[],
  conflicts: ConflictEvent[],
  disasters: DisasterEvent[],
): DefconState {
  let score = 0
  let topReason = 'No critical events detected'

  const criticalQuakes = earthquakes.filter(e => e.magnitude >= 7)
  const highQuakes     = earthquakes.filter(e => e.magnitude >= 6 && e.magnitude < 7)
  const tsunamiWarning = earthquakes.some(e => e.tsunami)
  score += criticalQuakes.length * 15
  score += highQuakes.length * 5
  if (tsunamiWarning) { score += 20; topReason = 'Tsunami warning active' }
  if (criticalQuakes.length > 0)
    topReason = `M${criticalQuakes[0].magnitude.toFixed(1)} earthquake — ${criticalQuakes[0].place}` 

  const criticalConflicts = conflicts.filter(e => e.severity === 'critical')
  const highConflicts     = conflicts.filter(e => e.severity === 'high')
  score += criticalConflicts.length * 3
  score += highConflicts.length * 1
  if (criticalConflicts.length > 5)
    topReason = `${criticalConflicts.length} active critical conflict events` 

  const criticalDisasters = disasters.filter(e => e.severity === 'critical')
  score += criticalDisasters.length * 8
  if (criticalDisasters.length > 0)
    topReason = `Active ${criticalDisasters[0].type} disaster` 

  score = Math.min(100, score)

  let level: DefconLevel = 5
  if      (score >= 80) level = 1
  else if (score >= 60) level = 2
  else if (score >= 40) level = 3
  else if (score >= 20) level = 4
  else                  level = 5

  return {
    level,
    score,
    label: DEFCON_CONFIG[level].label,
    color: DEFCON_CONFIG[level].color,
    reason: topReason,
  }
}
