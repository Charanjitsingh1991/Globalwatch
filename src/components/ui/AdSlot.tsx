'use client'
import { useEffect, useRef } from 'react'

interface AdSlotProps {
  slot?: string
  format?: 'banner' | 'rectangle' | 'responsive'
  className?: string
  label?: string
  style?: React.CSSProperties
}

export default function AdSlot({
  slot,
  format = 'responsive',
  className = '',
  label = 'Advertisement',
  style,
}: AdSlotProps) {
  const isDev = process.env.NODE_ENV === 'development'
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isDev || !publisherId || !slot) return
    try {
      ;(window as { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as { adsbygoogle?: unknown[] }).adsbygoogle || []
      ;((window as { adsbygoogle?: unknown[] }).adsbygoogle as unknown[]).push({})
    } catch {
      // AdSense not loaded
    }
  }, [isDev, publisherId, slot])

  // Dev placeholder
  if (isDev || !publisherId) {
    return (
      <div
        className={`flex items-center justify-center bg-surface/50
          border border-dashed border-border text-text-muted
          font-mono text-xs ${className}`}
        style={style}
      >
        [{label}]
      </div>
    )
  }

  return (
    <div ref={adRef} className={className} style={style} aria-label={label}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format === 'responsive' ? 'auto' : format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
