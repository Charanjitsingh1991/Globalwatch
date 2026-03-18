'use client'
import LayerToggle from '@/components/ui/LayerToggle'
import { useUIStore } from '@/store/uiStore'

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div
      className="flex-shrink-0 bg-surface border-r border-border
        flex flex-col transition-all duration-300 relative overflow-hidden"
      style={{ width: sidebarOpen ? '260px' : '0px' }}
    >
      <div className="w-[260px] flex flex-col h-full">
        {/* Sidebar header */}
        <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-accent font-mono font-bold text-sm tracking-wider">
              GLOBALWATCH
            </div>
            <div className="text-text-muted font-mono text-xs">
              Intelligence Platform
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="text-text-muted hover:text-accent font-mono text-xs
              w-6 h-6 flex items-center justify-center rounded
              border border-border hover:border-primary transition-colors"
          >
            ◀
          </button>
        </div>

        {/* Layer toggles — scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          <LayerToggle />
        </div>

        {/* Bottom status */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <div className="flex justify-between text-xs font-mono text-text-muted">
            <span>STATUS</span>
            <span className="text-green-400">● ONLINE</span>
          </div>
          <div className="flex justify-between text-xs font-mono text-text-muted mt-1">
            <span>BUILD</span>
            <span className="text-accent">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
