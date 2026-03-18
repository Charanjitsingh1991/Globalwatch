'use client'
import { useState } from 'react'

export default function WindyTest() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function testDirect() {
    setLoading(true)
    try {
      const r = await fetch('/api/windy-debug')
      const json = await r.json()
      setResult(JSON.stringify(json, null, 2))
    } catch (e) {
      setResult('Error: ' + String(e))
    }
    setLoading(false)
  }

  async function testWindyDirect() {
    setLoading(true)
    try {
      const r = await fetch(
        'https://api.windy.com/webcams/api/v3/webcams?lang=en&limit=3&show=webcams:location,image',
        {
          headers: {
            'x-windy-api-key': 'NIN51QH2JDvoVEn04QjdpDB9dp5tQvmw',
          },
        }
      )
      const json = await r.json()
      setResult(JSON.stringify(json, null, 2))
    } catch (e) {
      setResult('Browser fetch error: ' + String(e))
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: '#0a0a0f', color: '#f0f0f0',
      minHeight: '100vh', padding: '20px',
      fontFamily: 'monospace',
    }}>
      <h1 style={{ color: '#00d4ff', marginBottom: '20px' }}>
        Windy API Test
      </h1>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={testDirect}
          disabled={loading}
          style={{
            background: '#1a56a0', color: '#fff',
            border: 'none', padding: '8px 16px',
            borderRadius: '4px', cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Test via Server Route
        </button>
        <button
          onClick={testWindyDirect}
          disabled={loading}
          style={{
            background: '#1a56a0', color: '#fff',
            border: 'none', padding: '8px 16px',
            borderRadius: '4px', cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Test Windy Direct from Browser
        </button>
      </div>
      {loading && (
        <div style={{ color: '#888' }}>Loading...</div>
      )}
      {result && (
        <pre style={{
          background: '#111118',
          border: '1px solid #1e1e2e',
          padding: '16px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '11px',
          maxHeight: '80vh',
        }}>
          {result}
        </pre>
      )}
    </div>
  )
}
