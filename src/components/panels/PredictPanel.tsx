'use client'
import useSWR from 'swr'
import { formatTimestamp } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface PredictEvent {
  id: string
  question: string
  yesProb: number
  noProb: number
  volume: number
  endDate: string
  category: string
}

function formatVolume(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M` 
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K` 
  return `$${n}` 
}

export default function PredictPanel() {
  const { data, isLoading } = useSWR('/api/predict', fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
  })

  const events: PredictEvent[] = data?.data ?? []
  const baseline: boolean = data?.baseline ?? false

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest">
          Prediction Markets
        </span>
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className={baseline ? 'text-gray-500' : 'text-green-400'}>●</span>
          <span className="text-text-muted">Polymarket</span>
        </div>
      </div>

      {/* Sub-header */}
      <div className="px-3 py-2 border-b border-border flex-shrink-0">
        <p className="text-text-muted font-mono text-xs">
          Real-money prediction markets for geopolitical events
        </p>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-text-muted font-mono text-xs animate-pulse">
            Loading prediction markets...
          </div>
        )}
        {baseline && !isLoading && (
          <div className="p-4 text-text-muted font-mono text-xs">
            Prediction market data temporarily unavailable
          </div>
        )}
        {!isLoading && !baseline && events.map((event) => {
          const probColor = event.yesProb >= 70
            ? '#22C55E'
            : event.yesProb <= 30
            ? '#EF4444'
            : '#EAB308'

          return (
            <div
              key={event.id}
              className="px-3 py-3 border-b border-border hover:bg-white/5
                transition-colors"
            >
              {/* Question */}
              <div className="font-mono text-xs text-text-primary leading-tight mb-2">
                {event.question}
              </div>

              {/* Probability bar */}
              <div className="mb-2">
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span style={{ color: '#22C55E' }}>YES {event.yesProb}%</span>
                  <span style={{ color: '#EF4444' }}>NO {event.noProb}%</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${event.yesProb}%`,
                      background: `linear-gradient(90deg, #22C55E, ${probColor})`,
                    }}
                  />
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between font-mono text-xs text-text-muted">
                <span>Vol: {formatVolume(event.volume)}</span>
                {event.endDate && (
                  <span>Ends: {new Date(event.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )
        })}
        {!isLoading && !baseline && events.length === 0 && (
          <div className="p-4 text-text-muted font-mono text-xs">
            No active prediction markets
          </div>
        )}
      </div>
    </div>
  )
}
