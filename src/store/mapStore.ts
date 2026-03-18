import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LayerName, TimeFilter, BaseEvent } from '@/types/events'

interface LayerState {
  conflicts: boolean
  earthquakes: boolean
  fires: boolean
  flights: boolean
  ships: boolean
  weather: boolean
  news: boolean
  disasters: boolean
  gpsjam: boolean
  cables: boolean
  military: boolean
  cyber: boolean
  windycams: boolean
}

interface MapStore {
  layers: LayerState
  timeFilter: TimeFilter
  region: string
  selectedEvent: BaseEvent | null
  toggleLayer: (layer: LayerName) => void
  setTimeFilter: (filter: TimeFilter) => void
  setRegion: (region: string) => void
  selectEvent: (event: BaseEvent | null) => void
}

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      layers: {
        conflicts: true,
        earthquakes: true,
        fires: true,
        flights: true,
        ships: false,
        weather: false,
        news: true,
        disasters: true,
        gpsjam: false,
        cables: false,
        military: false,
        cyber: false,
        windycams: false,
      },
      timeFilter: '24h',
      region: 'global',
      selectedEvent: null,
      toggleLayer: (layer) =>
        set((state) => ({
          layers: { ...state.layers, [layer]: !state.layers[layer] },
        })),
      setTimeFilter: (filter) => set({ timeFilter: filter }),
      setRegion: (region) => set({ region }),
      selectEvent: (event) => set({ selectedEvent: event }),
    }),
    {
      name: 'globalwatch-map-store',
      partialize: (state) => ({ layers: state.layers, timeFilter: state.timeFilter }),
    }
  )
)
