import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Severity, TimeFilter } from '@/types/events'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s ago` 
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago` 
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago` 
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago` 
  return new Date(iso).toLocaleDateString()
}

export function getSeverityColor(severity: Severity): string {
  const colors: Record<Severity, string> = {
    critical: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#22C55E',
    info: '#3B82F6',
    unknown: '#6B7280',
  }
  return colors[severity] ?? colors.unknown
}

export function isWithinTimeFilter(timestamp: string, filter: TimeFilter): boolean {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diff = now - then
  const map: Record<TimeFilter, number> = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '48h': 172800000,
    '7d': 604800000,
  }
  return diff <= map[filter]
}

export function getMagnitudeSeverity(magnitude: number): Severity {
  if (magnitude >= 7) return 'critical'
  if (magnitude >= 6) return 'high'
  if (magnitude >= 5) return 'medium'
  if (magnitude >= 3) return 'low'
  return 'info'
}

export function getFatalitySeverity(fatalities: number): Severity {
  if (fatalities > 100) return 'critical'
  if (fatalities > 20) return 'high'
  if (fatalities > 5) return 'medium'
  if (fatalities > 0) return 'low'
  return 'info'
}
