'use client'
import { useState } from 'react'
import { useMapStore } from '@/store/mapStore'
import { LAYER_CONFIG, LAYER_CATEGORIES } from '@/lib/layerConfig'
import type { LayerName } from '@/types/events'

type ExtendedLayerName = LayerName | 'gpsjam' | 'cables' | 'military' | 'cyber'

export default function LayerToggle() {
  const { layers, toggleLayer } = useMapStore()
  const [expanded, setExpanded] = useState<string>('security')

  return (
    <div className="flex flex-col gap-1">
      <div className="text-text-muted font-mono text-xs uppercase tracking-widest mb-2 px-1">
        Data Layers
      </div>
      {LAYER_CATEGORIES.map((category) => {
        const categoryLayers = LAYER_CONFIG.filter((l) => l.category === category)
        const isOpen = expanded === category
        const activeCount = categoryLayers.filter(
          (l) => layers[l.key as keyof typeof layers]
        ).length

        return (
          <div key={category} className="mb-1">
            <button
              onClick={() => setExpanded(isOpen ? '' : category)}
              className="w-full flex items-center justify-between px-2 py-1.5
                text-xs font-mono text-text-muted hover:text-accent
                border border-border rounded transition-colors"
            >
              <span className="uppercase tracking-widest">{category}</span>
              <span className="flex items-center gap-1">
                {activeCount > 0 && (
                  <span className="text-green-400 text-xs">{activeCount}</span>
                )}
                <span>{isOpen ? '▲' : '▼'}</span>
              </span>
            </button>

            {isOpen && (
              <div className="mt-1 flex flex-col gap-0.5 pl-1">
                {categoryLayers.map(({ key, label, icon, color }) => {
                  const active = layers[key as keyof typeof layers]
                  return (
                    <button
                      key={key}
                      onClick={() => toggleLayer(key as ExtendedLayerName as LayerName)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded
                        text-xs font-mono border transition-all duration-150 text-left`}
                      style={active ? {
                        borderColor: color + '60',
                        backgroundColor: color + '12',
                        color,
                      } : {
                        borderColor: 'transparent',
                        color: '#888',
                      }}
                    >
                      <span>{icon}</span>
                      <span className="flex-1">{label}</span>
                      <span className={active ? 'text-green-400' : 'text-gray-600'}>
                        {active ? '●' : '○'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
