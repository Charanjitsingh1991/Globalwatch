'use client'
import { useState, useEffect, useRef } from 'react'
import {
  NEWS_CHANNELS, STREAM_REGIONS,
  type StreamRegion, type NewsChannel,
} from '@/lib/streamSources'

// ─── HLS Video Player ─────────────────────────────────────
function ChannelPlayer({ channel }: { channel: NewsChannel }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef   = useRef<unknown>(null)
  const [state, setState] = useState<
    'loading' | 'playing' | 'fallback' | 'failed'
  >('loading')

  useEffect(() => {
    let destroyed = false
    setState('loading')

    const video = videoRef.current
    if (!video) return

    // Cleanup previous instance
    if (hlsRef.current) {
      const old = hlsRef.current as { destroy: () => void }
      old.destroy()
      hlsRef.current = null
    }
    video.src = ''

    async function tryHLS(url: string): Promise<boolean> {
      if (destroyed) return false

      // Safari native HLS
      if (video!.canPlayType('application/vnd.apple.mpegurl')) {
        video!.src = url
        try {
          await video!.play()
          if (!destroyed) setState('playing')
          return true
        } catch {
          return false
        }
      }

      // hls.js for Chrome/Firefox
      try {
        const HlsModule = await import('hls.js')
        const Hls = HlsModule.default
        if (!Hls.isSupported()) return false

        return await new Promise<boolean>((resolve) => {
          const hls = new Hls({
            maxBufferLength: 20,
            liveSyncDurationCount: 3,
            enableWorker: true,
          })
          hlsRef.current = hls

          hls.loadSource(url)
          hls.attachMedia(video!)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video!.play().catch(() => {})
            if (!destroyed) setState('playing')
            resolve(true)
          })

          hls.on(Hls.Events.ERROR, (
            _: unknown,
            data: { fatal?: boolean }
          ) => {
            if (data.fatal) {
              hls.destroy()
              hlsRef.current = null
              resolve(false)
            }
          })

          // Timeout after 8 seconds
          setTimeout(() => resolve(false), 8000)
        })
      } catch {
        return false
      }
    }

    async function init() {
      // Try primary HLS URL
      if (channel.hlsUrl) {
        const ok = await tryHLS(channel.hlsUrl)
        if (ok || destroyed) return
      }

      // Try fallback HLS URL
      if (channel.hlsFallback) {
        const ok = await tryHLS(channel.hlsFallback)
        if (ok || destroyed) return
      }

      // Fall back to YouTube embed
      if (!destroyed) setState('fallback')
    }

    init()

    return () => {
      destroyed = true
      if (hlsRef.current) {
        const hls = hlsRef.current as { destroy: () => void }
        hls.destroy()
        hlsRef.current = null
      }
      if (video) {
        video.pause()
        video.src = ''
      }
    }
  }, [channel.id, channel.hlsUrl, channel.hlsFallback])

  if (state === 'fallback' && channel.youtubeId) {
    return (
      <iframe
        key={`${channel.id}-yt`}
        src={`https://www.youtube.com/embed/${channel.youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media"
        allowFullScreen
        title={channel.name}
      />
    )
  }

  if (state === 'failed') {
    return (
      <div className="absolute inset-0 flex flex-col items-center
        justify-center p-4 text-center"
        style={{ background: 'var(--bg)' }}>
        <div className="text-3xl mb-2">{channel.flag}</div>
        <div className="font-mono text-sm font-bold mb-3"
          style={{ color: 'var(--text)' }}>
          {channel.name}
        </div>
        <a href={channel.watchUrl} target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded text-xs font-mono text-white"
          style={{ background: '#dc2626' }}>
          ▶ Watch Live
        </a>
      </div>
    )
  }

  return (
    <>
      {state === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#000' }}>
          <div className="font-mono text-xs animate-pulse"
            style={{ color: 'var(--accent)' }}>
            ⟳ Connecting to {channel.name}...
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        style={{ background: '#000' }}
        autoPlay
        playsInline
        controls
        muted={false}
      />
    </>
  )
}

// ─── Main Component ────────────────────────────────────────
export default function LiveNewsChannels() {
  const [region, setRegion]     = useState<StreamRegion>('all')
  const [activeId, setActiveId] = useState(NEWS_CHANNELS[0].id)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filtered = region === 'all'
    ? NEWS_CHANNELS
    : NEWS_CHANNELS.filter(c => c.category === region)

  const current = NEWS_CHANNELS.find(c => c.id === activeId)
    ?? NEWS_CHANNELS[0]

  return (
    <div className="flex flex-col h-full">

      {/* Video player */}
      <div className="relative flex-shrink-0"
        style={{ aspectRatio: '16/9', background: '#000' }}>
        {mounted && (
          <ChannelPlayer key={activeId} channel={current} />
        )}

        {/* Channel label */}
        <div className="absolute top-2 left-2 z-10 flex items-center
          gap-1.5 px-2 py-1 rounded font-mono text-xs text-white
          pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <span style={{ color: '#ef4444' }}
            className="animate-pulse">●</span>
          {current.flag} {current.name}
        </div>

        {/* Open externally */}
        <a href={current.watchUrl} target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 z-10 px-2 py-1 rounded
            font-mono text-xs text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          ↗
        </a>
      </div>

      {/* Region filters */}
      <div className="flex gap-1 p-1.5 border-b overflow-x-auto
        flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        {STREAM_REGIONS.map(r => (
          <button key={r.id}
            onClick={() => setRegion(r.id as StreamRegion)}
            className="px-1.5 py-0.5 font-mono rounded
              whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              fontSize: '10px',
              background: region === r.id
                ? 'var(--primary)' : 'transparent',
              color: region === r.id
                ? '#fff' : 'var(--text-muted)',
            }}>
            {r.flag} {r.label}
          </button>
        ))}
      </div>

      {/* Channel grid */}
      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="grid grid-cols-2 gap-1">
          {filtered.map(ch => (
            <button key={ch.id}
              onClick={() => setActiveId(ch.id)}
              className="text-left p-1.5 rounded border transition-all"
              style={{
                borderColor: activeId === ch.id
                  ? 'var(--primary)' : 'var(--border)',
                background: activeId === ch.id
                  ? 'var(--primary-dim)' : 'transparent',
              }}>
              <div className="flex items-center gap-1 mb-0.5">
                <span style={{ fontSize: '12px' }}>{ch.flag}</span>
                {activeId === ch.id && (
                  <span style={{ color: '#ef4444', fontSize: '8px' }}
                    className="animate-pulse">●</span>
                )}
                <span className="ml-auto font-mono"
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-dim)',
                  }}>
                  {ch.language}
                </span>
              </div>
              <div className="font-mono font-bold truncate"
                style={{
                  fontSize: '10px',
                  color: activeId === ch.id
                    ? 'var(--accent)' : 'var(--text)',
                }}>
                {ch.name}
              </div>
              <div className="font-mono truncate"
                style={{
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                }}>
                {ch.country}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
