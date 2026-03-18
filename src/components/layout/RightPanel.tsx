'use client'
import { useUIStore } from '@/store/uiStore'
import NewsPanel from '@/components/panels/NewsPanel'
import IntelPanel from '@/components/panels/IntelPanel'
import StreamsPanel from '@/components/panels/StreamsPanel'
import WorldClockPanel from '@/components/panels/WorldClockPanel'
import MarketsPanel from '@/components/panels/MarketsPanel'
import CyberPanel from '@/components/panels/CyberPanel'
import PredictPanel from '@/components/panels/PredictPanel'
import FlightsPanel from '@/components/panels/FlightsPanel'

type Tab = 'news' | 'intel' | 'streams' | 'clock' | 'markets' | 'cyber' | 'predict' | 'flights'

const TABS: { id: Tab; label: string; title: string }[] = [
  { id: 'news',    label: '📡', title: 'NEWS' },
  { id: 'intel',   label: '🤖', title: 'INTEL' },
  { id: 'streams', label: '📺', title: 'STREAMS' },
  { id: 'clock',   label: '🕐', title: 'CLOCK' },
  { id: 'markets', label: '📈', title: 'MARKETS' },
  { id: 'cyber',   label: '💻', title: 'CYBER' },
  { id: 'predict', label: '🎯', title: 'PREDICT' },
  { id: 'flights', label: '✈',  title: 'FLIGHTS' },
]

export default function RightPanel() {
  const { rightPanelOpen, toggleRightPanel, activePanel, setActivePanel } = useUIStore()
  const currentTab = (activePanel as Tab) ?? 'news'

  return (
    <div
      className="flex-shrink-0 bg-surface border-l border-border
        flex flex-col transition-all duration-300 overflow-hidden"
      style={{ width: rightPanelOpen ? '360px' : '0px' }}
    >
      <div className="w-[360px] flex flex-col h-full">

        {/* Tab row 1 — first 4 tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {TABS.slice(0, 4).map((tab) => (
            <button key={tab.id} onClick={() => setActivePanel(tab.id)}
              title={tab.title}
              className={`flex-1 py-2 text-base transition-all border-b-2 ${
                currentTab === tab.id
                  ? 'border-accent bg-accent/5'
                  : 'text-text-muted border-transparent hover:bg-white/5'
              }`}>
              {tab.label}
            </button>
          ))}
          <button onClick={toggleRightPanel}
            className="px-2 text-text-muted hover:text-accent border-l border-border
              text-xs font-mono flex items-center" title="Close">▶</button>
        </div>

        {/* Tab row 2 — remaining tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {TABS.slice(4).map((tab) => (
            <button key={tab.id} onClick={() => setActivePanel(tab.id)}
              title={tab.title}
              className={`flex-1 py-1.5 text-base transition-all border-b-2 ${
                currentTab === tab.id
                  ? 'border-accent bg-accent/5'
                  : 'text-text-muted border-transparent hover:bg-white/5'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active tab name */}
        <div className="px-3 py-1.5 border-b border-border bg-surface/80 flex-shrink-0">
          <span className="text-accent font-mono text-xs font-bold uppercase tracking-widest">
            {TABS.find(t => t.id === currentTab)?.title}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentTab === 'news'    && <NewsPanel />}
          {currentTab === 'intel'   && <IntelPanel />}
          {currentTab === 'streams' && <StreamsPanel />}
          {currentTab === 'clock'   && <WorldClockPanel />}
          {currentTab === 'markets' && <MarketsPanel />}
          {currentTab === 'cyber'   && <CyberPanel />}
          {currentTab === 'predict' && <PredictPanel />}
          {currentTab === 'flights' && <FlightsPanel />}
        </div>
      </div>
    </div>
  )
}
