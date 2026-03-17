'use client'
import { memo, useMemo } from 'react'
import { CircleMarker, Popup } from 'react-leaflet'
import { useDisasters } from '@/hooks/useDisasters'
import { isWithinFilter } from '@/lib/timeUtils'
import { formatTimestamp } from '@/lib/utils'
import type { TimeFilter, DisasterEvent, BaseEvent } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
  onEventSelect?: (event: BaseEvent) => void
}

const DISASTER_COLORS: Record<DisasterEvent['type'], string> = {
  wildfire:   '#F97316',
  volcano:    '#EF4444',
  hurricane:  '#8B5CF6',
  flood:      '#3B82F6',
  drought:    '#EAB308',
  earthquake: '#F59E0B',
  tsunami:    '#06B6D4',
}

const DISASTER_ICONS: Record<DisasterEvent['type'], string> = {
  wildfire:   '🔥',
  volcano:    '🌋',
  hurricane:  '🌀',
  flood:      '🌊',
  drought:    '☀️',
  earthquake: '⚡',
  tsunami:    '🌊',
}

function DisasterLayerInner({ visible, timeFilter, onEventSelect }: Props) {
  const { events, loading } = useDisasters()

  const filtered = useMemo(
    () => visible ? events.filter((e) => isWithinFilter(e.timestamp, timeFilter)) : [],
    [events, visible, timeFilter]
  )

  if (!visible || loading || filtered.length === 0) return null

  return (
    <>
      {filtered.map((disaster: DisasterEvent) => {
        const color = DISASTER_COLORS[disaster.type] ?? '#6B7280'
        const icon = DISASTER_ICONS[disaster.type] ?? '⚠'
        return (
          <CircleMarker
            key={disaster.id}
            center={[disaster.lat, disaster.lon]}
            radius={10}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.4,
              weight: 2,
              opacity: 0.9,
            }}
            eventHandlers={{ click: () => onEventSelect?.(disaster) }}
          >
            <Popup>
              <div style={{
                background: '#111118', color: '#F0F0F0',
                fontFamily: 'monospace', padding: '8px',
                minWidth: '180px', fontSize: '12px',
              }}>
                <div style={{ color, fontWeight: 'bold', marginBottom: '4px' }}>
                  {icon} {disaster.type.toUpperCase()}
                </div>
                <div style={{ marginBottom: '2px' }}>{disaster.title}</div>
                <div style={{ color: '#888', marginTop: '4px' }}>
                  {formatTimestamp(disaster.timestamp)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

export const DisasterLayer = memo(DisasterLayerInner)
export default DisasterLayer
