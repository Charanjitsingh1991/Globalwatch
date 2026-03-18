'use client'
import { useState, useEffect } from 'react'
import { useFlights } from '@/hooks/useFlights'
import type { FlightEvent } from '@/types/events'

// Airport DB for panel display
let airportDb: Record<string, { city: string; iata: string }> = {}
fetch('/data/airports.json').then(r => r.json()).then(d => { airportDb = d }).catch(() => {})

function getCity(icao: string | undefined): string {
  if (!icao) return '?'
  const ap = airportDb[icao.toUpperCase()]
  return ap ? ap.iata : icao.slice(0, 4).toUpperCase()
}

function fmt(ms: number, unit: 'ft' | 'kts'): string {
  if (!ms) return '—'
  if (unit === 'ft') return (Math.round(ms * 3.28084 / 100) * 100).toLocaleString()
  return Math.round(ms * 1.944).toString()
}

const CATEGORY_COLORS: Record<string, string> = {
  military:  '#EF4444',
  cargo:     '#F97316',
  passenger: '#3B82F6',
  private:   '#22C55E',
  unknown:   '#6B7280',
}

const CATEGORY_FLAGS: Record<string, string> = {
  military:  '🎖',
  cargo:     '📦',
  passenger: '👥',
  private:   '🛩',
  unknown:   '✈',
}

type FilterType = 'all' | 'military' | 'passenger' | 'cargo' | 'emergency'

export default function FlightsPanel() {
  const { events, loading, baseline, count } = useFlights()
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [tick, setTick] = useState(0)

  // Refresh display every 15 seconds
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 15000)
    return () => clearInterval(t)
  }, [])

  const filtered = events.filter((f) => {
    if (filter === 'emergency') return f.severity === 'critical'
    if (filter !== 'all') return f.category === filter
    if (search) {
      const q = search.toUpperCase()
      const fe = f as FlightEvent & { airline?: string }
      return f.callsign.includes(q) ||
        (fe.airline ?? '').toUpperCase().includes(q) ||
        (fe.originAirport ?? '').toUpperCase().includes(q) ||
        (fe.destAirport ?? '').toUpperCase().includes(q)
    }
    return true
  })

  const emergency = events.filter(f => f.severity === 'critical')
  const military = events.filter(f => f.category === 'military')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest">
            Live Flights
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className={baseline ? 'text-gray-500' : 'text-green-400'}>●</span>
            <span className="text-text-muted">{count.toLocaleString()} airborne</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          {[
            { label: 'TOTAL',    value: count,           color: '#3B82F6' },
            { label: 'MILITARY', value: military.length, color: '#EF4444' },
            { label: 'EMERG',    value: emergency.length,color: emergency.length > 0 ? '#EF4444' : '#6B7280' },
          ].map(({ label, value, color }) => (
            <div key={label}
              className="bg-surface/80 border border-border rounded p-1.5 text-center">
              <div className="font-mono font-bold text-sm" style={{ color }}>
                {value.toLocaleString()}
              </div>
              <div className="font-mono text-xs text-text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search callsign, airline, airport..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-background border border-border rounded px-2 py-1
            font-mono text-xs text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-primary transition-colors mb-2"
        />

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(['all', 'passenger', 'military', 'cargo', 'emergency'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-0.5 text-xs font-mono rounded transition-all ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-accent'
              }`}
            >
              {f === 'emergency' ? '⚠' : f.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Flight list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-text-muted font-mono text-xs animate-pulse">
            Fetching live flight data...
          </div>
        )}
        {baseline && !loading && (
          <div className="p-4 text-text-muted font-mono text-xs">
            Flight data unavailable
          </div>
        )}
        {!loading && filtered.slice(0, 100).map((flight) => {
          const f = flight as FlightEvent & {
            airline?: string; originAirport?: string; destAirport?: string
          }
          const color = CATEGORY_COLORS[f.category] ?? '#6B7280'
          const hasRoute = f.originAirport || f.destAirport

          return (
            <div
              key={f.id}
              className="px-3 py-2 border-b border-border hover:bg-white/5
                transition-colors cursor-pointer"
            >
              {/* Row 1: callsign + category + altitude */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs" style={{ color }}>
                    {CATEGORY_FLAGS[f.category]} {f.callsign}
                  </span>
                  {f.severity === 'critical' && (
                    <span className="text-red-400 text-xs animate-pulse font-bold">
                      ⚠ EMRG
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-text-muted">
                  {fmt(f.altitude, 'ft')} ft
                </span>
              </div>

              {/* Row 2: airline name */}
              {f.airline && (
                <div className="font-mono text-xs text-text-muted mb-1 truncate">
                  {f.airline}
                </div>
              )}

              {/* Row 3: route */}
              {hasRoute ? (
                <div className="flex items-center gap-1.5 font-mono text-xs mb-1">
                  <span className="text-text-primary font-bold">
                    {getCity(f.originAirport)}
                  </span>
                  <span className="text-accent">→</span>
                  <span className="text-text-primary font-bold">
                    {getCity(f.destAirport)}
                  </span>
                </div>
              ) : (
                <div className="font-mono text-xs text-text-muted mb-1">
                  {f.originCountry ?? 'Route unknown'}
                </div>
              )}

              {/* Row 4: speed + heading */}
              <div className="flex justify-between font-mono text-xs text-text-muted">
                <span>{fmt(f.speed, 'kts')} kts</span>
                <span>{Math.round(f.heading ?? 0)}° hdg</span>
              </div>
            </div>
          )
        })}
        {!loading && !baseline && filtered.length === 0 && (
          <div className="p-4 text-text-muted font-mono text-xs">
            No flights match filter
          </div>
        )}
      </div>
    </div>
  )
}
