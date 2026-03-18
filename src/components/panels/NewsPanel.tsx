'use client'
import { useState } from 'react'
import { useNews } from '@/hooks/useNews'
import { getSeverityColor, formatTimestamp } from '@/lib/utils'
import type { Severity } from '@/types/events'

type Filter = 'all' | 'critical' | 'high' | 'conflict' | 'disaster' | 'military'
const FILTERS: Filter[] = ['all', 'critical', 'high', 'conflict', 'disaster', 'military']

export default function NewsPanel() {
  const { events, loading, stale, baseline, count, refresh } = useNews()
  const [filter, setFilter] = useState<Filter>('all')
  const [refreshing, setRefreshing] = useState(false)

  const filtered = events.filter((e) => {
    if (filter === 'all') return true
    if (filter === 'critical' || filter === 'high') return e.severity === filter
    return e.category === filter
  })

  // Get age of newest article
  const newestAge = events.length > 0
    ? formatTimestamp(events[0].timestamp)
    : null

  async function handleRefresh() {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center
        justify-between flex-shrink-0">
        <span className="text-accent font-mono text-xs font-bold
          uppercase tracking-widest">
          Live News Feed
        </span>
        <div className="flex items-center gap-2">
          {/* Latest article age */}
          {newestAge && (
            <span className="text-text-muted font-mono text-xs">
              Latest: {newestAge}
            </span>
          )}
          {/* Manual refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className={`font-mono text-xs px-1.5 py-0.5 rounded border
              transition-colors ${
              loading || refreshing
                ? 'border-border text-text-muted animate-pulse'
                : 'border-border text-text-muted hover:border-primary hover:text-accent'
            }`}
            title="Refresh news"
          >
            {refreshing ? '↻ ...' : '↻'}
          </button>
          <div className="flex items-center gap-1 font-mono text-xs">
            <span style={{
              color: baseline ? '#6B7280' : stale ? '#EAB308' : '#22C55E'
            }}>●</span>
            <span className="text-text-muted">{count}</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-2 border-b border-border
        flex-wrap flex-shrink-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 text-xs font-mono rounded
              transition-all ${
              filter === f
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-accent'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Status messages */}
      {loading && (
        <div className="px-3 py-2 border-b border-border flex-shrink-0">
          <span className="text-text-muted font-mono text-xs animate-pulse">
            Scanning {20} news sources...
          </span>
        </div>
      )}

      {!loading && baseline && (
        <div className="px-3 py-2 border-b border-border flex-shrink-0">
          <span className="text-yellow-400 font-mono text-xs">
            ⚠ No articles found in last 6 hours. 
            Click ↻ to retry.
          </span>
        </div>
      )}

      {!loading && !baseline && events.length > 0 && (
        <div className="px-3 py-1.5 border-b border-border
          bg-green-500/5 flex-shrink-0">
          <span className="text-green-400 font-mono text-xs">
            ● {count} articles • newest: {newestAge} • auto-refreshes every 60s
          </span>
        </div>
      )}

      {/* News list */}
      <div className="flex-1 overflow-y-auto">
        {!loading && filtered.map((item, i) => {
          const color = getSeverityColor(item.severity as Severity)
          return (
            <a
              key={`${item.id}-${i}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 border-b border-border
                hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2">
                {/* Severity bar */}
                <div
                  className="w-0.5 rounded-full flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: color,
                    minHeight: '40px',
                  }}
                />
                <div className="flex-1 min-w-0">
                  {/* Headline */}
                  <div className="text-text-primary font-mono text-xs
                    leading-tight mb-1.5">
                    {item.title}
                  </div>
                  {/* Meta row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-text-muted font-mono text-xs
                      truncate flex-shrink-0">
                      {item.source}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Category badge */}
                      <span
                        className="font-mono text-xs px-1 rounded"
                        style={{
                          color,
                          backgroundColor: color + '20',
                          fontSize: '10px',
                        }}
                      >
                        {item.category}
                      </span>
                      {/* Timestamp */}
                      <span className="text-text-muted font-mono text-xs">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          )
        })}

        {!loading && filtered.length === 0 && !baseline && (
          <div className="p-4 text-center">
            <div className="text-text-muted font-mono text-xs mb-2">
              No {filter === 'all' ? '' : filter} articles in last 6 hours
            </div>
            <button
              onClick={handleRefresh}
              className="font-mono text-xs px-3 py-1.5 rounded border
                border-border text-text-muted hover:border-primary
                hover:text-accent transition-colors"
            >
              ↻ Refresh Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
