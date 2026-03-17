'use client'
import { useMapStore } from '@/store/mapStore'
import type { TimeFilter } from '@/types/events'

const FILTERS: TimeFilter[] = ['1h', '6h', '24h', '48h', '7d']

export default function TimeFilterBar() {
  const { timeFilter, setTimeFilter } = useMapStore()

  return (
    <div className="flex items-center gap-1 bg-surface/80 border border-border rounded px-2 py-1"
      style={{ backdropFilter: 'blur(4px)' }}>
      <span className="text-text-muted font-mono text-xs mr-1">TIME:</span>
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => setTimeFilter(f)}
          className={`
            px-2 py-0.5 text-xs font-mono rounded transition-all duration-150
            ${timeFilter === f
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-accent'
            }
          `}
        >
          {f.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
