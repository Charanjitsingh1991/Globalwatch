'use client'
import { memo, useMemo, useEffect, useState, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import { useFlights } from '@/hooks/useFlights'
import type { TimeFilter, FlightEvent, BaseEvent } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
  onEventSelect?: (event: BaseEvent) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  military:  '#EF4444',
  cargo:     '#F97316',
  passenger: '#3B82F6',
  private:   '#22C55E',
  unknown:   '#6B7280',
}

const CATEGORY_ICONS: Record<string, string> = {
  military:  '✈',
  cargo:     '✈',
  passenger: '✈',
  private:   '✈',
  unknown:   '✈',
}

// Airport lookup — loaded once per process
let airportDb: Record<string, { name: string; city: string; country: string; iata: string }> = {}
let airportDbLoading = false // Global flag to prevent multiple concurrent fetches

async function fetchAirportDb(): Promise<void> {
  if (airportDbLoading) return
  airportDbLoading = true
  try {
    const res = await fetch('/data/airports.json')
    airportDb = await res.json()
  } catch { /* use empty */ }
  airportDbLoading = false
}

function getAirportLabel(icao: string | undefined): string {
  if (!icao) return '—'
  const ap = airportDb[icao.toUpperCase()]
  if (ap) return `${ap.iata} ${ap.city}` 
  return icao.toUpperCase()
}

function formatAltitude(meters: number): string {
  if (!meters) return '—'
  const feet = Math.round(meters * 3.28084)
  return feet.toLocaleString() + ' ft'
}

function formatSpeed(ms: number): string {
  if (!ms) return '—'
  return Math.round(ms * 1.944) + ' kts'
}

function buildPopupHtml(flight: FlightEvent & {
  airline?: string; originAirport?: string; destAirport?: string; originCountry?: string
}, color: string): string {
  const origin = getAirportLabel(flight.originAirport)
  const dest   = getAirportLabel(flight.destAirport)
  const hasRoute = origin !== '—' || dest !== '—'

  return `
    <div style="background:#111118;color:#F0F0F0;font-family:monospace;padding:10px;min-width:240px;font-size:12px;border-radius:4px;">
      
      <!-- Flight number + category badge -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="color:${color};font-weight:bold;font-size:14px;">
          ✈ ${flight.callsign}
        </div>
        <div style="background:${color}22;border:1px solid ${color}60;border-radius:3px;
          padding:2px 6px;font-size:10px;color:${color};text-transform:uppercase;">
          ${flight.category}
        </div>
      </div>
      
      <!-- Airline name -->
      ${flight.airline ? `
        <div style="color:#888;margin-bottom:6px;font-size:11px;">
          ${flight.airline}
        </div>
      ` : ''}
      
      <!-- Route — origin → destination -->
      ${hasRoute ? `
        <div style="background:#1A1A28;border:1px solid #1E1E2E;border-radius:3px;
          padding:6px 8px;margin-bottom:8px;">
          <div style="color:#888;font-size:10px;margin-bottom:4px;text-transform:uppercase;
            letter-spacing:1px;">Route</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
            <span style="color:#F0F0F0;font-weight:bold;">${origin}</span>
            <span style="color:#00D4FF;">→</span>
            <span style="color:#F0F0F0;font-weight:bold;">${dest}</span>
          </div>
        </div>
      ` : ''}
      
      <!-- Flight data grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">
        <div style="background:#1A1A28;border-radius:3px;padding:4px 6px;">
          <div style="color:#888;font-size:9px;text-transform:uppercase;">Altitude</div>
          <div style="color:#F0F0F0;font-size:11px;font-weight:bold;">
            ${formatAltitude(flight.altitude)}
          </div>
        </div>
        <div style="background:#1A1A28;border-radius:3px;padding:4px 6px;">
          <div style="color:#888;font-size:9px;text-transform:uppercase;">Speed</div>
          <div style="color:#F0F0F0;font-size:11px;font-weight:bold;">
            ${formatSpeed(flight.speed)}
          </div>
        </div>
        <div style="background:#1A1A28;border-radius:3px;padding:4px 6px;">
          <div style="color:#888;font-size:9px;text-transform:uppercase;">Heading</div>
          <div style="color:#F0F0F0;font-size:11px;font-weight:bold;">
            ${Math.round(flight.heading || 0)}°
          </div>
        </div>
        <div style="background:#1A1A28;border-radius:3px;padding:4px 6px;">
          <div style="color:#888;font-size:9px;text-transform:uppercase;">Squawk</div>
          <div style="color:${['7700','7500'].includes(flight.squawk) ? '#EF4444' : '#F0F0F0'};font-size:11px;font-weight:bold;">
            ${flight.squawk || '—'}
            ${flight.squawk === '7700' ? ' ⚠ EMERGENCY' : ''}
            ${flight.squawk === '7500' ? ' ⚠ HIJACK' : ''}
            ${flight.squawk === '7600' ? ' ⚠ RADIO FAIL' : ''}
          </div>
        </div>
      </div>
      
      <!-- Registration + country -->
      <div style="color:#888;font-size:10px;display:flex;justify-content:space-between;">
        <span>ICAO: ${flight.icao24?.toUpperCase()}</span>
        <span>${flight.originCountry ?? ''}</span>
      </div>
    </div>
  `
}

function FlightLayerInner({ visible, onEventSelect }: Props) {
  const map = useMap()
  const { events } = useFlights()
  const [airportDbIsLoaded, setAirportDbIsLoaded] = useState(false)

  // Load airport DB when component mounts
  useEffect(() => {
    if (airportDbIsLoaded) return // Already loaded
    fetchAirportDb().then(() => {
      setAirportDbIsLoaded(true)
    })
  }, [airportDbIsLoaded]) // Re-run if airportDbIsLoaded changes (though it only changes once)

  const filtered = useMemo(
    () => visible ? events.slice(0, 3000) : [],
    [events, visible]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !filtered.length) return
    if (!airportDbIsLoaded) return // Wait for airport DB to load

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const markers: ReturnType<typeof L.marker>[] = []
    let destroyed = false

    filtered.forEach((flight: FlightEvent & {
      airline?: string; originAirport?: string; destAirport?: string; originCountry?: string
    }) => {
      if (destroyed) return // Prevent adding markers if component unmounted during async operations
      const color = CATEGORY_COLORS[flight.category] ?? '#6B7280'
      const rotate = flight.heading ?? 0

      // Size by category
      const size = flight.category === 'military' ? 14
        : flight.category === 'passenger' ? 12 : 10

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${size}px;height:${size}px;
          transform:rotate(${rotate}deg);
          font-size:${size}px;line-height:${size}px;
          text-align:center;color:${color};
          text-shadow:0 0 4px ${color}90;
          cursor:pointer;
          filter:${flight.severity === 'critical' ? 'brightness(1.5)' : 'none'};
        ">✈</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const marker = L.marker([flight.lat, flight.lon], { icon })
      marker.bindPopup(buildPopupHtml(flight, color), {
        maxWidth: 280,
        className: 'gw-popup',
      })
      marker.on('click', () => onEventSelect?.(flight))
      marker.addTo(map)
      markers.push(marker)
    })

    return () => {
      destroyed = true
      markers.forEach((m) => map.removeLayer(m))
    }
  }, [filtered, map, onEventSelect, airportDbIsLoaded]) // Add airportDbIsLoaded to dependencies

  return null
}

export const FlightLayer = memo(FlightLayerInner)
export default FlightLayer
