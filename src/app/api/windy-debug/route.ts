import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.WINDY_WEBCAMS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key in env' })
  }

  const results: Record<string, unknown> = {
    apiKey: apiKey.slice(0, 8) + '...',
    tests: [],
  }

  try {
    const url1 = 'https://api.windy.com/webcams/api/v3/webcams?lang=en&limit=5&show=webcams:location,image,player,urls&bbox=31.0,34.5,32.5,36.0'
    const r1 = await fetch(url1, {
      headers: {
        'x-windy-api-key': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'GlobalWatch/1.0',
      },
      signal: AbortSignal.timeout(15000),
      // @ts-ignore
      cache: 'no-store',
    })
    const body1 = await r1.text()
    ;(results.tests as unknown[]).push({
      test: 'Jerusalem bbox',
      url: url1,
      status: r1.status,
      statusText: r1.statusText,
      headers: Object.fromEntries(r1.headers.entries()),
      body: body1.slice(0, 500),
    })
  } catch (e) {
    ;(results.tests as unknown[]).push({
      test: 'Jerusalem bbox',
      error: String(e),
    })
  }

  try {
    const url2 = 'https://api.windy.com/webcams/api/v3/webcams?lang=en&limit=3&show=webcams:location,image'
    const r2 = await fetch(url2, {
      headers: {
        'x-windy-api-key': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'GlobalWatch/1.0',
      },
      signal: AbortSignal.timeout(15000),
      // @ts-ignore
      cache: 'no-store',
    })
    const body2 = await r2.text()
    ;(results.tests as unknown[]).push({
      test: 'No bbox - any webcams',
      url: url2,
      status: r2.status,
      statusText: r2.statusText,
      body: body2.slice(0, 500),
    })
  } catch (e) {
    ;(results.tests as unknown[]).push({
      test: 'No bbox',
      error: String(e),
    })
  }

  try {
    const url3 = 'https://api.windy.com/api/webcams/v2/list/limit=3?show=webcams:location,image&key=' + apiKey
    const r3 = await fetch(url3, {
      headers: {
        'User-Agent': 'GlobalWatch/1.0',
      },
      signal: AbortSignal.timeout(15000),
      // @ts-ignore
      cache: 'no-store',
    })
    const body3 = await r3.text()
    ;(results.tests as unknown[]).push({
      test: 'v2 API format',
      url: url3.replace(apiKey, 'KEY_HIDDEN'),
      status: r3.status,
      body: body3.slice(0, 500),
    })
  } catch (e) {
    ;(results.tests as unknown[]).push({
      test: 'v2 API',
      error: String(e),
    })
  }

  try {
    const url4 = `https://api.windy.com/webcams/api/v3/webcams?lang=en&limit=3&show=webcams:location,image&key=${apiKey}` 
    const r4 = await fetch(url4, {
      headers: {
        'User-Agent': 'GlobalWatch/1.0',
      },
      signal: AbortSignal.timeout(15000),
      // @ts-ignore
      cache: 'no-store',
    })
    const body4 = await r4.text()
    ;(results.tests as unknown[]).push({
      test: 'Key as query param v3',
      status: r4.status,
      body: body4.slice(0, 500),
    })
  } catch (e) {
    ;(results.tests as unknown[]).push({
      test: 'Key as query param',
      error: String(e),
    })
  }

  return NextResponse.json(results, { status: 200 })
}
