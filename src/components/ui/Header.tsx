'use client'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useConflicts } from '@/hooks/useConflicts'
import { useDisasters } from '@/hooks/useDisasters'
import { useNews } from '@/hooks/useNews'
import { useUIStore } from '@/store/uiStore'
import { useAlertStore } from '@/store/alertStore'

export default function Header() {
  const { toggleSidebar, toggleRightPanel, rightPanelOpen } = useUIStore()
  const { alerts } = useAlertStore()
  const eq = useEarthquakes()
  const cf = useConflicts()
  const ds = useDisasters()
  const nw = useNews()

  const criticalCount = [
    ...eq.events.filter(e => e.severity === 'critical'),
    ...cf.events.filter(e => e.severity === 'critical'),
    ...ds.events.filter(e => e.severity === 'critical'),
  ].length

  const allOnline = !eq.baseline && !ds.baseline && !nw.baseline

  return (
    <header
      className="absolute top-0 left-0 right-0 z-[1002]
        bg-surface/95 border-b border-border
        flex items-center justify-between px-4"
      style={{ height: '44px', backdropFilter: 'blur(8px)' }}
    >
      {/* Left — brand + sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-text-muted hover:text-accent font-mono text-xs
            border border-border rounded px-2 py-1 transition-colors"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <span className="text-accent font-mono font-bold text-base tracking-widest">
            GLOBALWATCH
          </span>
          <span className="text-text-muted font-mono text-xs hidden sm:block">
            Real-Time Global Intelligence
          </span>
        </div>
      </div>

      {/* Center — system status */}
      <div className="flex items-center gap-4 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <span className={allOnline ? 'text-green-400 animate-pulse' : 'text-yellow-400'}>●</span>
          <span className="text-text-muted">
            {allOnline ? 'SYSTEMS NOMINAL' : 'DEGRADED MODE'}
          </span>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40
            rounded px-2 py-0.5 animate-pulse">
            <span className="text-red-400">⚠</span>
            <span className="text-red-400 font-bold">{criticalCount} CRITICAL</span>
          </div>
        )}
      </div>

      {/* Right — panel toggles */}
      <div className="flex items-center gap-2">
        <a
          href="/about"
          className="text-text-muted hover:text-accent font-mono text-xs
            border border-border rounded px-2 py-1 transition-colors"
        >
          ABOUT
        </a>
        <button
          onClick={toggleRightPanel}
          className={`font-mono text-xs border rounded px-2 py-1 transition-colors
            ${rightPanelOpen
              ? 'border-primary text-accent'
              : 'border-border text-text-muted hover:text-accent'
            }`}
        >
          FEED {rightPanelOpen ? '▶' : '◀'}
        </button>
      </div>
    </header>
  )
}
