'use client'
import { useState } from 'react'
import { useNews } from '@/hooks/useNews'
import { getSeverityColor, formatTimestamp } from '@/lib/utils'
import type { Severity } from '@/types/events'

type Filter = 'all' | 'critical' | 'high' | 'conflict' | 'disaster' | 'military'

const FILTERS: Filter[] = ['all', 'critical', 'high', 'conflict', 'disaster', 'military']

export default function NewsPanel() {
  const { events, loading, stale, baseline, count } = useNews()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = events.filter((e) => {
    if (filter === 'all') return true
    if (filter === 'critical' || filter === 'high') return e.severity === filter
    return e.category === filter
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest">
          Live News Feed
        </span>
        <div className="flex items-center gap-1 text-xs font-mono">
          <span style={{ color: baseline ? '#6B7280' : stale ? '#EAB308' : '#22C55E' }}>●</span>
          <span className="text-text-muted">{count} items</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-2 border-b border-border flex-wrap flex-shrink-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 text-xs font-mono rounded transition-all ${
              filter === f
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-accent'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* News list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-text-muted font-mono text-xs animate-pulse">
            Scanning news sources...
          </div>
        )}
        {baseline && !loading && (
          <div className="p-4 text-text-muted font-mono text-xs">
            News feed offline
          </div>
        )}
        {!loading && filtered.map((item, i) => {
          const color = getSeverityColor(item.severity as Severity)
          return (
            <a
              key={`${item.id}-${i}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 border-b border-border hover:bg-white/5
                transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-1 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: color, height: '36px' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary font-mono text-xs leading-tight mb-1 line-clamp-2">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-mono text-xs truncate">
                      {item.source}
                    </span>
                    <span className="text-text-muted font-mono text-xs flex-shrink-0 ml-2">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          )
        })}
        {!loading && !baseline && filtered.length === 0 && (
          <div className="p-4 text-text-muted font-mono text-xs">
            No items match this filter
          </div>
        )}
      </div>
    </div>
  )
}
