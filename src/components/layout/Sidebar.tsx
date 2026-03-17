'use client'
import LayerToggle from '@/components/ui/LayerToggle'
import { useUIStore } from '@/store/uiStore'

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-[1001]
          bg-surface border border-border text-text-muted
          hover:text-accent hover:border-primary
          w-5 h-12 flex items-center justify-center
          rounded-r text-xs font-mono transition-all duration-200"
        style={{ left: sidebarOpen ? '276px' : '0px' }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Sidebar panel */}
      <div
        className={`
          absolute left-0 top-0 h-full z-[1000]
          bg-surface/95 border-r border-border
          transition-all duration-300 overflow-hidden
          flex flex-col
        `}
        style={{
          width: sidebarOpen ? '280px' : '0px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex-1 overflow-y-auto p-4 min-w-[280px]">
          {/* Header */}
          <div className="mb-6">
            <div className="text-accent font-mono font-bold text-lg tracking-wider">
              GLOBALWATCH
            </div>
            <div className="text-text-muted font-mono text-xs mt-1">
              Real-Time Intelligence
            </div>
          </div>

          {/* Layer toggles */}
          <LayerToggle />

          {/* Bottom status */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-text-muted font-mono text-xs">
              <div className="flex justify-between mb-1">
                <span>STATUS</span>
                <span className="text-green-400">● ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>VERSION</span>
                <span className="text-accent">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
