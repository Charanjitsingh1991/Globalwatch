import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const CACHE_KEY = 'globalwatch:gpsjam:all'
const TTL = 3600

export interface GPSJamZone {
  id: string
  lat: number
  lon: number
  radius: number
  severity: 'critical' | 'high' | 'medium'
  region: string
  description: string
  updatedAt: string
}

// Known persistent GPS jamming zones based on public reports
// Sources: gpsjam.org, EUROCONTROL PIREPS, public aviation notices
const KNOWN_JAM_ZONES: GPSJamZone[] = [
  { id: 'gj-syria',      lat: 35.0,  lon: 38.0,  radius: 300, severity: 'critical', region: 'Syria/Lebanon', description: 'Active conflict zone — persistent GPS denial' , updatedAt: new Date().toISOString() },
  { id: 'gj-kaliningrad',lat: 54.7,  lon: 20.5,  radius: 200, severity: 'critical', region: 'Kaliningrad (Russia)', description: 'Russian electronic warfare — affects Baltic region', updatedAt: new Date().toISOString() },
  { id: 'gj-ukraine-e',  lat: 48.5,  lon: 38.0,  radius: 250, severity: 'critical', region: 'Eastern Ukraine', description: 'Active conflict zone — widespread GPS jamming', updatedAt: new Date().toISOString() },
  { id: 'gj-crimea',     lat: 44.9,  lon: 34.1,  radius: 150, severity: 'high',     region: 'Crimea', description: 'Russian EW operations — GPS interference', updatedAt: new Date().toISOString() },
  { id: 'gj-gaza',       lat: 31.5,  lon: 34.5,  radius: 100, severity: 'critical', region: 'Gaza/Israel', description: 'Active conflict — GPS denial operations', updatedAt: new Date().toISOString() },
  { id: 'gj-finland',    lat: 66.5,  lon: 25.7,  radius: 200, severity: 'high',     region: 'Northern Finland/Norway', description: 'Russian jamming affecting Lapland region', updatedAt: new Date().toISOString() },
  { id: 'gj-black-sea',  lat: 43.0,  lon: 34.0,  radius: 250, severity: 'high',     region: 'Black Sea', description: 'Widespread spoofing — affects shipping routes', updatedAt: new Date().toISOString() },
  { id: 'gj-persian-gulf',lat: 26.5, lon: 55.0,  radius: 200, severity: 'medium',   region: 'Persian Gulf', description: 'Iranian spoofing operations reported', updatedAt: new Date().toISOString() },
  { id: 'gj-south-china',lat: 15.0,  lon: 112.0, radius: 300, severity: 'medium',   region: 'South China Sea', description: 'Reported GPS interference in disputed waters', updatedAt: new Date().toISOString() },
  { id: 'gj-taiwan',     lat: 24.0,  lon: 121.0, radius: 150, severity: 'medium',   region: 'Taiwan Strait', description: 'Periodic GPS disruptions reported', updatedAt: new Date().toISOString() },
  { id: 'gj-red-sea',    lat: 15.0,  lon: 42.0,  radius: 200, severity: 'high',     region: 'Red Sea/Yemen', description: 'Houthi EW operations — maritime GPS interference', updatedAt: new Date().toISOString() },
  { id: 'gj-libya',      lat: 27.0,  lon: 17.0,  radius: 200, severity: 'medium',   region: 'Libya', description: 'Reported GPS interference in conflict areas', updatedAt: new Date().toISOString() },
]

export async function GET() {
  const redis = getRedis()
  try {
    if (redis) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
        return NextResponse.json(parsed)
      }
    }
    const result = {
      data: KNOWN_JAM_ZONES,
      stale: false,
      baseline: false,
      timestamp: new Date().toISOString(),
      source: 'gpsjam-static',
      count: KNOWN_JAM_ZONES.length,
    }
    if (redis) await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })
    return NextResponse.json(result)
  } catch (error) {
    logger.error('GPSJam fetch failed', error)
    return NextResponse.json({
      data: KNOWN_JAM_ZONES, stale: false, baseline: false,
      timestamp: new Date().toISOString(),
      source: 'gpsjam-static', count: KNOWN_JAM_ZONES.length,
    })
  }
}
