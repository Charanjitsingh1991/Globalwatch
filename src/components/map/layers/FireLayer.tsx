'use client'
import { memo, useMemo } from 'react'
import { CircleMarker, Popup } from 'react-leaflet'
import { useFires } from '@/hooks/useFires'
import { isWithinFilter } from '@/lib/timeUtils'
import { formatTimestamp } from '@/lib/utils'
import type { TimeFilter, FireEvent, BaseEvent } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
  onEventSelect?: (event: BaseEvent) => void
}

function getFireColor(event: FireEvent): string {
  if (event.brightness > 450) return '#EF4444'
  if (event.brightness > 400) return '#F97316'
  if (event.brightness > 350) return '#EAB308'
  return '#F59E0B'
}

function FireLayerInner({ visible, timeFilter, onEventSelect }: Props) {
  const { events, loading } = useFires()

  const filtered = useMemo(
    () => visible
      ? events.filter((e) => isWithinFilter(e.timestamp, timeFilter))
      : [],
    [events, visible, timeFilter]
  )

  if (!visible || loading || filtered.length === 0) return null

  return (
    <>
      {filtered.map((fire: FireEvent) => {
        const color = getFireColor(fire)
        return (
          <CircleMarker
            key={fire.id}
            center={[fire.lat, fire.lon]}
            radius={4}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 0,
            }}
            eventHandlers={{ click: () => onEventSelect?.(fire) }}
          >
            <Popup>
              <div style={{
                background: '#111118',
                color: '#F0F0F0',
                fontFamily: 'monospace',
                padding: '8px',
                minWidth: '180px',
                fontSize: '12px',
              }}>
                <div style={{ color, fontWeight: 'bold', marginBottom: '4px' }}>
                  🔥 ACTIVE FIRE
                </div>
                <div style={{ color: '#888', marginBottom: '2px' }}>
                  Brightness: {fire.brightness.toFixed(0)}K
                </div>
                <div style={{ color: '#888', marginBottom: '2px' }}>
                  FRP: {fire.frp.toFixed(1)} MW
                </div>
                <div style={{ color: '#888', marginBottom: '2px' }}>
                  Confidence: {fire.confidence}
                </div>
                <div style={{ color: '#888', marginBottom: '2px' }}>
                  Satellite: {fire.satellite}
                </div>
                <div style={{ color: '#888', marginTop: '4px' }}>
                  {formatTimestamp(fire.timestamp)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

export const FireLayer = memo(FireLayerInner)
export default FireLayer
