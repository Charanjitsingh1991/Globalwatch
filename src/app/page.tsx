'use client'
import dynamic from 'next/dynamic'
import MapSkeleton from '@/components/map/MapSkeleton'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import Sidebar from '@/components/layout/Sidebar'
import BottomBar from '@/components/layout/BottomBar'
import LiveNewsChannels from '@/components/panels/LiveNewsChannels'
import LiveWebcams from '@/components/panels/LiveWebcams'
import NewsPanel from '@/components/panels/NewsPanel'
import IntelPanel from '@/components/panels/IntelPanel'
import MarketsPanel from '@/components/panels/MarketsPanel'
import WorldClockPanel from '@/components/panels/WorldClockPanel'
import FlightsPanel from '@/components/panels/FlightsPanel'

const GlobalMap = dynamic(
  () => import('@/components/map/GlobalMap'),
  { ssr: false, loading: () => <MapSkeleton /> }
)

function Panel({
  title,
  badge,
  badgeColor = '#22c55e',
  children,
  style,
}: {
  title: string
  badge?: string
  badgeColor?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div className="flex flex-col overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        ...style,
      }}>
      <div className="flex items-center justify-between px-3 flex-shrink-0"
        style={{
          height: '32px',
          background: 'var(--bg-surface2)',
          borderBottom: '1px solid var(--border)',
        }}>
        <span className="font-mono font-bold uppercase tracking-widest"
          style={{ fontSize: '10px', color: 'var(--accent)' }}>
          {title}
        </span>
        {badge && (
          <div className="flex items-center gap-1">
            <span className="live-dot"
              style={{ background: badgeColor }} />
            <span className="font-mono"
              style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {badge}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}>

      <Header />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        <Sidebar />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          <div className="flex min-h-0"
            style={{ height: '58vh' }}>

            <div className="flex-1 relative min-w-0 overflow-hidden">
              <GlobalMap />
            </div>

            <div className="flex flex-col flex-shrink-0"
              style={{
                width: '380px',
                borderLeft: '1px solid var(--border)',
              }}>

              <Panel
                title="Live News Channels"
                badge="LIVE"
                style={{
                  flex: '0 0 58%',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                }}>
                <LiveNewsChannels />
              </Panel>

              <Panel
                title="Live Webcams"
                badge="24"
                badgeColor="#00d4ff"
                style={{
                  flex: '1 1 42%',
                  borderRadius: 0,
                  border: 'none',
                }}>
                <LiveWebcams />
              </Panel>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-2"
            style={{ borderTop: '1px solid var(--border)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '8px',
              minHeight: '100%',
            }}>

              <Panel title="📡 Live News Feed" badge="LIVE">
                <NewsPanel />
              </Panel>

              <Panel title="📈 Markets & Crypto" badge="LIVE">
                <MarketsPanel />
              </Panel>

              <Panel title="🤖 AI Intel Brief" badge="GROQ/LLAMA"
                badgeColor="var(--accent)">
                <IntelPanel />
              </Panel>

              <Panel title="✈ Live Flights" badge="LIVE">
                <FlightsPanel />
              </Panel>

              <Panel title="🕐 World Clock">
                <WorldClockPanel />
              </Panel>

            </div>
          </div>
        </div>
      </div>

      <BottomBar />

      <Footer />
    </div>
  )
}
