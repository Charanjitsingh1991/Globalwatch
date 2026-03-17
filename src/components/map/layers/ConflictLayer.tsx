'use client'
import { memo, useMemo } from 'react'
import { CircleMarker, Popup } from 'react-leaflet'
import { useConflicts } from '@/hooks/useConflicts'
import { isWithinFilter } from '@/lib/timeUtils'
import { getSeverityColor, formatTimestamp } from '@/lib/utils'
import type { TimeFilter, ConflictEvent, BaseEvent } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
  onEventSelect?: (event: BaseEvent) => void
}

function getConflictColor(event: ConflictEvent): string {
  switch (event.type) {
    case 'battle':    return '#EF4444'
    case 'explosion': return '#F97316'
    case 'protest':   return '#EAB308'
    case 'riot':      return '#F59E0B'
    case 'remote':    return '#EC4899'
    default:          return '#8B5CF6'
  }
}

function ConflictLayerInner({ visible, timeFilter, onEventSelect }: Props) {
  const { events, loading } = useConflicts()

  const filtered = useMemo(
    () => visible
      ? events.filter((e) => isWithinFilter(e.timestamp, timeFilter))
      : [],
    [events, visible, timeFilter]
  )

  if (!visible || loading || filtered.length === 0) return null

  return (
    <>
      {filtered.map((conflict: ConflictEvent) => {
        const color = getConflictColor(conflict)
        const radius = Math.max(5, Math.min(20, 6 + conflict.fatalities * 0.15))

        return (
          <CircleMarker
            key={conflict.id}
            center={[conflict.lat, conflict.lon]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.55,
              weight: conflict.severity === 'critical' ? 2 : 1,
              opacity: 0.85,
            }}
            eventHandlers={{ click: () => onEventSelect?.(conflict) }}
          >
            <Popup>
              <div style={{
                background: '#111118',
                color: '#F0F0F0',
                fontFamily: 'monospace',
                padding: '8px',
                minWidth: '220px',
                fontSize: '12px',
              }}>
                <div style={{ color, fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {conflict.type} EVENT
                </div>
                <div style={{ marginBottom: '2px' }}>{conflict.country}</div>
                <div style={{ color: '#888', marginBottom: '2px', fontSize: '11px' }}>
                  {conflict.actor1}
                  {conflict.actor2 && ` vs ${conflict.actor2}`}
                </div>
                {conflict.fatalities > 0 && (
                  <div style={{ color: '#EF4444', marginBottom: '2px' }}>
                    Fatalities: {conflict.fatalities}
                  </div>
                )}
                <div style={{ color: '#888', marginTop: '4px' }}>
                  {formatTimestamp(conflict.timestamp)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

export const ConflictLayer = memo(ConflictLayerInner)
export default ConflictLayer
