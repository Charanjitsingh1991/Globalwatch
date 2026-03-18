'use client'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useConflicts } from '@/hooks/useConflicts'
import { useDisasters } from '@/hooks/useDisasters'
import { useFlights } from '@/hooks/useFlights'
import { useNews } from '@/hooks/useNews'
import { useState, useEffect } from 'react'

export default function BottomBar() {
  const eq  = useEarthquakes()
  const cf  = useConflicts()
  const ds  = useDisasters()
  const fl  = useFlights()
  const nw  = useNews()
  const [utc, setUtc] = useState('')

  useEffect(() => {
    const update = () => setUtc(new Date().toUTCString().slice(5, 25))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  function dot(baseline: boolean, stale: boolean) {
    if (baseline) return '#6B7280'
    if (stale) return '#EAB308'
    return '#22C55E'
  }

  function val(baseline: boolean, stale: boolean, n: number) {
    if (baseline) return 'OFFLINE'
    if (stale) return 'STALE'
    return String(n)
  }

  const sources = [
    { label: 'EQ',    ...eq },
    { label: 'CF',    ...cf },
    { label: 'FIRE',  baseline: false, stale: false, count: 0 },
    { label: 'DISAS', ...ds },
    { label: 'FLT',   ...fl },
    { label: 'NEWS',  ...nw },
  ]

  return (
    <div
      className="flex-shrink-0 w-full bg-surface/95 border-t border-border
        flex items-center justify-between px-4 font-mono text-xs text-text-muted"
      style={{ height: 'var(--bottombar-h)' }}
    >
      <div className="flex items-center gap-4">
        <span className="text-accent font-bold">◉ GLOBALWATCH</span>
        {sources.map(({ label, baseline, stale, count }) => (
          <span key={label} className="flex items-center gap-1">
            <span style={{ color: dot(baseline, stale) }}>●</span>
            <span>{label}:</span>
            <span style={{ color: dot(baseline, stale) }}>
              {val(baseline, stale, count)}
            </span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-text-muted">UTC {utc}</span>
      </div>
    </div>
  )
}
