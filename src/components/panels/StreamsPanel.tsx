'use client'
import { useState, useEffect } from 'react'
import {
  YOUTUBE_STREAMS, WEBCAM_SOURCES, STREAM_REGIONS,
  type StreamRegion,
} from '@/lib/streamSources'

type Tab = 'news' | 'webcams'

const WEBCAM_REGIONS = [
  { id: 'all',       label: '🌍 All' },
  { id: 'mena',      label: '🕌 MENA' },
  { id: 'southasia', label: '🇮🇳 S.Asia' },
  { id: 'eastasia',  label: '🏯 E.Asia' },
  { id: 'europe',    label: '🇪🇺 Europe' },
  { id: 'africa',    label: '🌍 Africa' },
  { id: 'americas',  label: '🌎 Americas' },
  { id: 'oceania',   label: '🦘 Oceania' },
]

export default function StreamsPanel({ 
  defaultTab = 'news' 
}: { defaultTab?: 'news' | 'webcams' }) {
  const [tab, setTab]                   = useState<Tab>(defaultTab as Tab)
  const [streamRegion, setStreamRegion] = useState<StreamRegion>('all')
  const [webcamRegion, setWebcamRegion] = useState('all')
  const [activeStream, setActiveStream] = useState(YOUTUBE_STREAMS[0].id)
  const [activeWebcam, setActiveWebcam] = useState<string | null>(null)
  const [streamError, setStreamError]   = useState(false)

  const filteredStreams = streamRegion === 'all'
    ? YOUTUBE_STREAMS
    : YOUTUBE_STREAMS.filter(s => s.category === streamRegion)

  const filteredWebcams = webcamRegion === 'all'
    ? WEBCAM_SOURCES
    : WEBCAM_SOURCES.filter(w => w.region === webcamRegion)

  const currentStream = YOUTUBE_STREAMS.find(s => s.id === activeStream)
    ?? YOUTUBE_STREAMS[0]

  const expandedCam = WEBCAM_SOURCES.find(w => w.id === activeWebcam)

  useEffect(() => { setStreamError(false) }, [activeStream])

  function getEmbedUrl(stream: typeof currentStream) {
    return `https://www.youtube.com/embed/live_stream?channel=${stream.channelId}&autoplay=1&mute=0&rel=0&modestbranding=1&enablejsapi=1` 
  }

  return (
    <div className="flex flex-col h-full">

      <div className="flex border-b border-border flex-shrink-0">
        {(['news', 'webcams'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-mono border-b-2 transition-all ${
              tab === t
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-primary'
            }`}>
            {t === 'news'
              ? `📺 NEWS (${YOUTUBE_STREAMS.length})` 
              : `📷 CAMS (${WEBCAM_SOURCES.length})`}
          </button>
        ))}
      </div>

      {tab === 'news' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          <div className="relative bg-black flex-shrink-0"
            style={{ aspectRatio: '16/9' }}>

            {streamError ? (
              <div className="absolute inset-0 flex flex-col items-center
                justify-center bg-black/95 p-4 text-center">
                <div className="text-4xl mb-3">{currentStream.flag}</div>
                <div className="text-white font-mono text-sm font-bold mb-1">
                  {currentStream.name}
                </div>
                <div className="text-white/50 font-mono text-xs mb-4">
                  Stream not available in embedded player
                </div>
                <a
                  href={currentStream.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700
                    text-white font-mono text-xs px-4 py-2 rounded
                    transition-colors"
                >
                  ▶ Watch on YouTube
                </a>
                <div className="text-white/30 font-mono text-xs mt-3">
                  Some channels restrict embedding.
                  Click above to watch live.
                </div>
              </div>
            ) : (
              <iframe
                key={activeStream}
                src={getEmbedUrl(currentStream)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write;
                  encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentStream.name}
                onError={() => setStreamError(true)}
              />
            )}

            {!streamError && (
              <div className="absolute top-2 left-2 bg-black/80 rounded
                px-2 py-1 font-mono text-xs text-white
                flex items-center gap-1.5 pointer-events-none">
                <span className="text-red-400 animate-pulse">●</span>
                {currentStream.flag} {currentStream.name}
              </div>
            )}

            <a
              href={currentStream.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 bg-black/70 hover:bg-red-600
                text-white font-mono text-xs px-2 py-1 rounded
                transition-colors flex items-center gap-1"
              title="Open in YouTube"
            >
              ↗ YT
            </a>
          </div>

          <div className="flex gap-1 p-2 border-b border-border
            overflow-x-auto flex-shrink-0 scrollbar-none">
            {STREAM_REGIONS.map(r => (
              <button key={r.id}
                onClick={() => setStreamRegion(r.id as StreamRegion)}
                className={`px-2 py-0.5 text-xs font-mono rounded
                  whitespace-nowrap transition-all flex-shrink-0 ${
                  streamRegion === r.id
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-accent'
                }`}>
                {r.flag} {r.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {filteredStreams.map(stream => (
                <button key={stream.id}
                  onClick={() => setActiveStream(stream.id)}
                  className={`text-left p-2 rounded border transition-all
                    font-mono text-xs ${
                    activeStream === stream.id
                      ? 'border-primary bg-primary/15 text-accent'
                      : 'border-border text-text-muted hover:bg-white/5'
                  }`}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-sm">{stream.flag}</span>
                    {activeStream === stream.id && (
                      <span className="text-red-400 animate-pulse text-xs">●</span>
                    )}
                    <span className="text-xs opacity-40 ml-auto">
                      {stream.language}
                    </span>
                  </div>
                  <div className="font-bold truncate text-xs leading-tight">
                    {stream.name}
                  </div>
                  <div className="opacity-50 truncate text-xs">
                    {stream.country}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'webcams' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          {activeWebcam && expandedCam ? (
            <div className="flex flex-col flex-1">
              <div className="p-2 border-b border-border flex-shrink-0
                flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{expandedCam.flag}</span>
                  <div>
                    <div className="text-accent font-mono text-xs font-bold">
                      {expandedCam.name}
                    </div>
                    <div className="text-text-muted font-mono text-xs">
                      {expandedCam.location}, {expandedCam.country}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={expandedCam.watchUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs text-text-muted
                      hover:text-accent border border-border
                      rounded px-2 py-0.5 transition-colors">
                    ↗ Open
                  </a>
                  <button onClick={() => setActiveWebcam(null)}
                    className="font-mono text-xs text-text-muted
                      hover:text-accent border border-border
                      rounded px-2 py-0.5 transition-colors">
                    ⊞ Grid
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-black relative overflow-hidden">
                <iframe
                  key={activeWebcam}
                  src={expandedCam.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write;
                    encrypted-media; gyroscope"
                  allowFullScreen
                  title={expandedCam.name}
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
                <div className="absolute top-2 left-2 bg-black/70 rounded
                  px-2 py-1 font-mono text-xs text-white
                  flex items-center gap-1 pointer-events-none">
                  <span className="text-green-400 animate-pulse">●</span>
                  LIVE — {expandedCam.flag} {expandedCam.location}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">

              <div className="flex gap-1 p-2 border-b border-border
                overflow-x-auto flex-shrink-0">
                {WEBCAM_REGIONS.map(r => (
                  <button key={r.id}
                    onClick={() => setWebcamRegion(r.id)}
                    className={`px-2 py-0.5 text-xs font-mono rounded
                      whitespace-nowrap transition-all flex-shrink-0 ${
                      webcamRegion === r.id
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:text-accent'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="px-3 py-1.5 border-b border-border flex-shrink-0
                font-mono text-xs text-text-muted">
                {filteredWebcams.length} live cameras •
                click any to expand full screen
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-2 gap-2">
                  {filteredWebcams.map(cam => (
                    <div key={cam.id} className="relative">
                      <button
                        onClick={() => setActiveWebcam(cam.id)}
                        className="w-full relative bg-surface border border-border
                          rounded overflow-hidden hover:border-primary
                          transition-all group"
                        style={{ aspectRatio: '16/9' }}>

                        <iframe
                          src={cam.embedUrl}
                          className="w-full h-full pointer-events-none"
                          allow="autoplay"
                          title={cam.name}
                          sandbox="allow-scripts allow-same-origin"
                          loading="lazy"
                        />

                        <div className="absolute bottom-0 left-0 right-0
                          bg-gradient-to-t from-black/95 to-transparent
                          p-1.5 pointer-events-none">
                          <div className="flex items-center gap-1">
                            <span className="text-green-400 text-xs
                              animate-pulse">●</span>
                            <span className="font-mono text-xs text-white
                              truncate font-bold">
                              {cam.flag} {cam.name}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-white/50
                            truncate">
                            {cam.location}
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-transparent
                          group-hover:bg-primary/10 transition-colors
                          flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100
                            font-mono text-xs text-white bg-black/70
                            rounded px-2 py-1 transition-opacity
                            border border-white/20">
                            ⛶ Expand
                          </span>
                        </div>
                      </button>

                      <a
                        href={cam.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-1 right-1 bg-black/60
                          hover:bg-black/90 text-white font-mono text-xs
                          px-1.5 py-0.5 rounded transition-colors z-10"
                        onClick={e => e.stopPropagation()}
                        title="Open in new tab"
                      >
                        ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
