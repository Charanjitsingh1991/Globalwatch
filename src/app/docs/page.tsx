import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Documentation — GlobalWatch',
}

export default function DocsPage() {
  return (
    <main className="min-h-screen font-mono"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-xs mb-6 block hover:underline"
          style={{ color: 'var(--accent)' }}>
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-1"
          style={{ color: 'var(--accent)' }}>
          DOCUMENTATION
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          How to use GlobalWatch
        </p>

        {[
          {
            title: 'Map Layers',
            content: 'Toggle data layers using the sidebar on the left. Each layer can be turned on/off independently. Available layers: Conflicts, Earthquakes, Fires, Disasters, Flights, Ships, GPS Jamming, Submarine Cables, Military Bases, Cyber Threats, Weather, and News Events.',
          },
          {
            title: 'Time Filter',
            content: 'Use the time filter bar at the top of the map to filter events by time range: 1H (last hour), 6H, 24H, 48H, or 7D (last 7 days). This affects all map layers simultaneously.',
          },
          {
            title: 'Region Presets',
            content: 'Use the region buttons on the bottom-left of the map to quickly jump to: Global, Americas, Europe, MENA, Asia, LatAm, Africa, or Oceania.',
          },
          {
            title: 'Live News',
            content: 'The News panel aggregates articles from 100+ RSS feeds globally, updated every 90 seconds. Filter by severity (Critical, High) or category (Conflict, Disaster, Military). Click any headline to open the original article.',
          },
          {
            title: 'Live Streams',
            content: 'The Streams panel provides live news channels and webcams. Click any channel to watch. Use region filters to find channels by geography.',
          },
          {
            title: 'AI Intelligence Brief',
            content: 'The Intel panel generates a situation report using Groq AI (Llama 3.1) based on current active events. Updated every 15 minutes. The brief covers security threats, natural disasters, and geopolitical developments.',
          },
          {
            title: 'Data Sources',
            content: 'All data is sourced from public APIs: USGS (earthquakes), NASA FIRMS (fires), NASA EONET (disasters), OpenSky Network (flights), ACLED (conflicts), and 100+ RSS feeds. See the About page for full attribution.',
          },
        ].map(({ title, content }) => (
          <div key={title} className="mb-6 p-4 rounded border"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border)',
            }}>
            <h2 className="text-sm font-bold mb-2"
              style={{ color: 'var(--accent)' }}>
              {title}
            </h2>
            <p className="text-xs leading-relaxed"
              style={{ color: 'var(--text-muted)' }}>
              {content}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
