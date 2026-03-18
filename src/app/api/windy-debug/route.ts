import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.WINDY_WEBCAMS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'No API key' })
  }

  const tests: unknown[] = []
  const headers = {
    'x-windy-api-key': apiKey,
    'Accept': 'application/json',
  }

  // TEST 1: nearby param (correct format from docs)
  // Format: lat,lon,radius_km
  try {
    const url = 'https://api.windy.com/webcams/api/v3/webcams' +
      '?nearby=31.77,35.21,100' +
      '&lang=en&limit=5' +
      '&include=location&include=images&include=player&include=urls'
    const r = await fetch(url, {
      headers, signal: AbortSignal.timeout(8000), cache: 'no-store'
    })
    const body = await r.text()
    tests.push({
      test: 'nearby=lat,lon,radius (CORRECT format)',
      url,
      status: r.status,
      body: body.slice(0, 600),
    })
  } catch (e) {
    tests.push({ test: 'nearby correct format', error: String(e) })
  }

  // TEST 2: bbox correct format from docs
  // Format: north_lat,east_lon,south_lat,west_lon
  try {
    const url = 'https://api.windy.com/webcams/api/v3/webcams' +
      '?bbox=33.5,36.5,29.5,34.0' +
      '&lang=en&limit=5' +
      '&include=location&include=images'
    const r = await fetch(url, {
      headers, signal: AbortSignal.timeout(8000), cache: 'no-store'
    })
    const body = await r.text()
    tests.push({
      test: 'bbox=north,east,south,west (CORRECT format)',
      url,
      status: r.status,
      body: body.slice(0, 600),
    })
  } catch (e) {
    tests.push({ test: 'bbox correct format', error: String(e) })
  }

  // TEST 3: countries filter (plural, correct param name)
  try {
    const url = 'https://api.windy.com/webcams/api/v3/webcams' +
      '?countries=IL&countries=UA' +
      '&lang=en&limit=10' +
      '&include=location&include=images&include=player'
    const r = await fetch(url, {
      headers, signal: AbortSignal.timeout(8000), cache: 'no-store'
    })
    const body = await r.text()
    tests.push({
      test: 'countries=IL&countries=UA (array format)',
      url,
      status: r.status,
      body: body.slice(0, 600),
    })
  } catch (e) {
    tests.push({ test: 'countries array', error: String(e) })
  }

  // TEST 4: map/clusters endpoint
  // Great for map display — returns cams optimized per zoom level
  try {
    const url = 'https://api.windy.com/webcams/api/v3/map/clusters' +
      '?northLat=35&eastLon=37&southLat=29&westLon=34&zoom=7' +
      '&lang=en&include=location&include=images&include=player'
    const r = await fetch(url, {
      headers, signal: AbortSignal.timeout(8000), cache: 'no-store'
    })
    const body = await r.text()
    tests.push({
      test: 'map/clusters endpoint (Israel/Gaza region)',
      url,
      status: r.status,
      body: body.slice(0, 800),
    })
  } catch (e) {
    tests.push({ test: 'map/clusters', error: String(e) })
  }

  // TEST 5: no filter baseline (we know this works)
  try {
    const url = 'https://api.windy.com/webcams/api/v3/webcams' +
      '?lang=en&limit=3&include=location&include=images'
    const r = await fetch(url, {
      headers, signal: AbortSignal.timeout(8000), cache: 'no-store'
    })
    const body = await r.text()
    tests.push({
      test: 'no filter baseline',
      status: r.status,
      body: body.slice(0, 400),
    })
  } catch (e) {
    tests.push({ test: 'no filter', error: String(e) })
  }

  return NextResponse.json({ apiKey: apiKey.slice(0, 8) + '...', tests })
}
