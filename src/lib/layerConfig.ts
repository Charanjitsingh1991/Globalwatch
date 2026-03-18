import type { LayerName } from '@/types/events'

export interface LayerConfig {
  key: LayerName | 'gpsjam' | 'cables' | 'military' | 'cyber'
  label: string
  icon: string
  color: string
  defaultOn: boolean
  category: 'security' | 'natural' | 'transport' | 'infrastructure' | 'media'
}

export const LAYER_CONFIG: LayerConfig[] = [
  // Security
  { key: 'conflicts',  label: 'Conflicts',       icon: '⚔',  color: '#EF4444', defaultOn: true,  category: 'security' },
  { key: 'cyber',      label: 'Cyber Threats',   icon: '💻', color: '#8B5CF6', defaultOn: false, category: 'security' },
  { key: 'gpsjam',     label: 'GPS Jamming',     icon: '📡', color: '#F97316', defaultOn: false, category: 'security' },
  { key: 'military',   label: 'Military Bases',  icon: '🎖', color: '#EF4444', defaultOn: false, category: 'security' },
  // Natural
  { key: 'earthquakes',label: 'Earthquakes',     icon: '◎',  color: '#EF4444', defaultOn: true,  category: 'natural' },
  { key: 'fires',      label: 'Wildfires',       icon: '🔥', color: '#F97316', defaultOn: true,  category: 'natural' },
  { key: 'disasters',  label: 'Disasters',       icon: '⚡', color: '#EAB308', defaultOn: true,  category: 'natural' },
  { key: 'weather',    label: 'Weather',         icon: '🌤', color: '#22C55E', defaultOn: false, category: 'natural' },
  // Transport
  { key: 'flights',    label: 'Flights',         icon: '✈',  color: '#3B82F6', defaultOn: true,  category: 'transport' },
  { key: 'ships',      label: 'Ships',           icon: '⛵', color: '#06B6D4', defaultOn: false, category: 'transport' },
  // Infrastructure
  { key: 'cables',     label: 'Submarine Cables',icon: '🌊', color: '#00D4FF', defaultOn: false, category: 'infrastructure' },
  { key: 'windycams',  label: 'Windy Webcams',   icon: '📷', color: '#00D4FF', defaultOn: false, category: 'infrastructure' },
  // Media
  { key: 'news',       label: 'News Events',     icon: '📰', color: '#8B5CF6', defaultOn: true,  category: 'media' },
]

export const LAYER_CATEGORIES = ['security', 'natural', 'transport', 'infrastructure', 'media'] as const
