# Rules — Monetization & Ads

## Applies To
All files in `src/components/ui/AdSlot.tsx` and any file that renders ads

---

## Ad Slot Component — Always Use This Wrapper
```typescript
// src/components/ui/AdSlot.tsx
'use client'
import { useEffect, useRef } from 'react'

interface AdSlotProps {
  slot: string          // AdSense ad unit ID
  format: 'banner' | 'rectangle' | 'responsive'
  className?: string
}

export function AdSlot({ slot, format, className }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      // Push ad after component mounts
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
    } catch (e) {
      // AdSense not loaded (dev environment) — fail silently
    }
  }, [])

  return (
    <div ref={adRef} className={className} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format === 'responsive' ? 'auto' : format}
        data-full-width-responsive={format === 'responsive' ? 'true' : 'false'}
      />
    </div>
  )
}
```

---

## Approved Ad Placements
1. `header-banner` — 728x90 below top navigation
2. `sidebar-rectangle` — 300x600 in right panel area
3. `below-map` — responsive unit below map on scroll
4. `news-inline` — 320x50 between news items (every 8th item)
5. `footer-banner` — 728x90 in footer

---

## Prohibited Ad Placements
- Never overlay the map canvas
- Never inside the Alerts panel
- Never inside the Intel Brief panel
- Never between alert notifications
- Never as a modal or interstitial

---

## ads.txt (Required for AdSense)
Create `public/ads.txt` with:
```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```
Replace `pub-XXXXXXXXXXXXXXXX` with your actual AdSense publisher ID.

---

## AdSense Script (in src/app/layout.tsx)
```typescript
// Load AdSense script asynchronously — never synchronously
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
  strategy="lazyOnload"  // Never 'beforeInteractive'
/>
```

---

## Development Behavior
- In `NODE_ENV=development`, AdSlot renders a placeholder div instead of real ads
- Use `process.env.NEXT_PUBLIC_ADSENSE_ID` — never hardcode publisher ID
- Test ad layout with placeholder before AdSense approval
