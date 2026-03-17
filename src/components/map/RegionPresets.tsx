'use client'
import { useMap } from 'react-leaflet'
import { REGION_PRESETS, type RegionKey } from '@/lib/timeUtils'
import { useMapStore } from '@/store/mapStore'

const REGION_LABELS: Record<RegionKey, string> = {
  global:   'GLOBAL',
  americas: 'AMERICAS',
  europe:   'EUROPE',
  mena:     'MENA',
  asia:     'ASIA',
  latam:    'LATAM',
  africa:   'AFRICA',
  oceania:  'OCEANIA',
}

export default function RegionPresets() {
  const map = useMap()
  const { region, setRegion } = useMapStore()

  function jumpTo(key: RegionKey) {
    const preset = REGION_PRESETS[key]
    map.setView(preset.center, preset.zoom, { animate: true, duration: 0.8 })
    setRegion(key)
  }

  return (
    <div className="absolute bottom-6 left-4 z-[1000] flex flex-col gap-1">
      {(Object.keys(REGION_PRESETS) as RegionKey[]).map((key) => (
        <button
          key={key}
          onClick={() => jumpTo(key)}
          className={`
            px-2 py-1 text-xs font-mono rounded
            border transition-all duration-150
            ${region === key
              ? 'bg-primary border-primary text-white'
              : 'bg-surface/80 border-border text-text-muted hover:border-primary hover:text-accent'
            }
          `}
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {REGION_LABELS[key]}
        </button>
      ))}
    </div>
  )
}
