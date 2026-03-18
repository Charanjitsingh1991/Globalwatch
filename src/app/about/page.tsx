import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About & Data Sources — GlobalWatch',
  description: 'GlobalWatch data sources, attribution, and legal information.',
}

const DATA_SOURCES = [
  {
    name: 'USGS Earthquake Hazards Program',
    url: 'https://earthquake.usgs.gov',
    desc: 'Real-time worldwide earthquake monitoring (M2.5+).',
    attribution: 'Data provided by the U.S. Geological Survey.',
    key: false,
  },
  {
    name: 'NASA FIRMS — Fire Information for Resource Management',
    url: 'https://firms.modaps.eosdis.nasa.gov',
    desc: 'Active fire detection from VIIRS and MODIS satellites.',
    attribution: 'FIRMS data courtesy of NASA EOSDIS.',
    key: true,
  },
  {
    name: 'NASA EONET — Earth Observatory Natural Event Tracker',
    url: 'https://eonet.gsfc.nasa.gov',
    desc: 'Tracking open natural events globally.',
    attribution: 'Data provided by NASA EONET.',
    key: false,
  },
  {
    name: 'GDACS — Global Disaster Alert and Coordination System',
    url: 'https://www.gdacs.org',
    desc: 'UN-managed global disaster alerts (earthquakes, cyclones, floods).',
    attribution: 'GDACS data © European Commission / United Nations.',
    key: false,
  },
  {
    name: 'OpenSky Network',
    url: 'https://opensky-network.org',
    desc: 'Real-time ADS-B flight tracking.',
    attribution: 'Flight data from The OpenSky Network, opensky-network.org.',
    key: false,
  },
  {
    name: 'ACLED — Armed Conflict Location & Event Data',
    url: 'https://acleddata.com',
    desc: 'Disaggregated political violence and protest data.',
    attribution: 'Conflict data sourced from ACLED (acleddata.com).',
    key: true,
  },
  {
    name: 'AlienVault OTX — Open Threat Exchange',
    url: 'https://otx.alienvault.com',
    desc: 'Community cyber threat intelligence and indicators.',
    attribution: 'Cyber threat data from AlienVault OTX.',
    key: true,
  },
  {
    name: 'Polymarket',
    url: 'https://polymarket.com',
    desc: 'Real-money prediction markets for geopolitical events.',
    attribution: 'Prediction market data via Polymarket Gamma API.',
    key: false,
  },
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com',
    desc: 'Real-time stock indices, commodities, and forex data.',
    attribution: 'Market data via Yahoo Finance public API.',
    key: false,
  },
  {
    name: 'CoinGecko',
    url: 'https://www.coingecko.com',
    desc: 'Cryptocurrency prices and market capitalization.',
    attribution: 'Crypto data powered by CoinGecko.',
    key: false,
  },
  {
    name: 'TeleGeography — Submarine Cable Map',
    url: 'https://www.submarinecablemap.com',
    desc: 'Global submarine cable infrastructure routes and landing stations.',
    attribution: 'Cable data informed by TeleGeography research.',
    key: false,
  },
  {
    name: 'RSS News Aggregation',
    url: '#',
    desc: 'News from BBC World, Reuters, Al Jazeera, France 24, DW, Guardian, NPR, Sky News, Euronews, Defense News, Arab News, SCMP, The Hindu, Middle East Eye.',
    attribution: 'All news content © respective publishers.',
    key: false,
  },
  {
    name: 'Groq / Meta Llama',
    url: 'https://groq.com',
    desc: 'AI intelligence briefs via Llama 3.1 on Groq infrastructure.',
    attribution: 'AI inference by Groq. Llama model by Meta.',
    key: true,
  },
  {
    name: 'Map Tiles — CARTO + OpenStreetMap',
    url: 'https://carto.com',
    desc: 'Base map tiles for the global dashboard.',
    attribution: '© OpenStreetMap contributors © CARTO.',
    key: false,
  },
]

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

        {/* Stats */}
        <section className="mb-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Data Sources',   value: '14+' },
            { label: 'Map Layers',     value: '12' },
            { label: 'Update Freq',    value: '15s–1hr' },
          ].map((stat) => (
            <div key={stat.label}
              className="border border-border rounded p-4 bg-surface/50 text-center">
              <div className="text-accent font-mono text-2xl font-bold">{stat.value}</div>
              <div className="text-text-muted font-mono text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* About */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3 border-b border-border pb-2">About</h2>
          <p className="text-text-muted text-sm leading-relaxed">
            GlobalWatch is an independent real-time global intelligence dashboard
            aggregating publicly available data from government agencies, academic
            institutions, and open data projects. It is built for situational awareness,
            research, and informational purposes.
          </p>
        </section>

        {/* Data Sources */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">
            Data Sources & Attribution
          </h2>
          <div className="space-y-3">
            {DATA_SOURCES.map((source) => (
              <div key={source.name}
                className="border border-border rounded p-4 bg-surface/50">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-primary">
                      {source.name}
                    </h3>
                    {source.key && (
                      <span className="px-1 py-0.5 rounded font-mono text-xs
                        bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        API KEY
                      </span>
                    )}
                  </div>
                  {source.url !== '#' && (
                    <a href={source.url} target="_blank" rel="noopener noreferrer"
                      className="text-accent text-xs hover:underline ml-2 flex-shrink-0">
                      ↗
                    </a>
                  )}
                </div>
                <p className="text-text-muted text-xs mb-1">{source.desc}</p>
                <p className="text-xs text-green-400/70 italic">{source.attribution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Legal */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3 border-b border-border pb-2">
            Legal & Disclaimer
          </h2>
          <div className="text-text-muted text-sm leading-relaxed space-y-3">
            <p>
              GlobalWatch is an independent project, not affiliated with any government,
              military organization, or news outlet.
            </p>
            <p>
              All data is from publicly available sources for informational purposes only.
              GlobalWatch makes no representations about accuracy or timeliness.
              Do not use this data for operational decisions.
            </p>
            <p>
              News content belongs to respective publishers.
              This site is monetized via Google AdSense. Ads are served by Google.
            </p>
          </div>
        </section>

        <div className="pt-6 border-t border-border text-text-muted text-xs">
          <p>
            © {new Date().getFullYear()} GlobalWatch.
            Built with Next.js, Leaflet.js, and open data.
          </p>
        </div>
      </div>
    </main>
  )
}
