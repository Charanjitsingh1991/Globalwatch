import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'

export async function GET() {
  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'No Redis' })

  // Delete all GlobalWatch cache keys
  const keys = [
    'globalwatch:news:all',
    'globalwatch:earthquakes:all',
    'globalwatch:conflicts:all',
    'globalwatch:fires:all',
    'globalwatch:disasters:all',
    'globalwatch:flights:all',
    'globalwatch:intel-brief:latest',
    'globalwatch:markets:all',
    'globalwatch:crypto:all',
    'globalwatch:gpsjam:all',
  ]

  await Promise.all(keys.map(k => redis.del(k)))
  return NextResponse.json({ cleared: keys, timestamp: new Date().toISOString() })
}
