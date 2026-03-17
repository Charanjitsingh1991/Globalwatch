'use client'
import { useState, useEffect } from 'react'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useConflicts } from '@/hooks/useConflicts'
import { useDisasters } from '@/hooks/useDisasters'
import { useFlights } from '@/hooks/useFlights'
import { useNews } from '@/hooks/useNews'

export default function BottomBar() {
  const eq = useEarthquakes()
  const cf = useConflicts()
  const ds = useDisasters()
  const fl = useFlights()
  const nw = useNews()
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toUTCString().slice(5, 25))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  function dot(baseline: boolean, stale: boolean) {
    if (baseline) return <span style={{ color: '#6B7280' }}>●</span>
    if (stale)    return <span style={{ color: '#EAB308' }}>●</span>
    return               <span style={{ color: '#22C55E' }}>●</span>
  }

  function count(baseline: boolean, stale: boolean, n: number) {
    if (baseline) return 'OFFLINE'
    if (stale)    return 'STALE'
    return String(n)
  }

  const sources = [
    { label: 'EQ',       ...eq },
    { label: 'CONFLICT', ...cf },
    { label: 'DISASTER', ...ds },
    { label: 'FLIGHTS',  ...fl },
    { label: 'NEWS',     ...nw },
  ]

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[1000]
        bg-surface/90 border-t border-border
        flex items-center justify-between px-4
        font-mono text-xs text-text-muted"
      style={{ height: '28px', backdropFilter: 'blur(4px)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-accent font-bold">◉ GLOBALWATCH</span>
        {sources.map(({ label, baseline, stale, count: n }) => (
          <span key={label} className="flex items-center gap-1">
            {dot(baseline, stale)}
            <span className="text-text-muted">{label}:</span>
            <span className={baseline ? 'text-gray-500' : stale ? 'text-yellow-400' : 'text-green-400'}>
              {count(baseline, stale, n)}
            </span>
          </span>
        ))}
      </div>
      <div className="text-text-muted text-xs">
        UTC {currentTime}
      </div>
    </div>
  )
}
