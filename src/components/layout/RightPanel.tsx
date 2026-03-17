'use client'
import { useUIStore } from '@/store/uiStore'
import NewsPanel from '@/components/panels/NewsPanel'
import IntelPanel from '@/components/panels/IntelPanel'

type Tab = 'news' | 'intel'
const TABS: { id: Tab; label: string }[] = [
  { id: 'news',  label: '📡 NEWS' },
  { id: 'intel', label: '🤖 INTEL' },
]

export default function RightPanel() {
  const { rightPanelOpen, toggleRightPanel, activePanel, setActivePanel } = useUIStore()
  const currentTab = (activePanel === 'intel' ? 'intel' : 'news') as Tab

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleRightPanel}
        className="absolute top-1/2 -translate-y-1/2 z-[1001]
          bg-surface border border-border text-text-muted
          hover:text-accent hover:border-primary
          w-5 h-12 flex items-center justify-center
          rounded-l text-xs font-mono transition-all duration-200"
        style={{ right: rightPanelOpen ? '316px' : '0px' }}
      >
        {rightPanelOpen ? '▶' : '◀'}
      </button>

      {/* Panel */}
      <div
        className="absolute right-0 top-0 h-full z-[1000]
          bg-surface/95 border-l border-border
          transition-all duration-300 overflow-hidden flex flex-col"
        style={{
          width: rightPanelOpen ? '320px' : '0px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="min-w-[320px] flex flex-col h-full">
          {/* Tab bar */}
          <div className="flex border-b border-border flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex-1 py-2 text-xs font-mono transition-all border-b-2 ${
                  currentTab === tab.id
                    ? 'text-accent border-accent'
                    : 'text-text-muted border-transparent hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {currentTab === 'news'  && <NewsPanel />}
            {currentTab === 'intel' && <IntelPanel />}
          </div>
        </div>
      </div>
    </>
  )
}
