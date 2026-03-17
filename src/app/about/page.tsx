import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About & Data Sources — GlobalWatch',
  description: 'GlobalWatch data sources, attribution, and legal information.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary font-mono">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-accent hover:underline text-sm mb-6 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-accent tracking-widest mb-2">
            GLOBALWATCH
          </h1>
          <p className="text-text-muted text-sm">
            Real-Time Global Intelligence Dashboard
          </p>
        </div>

        {/* About */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-3 border-b border-border pb-2">
            About
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            GlobalWatch aggregates real-time data from public APIs and open data sources
            to provide a global situational awareness dashboard. It is intended for
            informational and research purposes only. All data is sourced from publicly
            available, free-to-access APIs.
          </p>
        </section>

        {/* Data Sources */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-2">
            Data Sources & Attribution
          </h2>
          <div className="space-y-4">
            {[
              {
                name: 'USGS Earthquake Hazards Program',
                url: 'https://earthquake.usgs.gov',
                desc: 'Real-time earthquake data worldwide.',
                attribution: 'Data provided by the U.S. Geological Survey.',
              },
              {
                name: 'NASA FIRMS — Fire Information for Resource Management',
                url: 'https://firms.modaps.eosdis.nasa.gov',
                desc: 'Active fire and thermal anomaly detection from VIIRS and MODIS satellites.',
                attribution: 'FIRMS data courtesy of NASA EOSDIS.',
              },
              {
                name: 'NASA EONET — Earth Observatory Natural Event Tracker',
                url: 'https://eonet.gsfc.nasa.gov',
                desc: 'Tracking natural events including storms, floods, volcanoes, and wildfires.',
                attribution: 'Data provided by NASA EONET.',
              },
              {
                name: 'OpenSky Network',
                url: 'https://opensky-network.org',
                desc: 'Real-time ADS-B flight tracking data.',
                attribution: 'Flight data from The OpenSky Network, opensky-network.org',
              },
              {
                name: 'ACLED — Armed Conflict Location & Event Data',
                url: 'https://acleddata.com',
                desc: 'Disaggregated data and analysis on political violence and protest.',
                attribution: 'Conflict data sourced from ACLED (acleddata.com). Use subject to ACLED Terms of Use.',
              },
              {
                name: 'RSS News Feeds',
                url: '#',
                desc: 'News aggregated from BBC World, Reuters, Al Jazeera, France 24, DW, The Guardian, NPR, Sky News, Euronews, Defense News, Arab News, SCMP, The Hindu, and Middle East Eye.',
                attribution: 'All news content belongs to respective publishers.',
              },
              {
                name: 'Groq / Meta Llama',
                url: 'https://groq.com',
                desc: 'AI-powered intelligence briefs generated using Llama 3.1 via Groq.',
                attribution: 'AI inference powered by Groq. Model by Meta.',
              },
              {
                name: 'Map Tiles — CARTO',
                url: 'https://carto.com',
                desc: 'Dark map tiles for the base map layer.',
                attribution: '© OpenStreetMap contributors © CARTO',
              },
            ].map((source) => (
              <div key={source.name} className="border border-border rounded p-4 bg-surface/50">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-bold text-text-primary">{source.name}</h3>
                  {source.url !== '#' && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-xs hover:underline ml-2 flex-shrink-0"
                    >
                      ↗ Visit
                    </a>
                  )}
                </div>
                <p className="text-text-muted text-xs mb-2">{source.desc}</p>
                <p className="text-xs text-green-400/70 italic">{source.attribution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Legal */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-3 border-b border-border pb-2">
            Legal & Disclaimer
          </h2>
          <div className="text-text-muted text-sm leading-relaxed space-y-3">
            <p>
              GlobalWatch is an independent project and is not affiliated with any
              government agency, military organization, or news outlet.
            </p>
            <p>
              All data displayed is sourced from publicly available APIs and is provided
              for informational purposes only. GlobalWatch makes no representations about
              the accuracy, completeness, or timeliness of any data shown.
            </p>
            <p>
              News content belongs to respective publishers. GlobalWatch does not claim
              ownership of any third-party content.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-6 border-t border-border text-text-muted text-xs">
          <p>© {new Date().getFullYear()} GlobalWatch. Built with Next.js, Leaflet.js, and open data.</p>
        </div>
      </div>
    </main>
  )
}
