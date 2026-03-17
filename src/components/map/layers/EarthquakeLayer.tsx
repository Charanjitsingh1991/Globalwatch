'use client'
import { memo, useMemo } from 'react'
import { CircleMarker, Popup } from 'react-leaflet'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { isWithinFilter } from '@/lib/timeUtils'
import { getSeverityColor, formatTimestamp } from '@/lib/utils'
import type { TimeFilter, EarthquakeEvent, BaseEvent } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
  onEventSelect?: (event: BaseEvent) => void
}

function EarthquakeLayerInner({ visible, timeFilter, onEventSelect }: Props) {
  const { events, loading } = useEarthquakes()

  const filtered = useMemo(
    () =>
      visible
        ? events.filter((e) => isWithinFilter(e.timestamp, timeFilter))
        : [],
    [events, visible, timeFilter]
  )

  if (!visible || loading || filtered.length === 0) return null

  return (
    <>
      {filtered.map((eq: EarthquakeEvent) => {
        const color = getSeverityColor(eq.severity)
        const radius = Math.max(4, eq.magnitude * 4)

        return (
          <CircleMarker
            key={eq.id}
            center={[eq.lat, eq.lon]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: eq.severity === 'critical' ? 2 : 1,
              opacity: 0.9,
            }}
            eventHandlers={{
              click: () => onEventSelect?.(eq),
            }}
          >
            <Popup>
              <div style={{
                background: '#111118',
                color: '#F0F0F0',
                fontFamily: 'monospace',
                padding: '8px',
                minWidth: '200px',
                fontSize: '12px',
              }}>
                <div style={{ color, fontWeight: 'bold', marginBottom: '4px' }}>
                  M{eq.magnitude.toFixed(1)} EARTHQUAKE
                </div>
                <div style={{ marginBottom: '2px' }}>{eq.place}</div>
                <div style={{ color: '#888', marginBottom: '2px' }}>
                  Depth: {eq.depth}km
                </div>
                {eq.tsunami && (
                  <div style={{ color: '#F97316', marginBottom: '2px' }}>
                    ⚠ TSUNAMI WARNING
                  </div>
                )}
                {eq.alert && (
                  <div style={{ marginBottom: '2px' }}>
                    Alert: {eq.alert.toUpperCase()}
                  </div>
                )}
                <div style={{ color: '#888', marginTop: '4px' }}>
                  {formatTimestamp(eq.timestamp)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

export const EarthquakeLayer = memo(EarthquakeLayerInner)
export default EarthquakeLayer
