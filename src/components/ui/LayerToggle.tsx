'use client'
import { useMapStore } from '@/store/mapStore'
import type { LayerName } from '@/types/events'

interface LayerConfig {
  key: LayerName
  label: string
  icon: string
  color: string
}

const LAYERS: LayerConfig[] = [
  { key: 'earthquakes', label: 'Earthquakes',  icon: '◎', color: '#EF4444' },
  { key: 'conflicts',   label: 'Conflicts',    icon: '⚔', color: '#F97316' },
  { key: 'fires',       label: 'Fires',        icon: '🔥', color: '#F97316' },
  { key: 'disasters',   label: 'Disasters',    icon: '⚡', color: '#EAB308' },
  { key: 'flights',     label: 'Flights',      icon: '✈', color: '#3B82F6' },
  { key: 'ships',       label: 'Ships',        icon: '⛵', color: '#06B6D4' },
  { key: 'news',        label: 'News',         icon: '📡', color: '#8B5CF6' },
  { key: 'weather',     label: 'Weather',      icon: '🌤', color: '#22C55E' },
]

export default function LayerToggle() {
  const { layers, toggleLayer } = useMapStore()

  return (
    <div className="flex flex-col gap-1">
      <div className="text-text-muted font-mono text-xs uppercase tracking-widest mb-2 px-1">
        Data Layers
      </div>
      {LAYERS.map(({ key, label, icon, color }) => {
        const active = layers[key]
        return (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded text-xs font-mono
              border transition-all duration-150 text-left
              ${active
                ? 'border-opacity-50 bg-opacity-10'
                : 'border-border bg-transparent text-text-muted opacity-50'
              }
            `}
            style={active ? {
              borderColor: color + '80',
              backgroundColor: color + '15',
              color,
            } : undefined}
          >
            <span className="text-sm">{icon}</span>
            <span>{label}</span>
            <span className={`ml-auto text-xs ${active ? 'text-green-400' : 'text-gray-600'}`}>
              {active ? 'ON' : 'OFF'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
