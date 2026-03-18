'use client'
import { useCyber } from '@/hooks/useCyber'
import { formatTimestamp } from '@/lib/utils'

export default function CyberPanel() {
  const { events, loading, baseline, stale, count } = useCyber()

  const severityColor = (s: string) => {
    if (s === 'critical') return '#EF4444'
    if (s === 'high') return '#F97316'
    return '#EAB308'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest">
          Cyber Threats
        </span>
        <div className="flex items-center gap-1 text-xs font-mono">
          <span style={{
            color: baseline ? '#6B7280' : stale ? '#EAB308' : '#22C55E'
          }}>●</span>
          <span className="text-text-muted">
            {baseline ? 'OFFLINE' : `${count} threats`}
          </span>
        </div>
      </div>

      {/* Setup notice if offline */}
      {baseline && !loading && (
        <div className="p-4 border-b border-border">
          <div className="text-yellow-400 font-mono text-xs font-bold mb-2">
            ⚠ API KEY REQUIRED
          </div>
          <div className="text-text-muted font-mono text-xs leading-relaxed mb-3">
            To enable live cyber threat intelligence, add your AlienVault OTX key:
          </div>
          <div className="bg-surface border border-border rounded p-2 font-mono text-xs text-accent">
            1. Go to otx.alienvault.com
          </div>
          <div className="bg-surface border border-border rounded p-2 font-mono text-xs text-accent mt-1">
            2. Sign up free → API Keys
          </div>
          <div className="bg-surface border border-border rounded p-2 font-mono text-xs text-accent mt-1">
            3. Add to .env.local:
            ALIENVAULT_OTX_KEY=your_key
          </div>
          <div className="bg-surface border border-border rounded p-2 font-mono text-xs text-accent mt-1">
            4. Redeploy on Vercel
          </div>
        </div>
      )}

      {/* Threat list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-text-muted font-mono text-xs animate-pulse">
            Scanning threat intelligence...
          </div>
        )}
        {!loading && !baseline && events.map((threat, i) => {
          const color = severityColor(threat.severity)
          return (
            <div
              key={`${threat.id}-${i}`}
              className="px-3 py-2 border-b border-border hover:bg-white/5
                transition-colors"
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-1 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: color, height: '40px' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-text-primary
                    leading-tight mb-1 line-clamp-2">
                    {threat.title}
                  </div>
                  {threat.adversary && threat.adversary !== 'Unknown' && (
                    <div className="font-mono text-xs text-orange-400 mb-1">
                      Actor: {threat.adversary}
                    </div>
                  )}
                  {threat.targetedCountries?.length > 0 && (
                    <div className="font-mono text-xs text-text-muted mb-1 truncate">
                      Targets: {threat.targetedCountries.slice(0, 3).join(', ')}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-1 flex-wrap">
                      {threat.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1 py-0.5 rounded font-mono text-xs"
                          style={{
                            backgroundColor: color + '20',
                            color,
                            fontSize: '10px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-text-muted font-mono text-xs flex-shrink-0 ml-2">
                      {formatTimestamp(threat.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {!loading && !baseline && events.length === 0 && (
          <div className="p-4 text-text-muted font-mono text-xs">
            No active threats in feed
          </div>
        )}
      </div>
    </div>
  )
}
