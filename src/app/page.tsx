'use client'
import dynamic from 'next/dynamic'
import MapSkeleton from '@/components/map/MapSkeleton'
import Sidebar from '@/components/layout/Sidebar'
import RightPanel from '@/components/layout/RightPanel'
import BottomBar from '@/components/layout/BottomBar'
import Header from '@/components/ui/Header'
import AdSlot from '@/components/ui/AdSlot'

const GlobalMap = dynamic(() => import('@/components/map/GlobalMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

export default function Home() {
  return (
    <main className="w-screen h-screen bg-background overflow-hidden relative">

      {/* Top header bar */}
      <Header />

      {/* Full screen map — sits below header (44px) and above bottom bar (28px) */}
      <div
        className="absolute left-0 right-0 overflow-hidden"
        style={{ top: '44px', bottom: '28px' }}
      >
        <GlobalMap />
        <Sidebar />
        <RightPanel />
      </div>

      {/* Ad slot — header banner (hidden in dev) */}
      <AdSlot
        slot="1234567890"
        format="banner"
        label="Header Ad"
        className="absolute z-[1003] hidden"
        style={{ top: '44px', left: '50%', transform: 'translateX(-50%)', width: '728px', height: '0px' }}
      />

      {/* Bottom status bar */}
      <BottomBar />
    </main>
  )
}
