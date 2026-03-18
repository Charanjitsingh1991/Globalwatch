'use client'
import Link from 'next/link'
import { useUIStore } from '@/store/uiStore'
import DefconBadge from './DefconBadge'
import MarketsTicker from './MarketsTicker'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useConflicts } from '@/hooks/useConflicts'
import { useDisasters } from '@/hooks/useDisasters'

export default function Header() {
  const { toggleSidebar, sidebarOpen, theme, toggleTheme } = useUIStore()
  const { events: eq } = useEarthquakes()
  const { events: cf } = useConflicts()
  const { events: ds } = useDisasters()

  const criticalCount = [
    ...eq.filter(e => e.severity === 'critical'),
    ...cf.filter(e => e.severity === 'critical'),
    ...ds.filter(e => e.severity === 'critical'),
  ].length

  return (
    <div className="flex flex-col flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)' }}>

      <div style={{
        height: '24px',
        background: 'var(--bg-surface2)',
        borderBottom: '1px solid var(--border)',
      }}>
        <MarketsTicker />
      </div>

      <div className="flex items-center justify-between px-3"
        style={{
          height: 'var(--header-h)',
          background: 'var(--bg-surface)',
        }}>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="font-mono text-xs px-2 py-1 rounded border
              transition-colors"
            style={{
              borderColor: sidebarOpen
                ? 'var(--primary)' : 'var(--border)',
              color: sidebarOpen
                ? 'var(--accent)' : 'var(--text-muted)',
              background: sidebarOpen ? 'var(--primary-dim)' : 'transparent',
            }}
          >
            ☰
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-sm tracking-widest"
              style={{ color: 'var(--accent)' }}>
              GLOBALWATCH
            </span>
            <span style={{ color: 'var(--border-bright)' }}>|</span>
            <span className="font-mono text-xs hidden md:block"
              style={{ color: 'var(--text-muted)' }}>
              Real-Time Global Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="live-dot" />
            <span style={{ color: 'var(--text-muted)' }}
              className="hidden sm:block">LIVE</span>
          </div>

          <DefconBadge />

          {criticalCount > 0 && (
            <div className="flex items-center gap-1 font-mono text-xs
              px-2 py-1 rounded border animate-pulse"
              style={{
                borderColor: 'var(--red)' + '60',
                background: 'var(--red)' + '15',
                color: 'var(--red)',
              }}>
              <span>⚠</span>
              <span className="font-bold">{criticalCount} CRITICAL</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="font-mono text-xs px-2 py-1 rounded border
              transition-colors"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀' : '☽'}
          </button>

          <Link href="/about"
            className="font-mono text-xs px-2 py-1 rounded border
              transition-colors"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}>
            ABOUT
          </Link>

          <Link href="/status"
            className="font-mono text-xs px-2 py-1 rounded border
              transition-colors"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}>
            STATUS
          </Link>
        </div>
      </div>
    </div>
  )
}
