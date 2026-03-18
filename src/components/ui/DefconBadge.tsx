'use client'
import { useMemo } from 'react'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useConflicts } from '@/hooks/useConflicts'
import { useDisasters } from '@/hooks/useDisasters'
import { calculateDefcon } from '@/lib/defcon'

export default function DefconBadge() {
  const { events: earthquakes } = useEarthquakes()
  const { events: conflicts }   = useConflicts()
  const { events: disasters }   = useDisasters()

  const defcon = useMemo(
    () => calculateDefcon(earthquakes, conflicts, disasters),
    [earthquakes, conflicts, disasters]
  )

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded border
        font-mono text-xs cursor-help"
      style={{
        borderColor: defcon.color + '60',
        backgroundColor: defcon.color + '15',
        color: defcon.color,
      }}
      title={`Score: ${defcon.score}/100 — ${defcon.reason}`}
    >
      <span className="font-bold">{defcon.label}</span>
      <span className="opacity-60">{defcon.score}%</span>
    </div>
  )
}
