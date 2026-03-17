import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import Groq from 'groq-sdk'

const CACHE_KEY = 'globalwatch:intel-brief:latest'
const TTL = 900

async function fetchContextData() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const [eqRes, dsRes, newsRes] = await Promise.allSettled([
    fetch(`${base}/api/earthquakes`).then((r) => r.json()),
    fetch(`${base}/api/disasters`).then((r) => r.json()),
    fetch(`${base}/api/news`).then((r) => r.json()),
  ])

  const earthquakes = eqRes.status === 'fulfilled'
    ? (eqRes.value.data ?? []).slice(0, 5).map((e: { title: string; magnitude: number }) =>
        `M${e.magnitude?.toFixed(1)} ${e.title}` 
      ).join('; ')
    : 'unavailable'

  const disasters = dsRes.status === 'fulfilled'
    ? (dsRes.value.data ?? []).slice(0, 5).map((e: { title: string }) => e.title).join('; ')
    : 'unavailable'

  const headlines = newsRes.status === 'fulfilled'
    ? (newsRes.value.data ?? [])
        .filter((e: { severity: string }) => ['critical', 'high'].includes(e.severity))
        .slice(0, 8)
        .map((e: { title: string; source: string }) => `[${e.source}] ${e.title}`)
        .join('\n')
    : 'unavailable'

  return { earthquakes, disasters, headlines }
}

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

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY not configured')

    const { earthquakes, disasters, headlines } = await fetchContextData()

    const groq = new Groq({ apiKey })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 350,
      messages: [
        {
          role: 'system',
          content: 'You are a concise geopolitical intelligence analyst. Write factual, neutral briefs. No speculation. No markdown. Plain text only. Maximum 3 short paragraphs.',
        },
        {
          role: 'user',
          content: `Current global situation summary:

SEISMIC: ${earthquakes}

DISASTERS: ${disasters}

HIGH-PRIORITY NEWS:
${headlines}

Write a 3-paragraph intelligence brief: (1) security threats and conflicts, (2) natural disasters and environmental hazards, (3) geopolitical developments. Be concise, factual, under 200 words total.`,
        },
      ],
    })

    const brief = completion.choices[0]?.message?.content ?? 'Brief unavailable.'

    const result = {
      brief,
      generatedAt: new Date().toISOString(),
      model: 'llama-3.1-8b-instant',
    }

    if (redis) await redis.set(CACHE_KEY, JSON.stringify(result), { ex: TTL })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Intel brief failed', error)
    return NextResponse.json({
      brief: 'Intelligence brief temporarily unavailable. Data systems nominal.',
      generatedAt: new Date().toISOString(),
      model: 'unavailable',
    })
  }
}
