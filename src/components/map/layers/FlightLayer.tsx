'use client'
import { memo, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { useFlights } from '@/hooks/useFlights'
import { formatTimestamp } from '@/lib/utils'
import type { TimeFilter, FlightEvent, BaseEvent } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
  onEventSelect?: (event: BaseEvent) => void
}

const FLIGHT_COLORS: Record<FlightEvent['category'], string> = {
  military:  '#EF4444',
  cargo:     '#F97316',
  passenger: '#3B82F6',
  private:   '#22C55E',
  unknown:   '#6B7280',
}

function FlightLayerInner({ visible, timeFilter, onEventSelect }: Props) {
  const map = useMap()
  const { events, loading } = useFlights()

  const filtered = useMemo(
    () => visible ? events.slice(0, 2000) : [],
    [events, visible]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')

    const markers: L.Marker[] = []

    filtered.forEach((flight: FlightEvent) => {
      const color = FLIGHT_COLORS[flight.category]
      const rotate = flight.heading ?? 0

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 12px; height: 12px;
          transform: rotate(${rotate}deg);
          font-size: 10px;
          line-height: 12px;
          text-align: center;
          color: ${color};
          text-shadow: 0 0 3px ${color}80;
          cursor: pointer;
        ">✈</div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      const marker = L.marker([flight.lat, flight.lon], { icon })
      marker.bindPopup(`
        <div style="background:#111118;color:#F0F0F0;font-family:monospace;padding:8px;min-width:180px;font-size:12px;">
          <div style="color:${color};font-weight:bold;margin-bottom:4px;">✈ ${flight.callsign || flight.icao24}</div>
          <div style="color:#888;margin-bottom:2px;">Category: ${flight.category.toUpperCase()}</div>
          <div style="color:#888;margin-bottom:2px;">Alt: ${Math.round((flight.altitude || 0) * 3.28084).toLocaleString()} ft</div>
          <div style="color:#888;margin-bottom:2px;">Speed: ${Math.round((flight.speed || 0) * 1.944)} kts</div>
          <div style="color:#888;margin-bottom:2px;">Heading: ${Math.round(flight.heading || 0)}°</div>
          ${flight.squawk ? `<div style="color:#888;margin-bottom:2px;">Squawk: ${flight.squawk}</div>` : ''}
          ${flight.severity === 'critical' ? '<div style="color:#EF4444;font-weight:bold;">⚠ EMERGENCY SQUAWK</div>' : ''}
        </div>
      `)
      marker.on('click', () => onEventSelect?.(flight))
      marker.addTo(map)
      markers.push(marker)
    })

    return () => {
      markers.forEach((m) => map.removeLayer(m))
    }
  }, [filtered, map, onEventSelect])

  return null
}

export const FlightLayer = memo(FlightLayerInner)
export default FlightLayer
