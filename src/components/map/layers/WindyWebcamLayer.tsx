'use client'
import { memo, useMemo, useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import { useWindyWebcams } from '@/hooks/useWindyWebcams'
import type { WindyWebcamEvent } from '@/app/api/windy-webcams/route'
import type { TimeFilter } from '@/types/events'

interface Props {
  visible: boolean
  timeFilter: TimeFilter
}

function WindyModal({
  cam,
  onClose,
}: {
  cam: WindyWebcamEvent
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded overflow-hidden"
        style={{
          width: '640px',
          maxWidth: '95vw',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <div className="font-mono font-bold text-sm"
              style={{ color: 'var(--accent)' }}>
              📷 {cam.title}
            </div>
            <div className="font-mono text-xs mt-0.5"
              style={{ color: 'var(--text-muted)' }}>
              {cam.city && `${cam.city}, `}{cam.country}
              {cam.zone && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs"
                  style={{
                    background: 'var(--severity-high)' + '20',
                    color: 'var(--severity-high)',
                    fontSize: '10px',
                  }}>
                  {cam.zone}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={cam.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs px-2 py-1 rounded border
                transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              ↗ Windy
            </a>
            <button
              onClick={onClose}
              className="font-mono text-xs px-2 py-1 rounded border
                transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div style={{ aspectRatio: '16/9', background: '#000' }}>
          {cam.embedUrl ? (
            <iframe
              src={cam.embedUrl}
              className="w-full h-full"
              allowFullScreen
              title={cam.title}
              allow="autoplay"
            />
          ) : (
            <div className="w-full h-full flex flex-col
              items-center justify-center"
              style={{ background: 'var(--bg-surface2)' }}>
              {cam.previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cam.previewUrl}
                  alt={cam.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t font-mono text-xs"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}>
          <span>📡 Powered by Windy Webcams</span>
          {cam.viewCount > 0 && (
            <span className="ml-3">
              👁 {cam.viewCount.toLocaleString()} views
            </span>
          )}
          <span className="ml-3 text-yellow-400">
            ⚠ Preview refreshes every 15 min (free tier)
          </span>
        </div>
      </div>
    </div>
  )
}

function WindyWebcamLayerInner({ visible }: Props) {
  const map = useMap()
  const { webcams, loading } = useWindyWebcams()
  const [selectedCam, setSelectedCam] = useState<WindyWebcamEvent | null>(null)

  const filtered = useMemo(
    () => visible ? webcams : [],
    [webcams, visible]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !filtered.length) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    const markers: ReturnType<typeof L.marker>[] = []

    filtered.forEach((cam: WindyWebcamEvent) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          position: relative;
          width: 20px;
          height: 20px;
          cursor: pointer;
        ">
          <div style="
            width: 20px;
            height: 14px;
            background: #1a1a2e;
            border: 1.5px solid #00D4FF;
            border-radius: 3px;
            position: absolute;
            top: 3px;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 6px #00D4FF60;
          ">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #00D4FF;
              opacity: 0.9;
            "></div>
          </div>
          <div style="
            position: absolute;
            top: 0;
            right: 0;
            width: 6px;
            height: 6px;
            background: #22c55e;
            border-radius: 50%;
            border: 1px solid #0a0a0f;
            animation: pulse-live 2s ease-in-out infinite;
          "></div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const marker = L.marker([cam.lat, cam.lon], { icon })

      const popupContent = `
        <div style="
          background: #111118;
          color: #F0F0F0;
          font-family: monospace;
          padding: 0;
          min-width: 220px;
          font-size: 12px;
          border-radius: 4px;
          overflow: hidden;
        ">
          ${cam.previewUrl ? `
            <div style="position:relative;">
              <img
                src="${cam.previewUrl}"
                alt="${cam.title}"
                style="width:100%;height:120px;object-fit:cover;display:block;"
                onerror="this.style.display='none'"
              />
              <div style="
                position:absolute;top:4px;left:4px;
                background:rgba(0,0,0,0.75);
                border-radius:3px;padding:2px 6px;
                font-size:9px;color:#22c55e;
                display:flex;align-items:center;gap:4px;
              ">
                <span style="animation:pulse-live 2s infinite">●</span> LIVE
              </div>
            </div>
          ` : ''}
          <div style="padding: 8px;">
            <div style="
              color:#00D4FF;font-weight:bold;
              margin-bottom:4px;font-size:11px;
            ">
              📷 ${cam.title}
            </div>
            ${cam.city ? `
              <div style="color:#888;margin-bottom:2px;font-size:10px;">
                📍 ${cam.city}${cam.country ? ', ' + cam.country : ''}
              </div>
            ` : ''}
            <div style="
              display:inline-block;
              background:#F9731620;
              color:#F97316;
              border-radius:3px;
              padding:1px 6px;
              font-size:9px;
              margin-bottom:6px;
            ">
              ${cam.zone}
            </div>
            <div style="
              font-size:10px;color:#888;
              border-top:1px solid #1E1E2E;
              padding-top:6px;
            ">
              Click marker to open live player
            </div>
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 240,
        className: 'gw-popup',
      })

      marker.on('click', () => {
        setSelectedCam(cam)
      })

      marker.addTo(map)
      markers.push(marker)
    })

    return () => {
      markers.forEach(m => map.removeLayer(m))
    }
  }, [filtered, map])

  if (!visible) return null

  return (
    <>
      {selectedCam && (
        <WindyModal
          cam={selectedCam}
          onClose={() => setSelectedCam(null)}
        />
      )}
    </>
  )
}

export const WindyWebcamLayer = memo(WindyWebcamLayerInner)
export default WindyWebcamLayer
