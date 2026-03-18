'use client'
import { useState, useEffect } from 'react'

interface ClockCity {
  name: string
  timezone: string
  flag: string
  region: string
}

const CITIES: ClockCity[] = [
  { name: 'UTC',         timezone: 'UTC',                   flag: '🌐', region: 'All' },
  { name: 'New York',    timezone: 'America/New_York',      flag: '🇺🇸', region: 'Americas' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles',   flag: '🇺🇸', region: 'Americas' },
  { name: 'São Paulo',   timezone: 'America/Sao_Paulo',     flag: '🇧🇷', region: 'Americas' },
  { name: 'London',      timezone: 'Europe/London',         flag: '🇬🇧', region: 'Europe' },
  { name: 'Paris',       timezone: 'Europe/Paris',          flag: '🇫🇷', region: 'Europe' },
  { name: 'Berlin',      timezone: 'Europe/Berlin',         flag: '🇩🇪', region: 'Europe' },
  { name: 'Kyiv',        timezone: 'Europe/Kyiv',           flag: '🇺🇦', region: 'Europe' },
  { name: 'Moscow',      timezone: 'Europe/Moscow',         flag: '🇷🇺', region: 'Europe' },
  { name: 'Dubai',       timezone: 'Asia/Dubai',            flag: '🇦🇪', region: 'MENA' },
  { name: 'Riyadh',      timezone: 'Asia/Riyadh',           flag: '🇸🇦', region: 'MENA' },
  { name: 'Tehran',      timezone: 'Asia/Tehran',           flag: '🇮🇷', region: 'MENA' },
  { name: 'Jerusalem',   timezone: 'Asia/Jerusalem',        flag: '🇮🇱', region: 'MENA' },
  { name: 'Islamabad',   timezone: 'Asia/Karachi',          flag: '🇵🇰', region: 'Asia' },
  { name: 'New Delhi',   timezone: 'Asia/Kolkata',          flag: '🇮🇳', region: 'Asia' },
  { name: 'Dhaka',       timezone: 'Asia/Dhaka',            flag: '🇧🇩', region: 'Asia' },
  { name: 'Kabul',       timezone: 'Asia/Kabul',            flag: '🇦🇫', region: 'Asia' },
  { name: 'Beijing',     timezone: 'Asia/Shanghai',         flag: '🇨🇳', region: 'Asia' },
  { name: 'Tokyo',       timezone: 'Asia/Tokyo',            flag: '🇯🇵', region: 'Asia' },
  { name: 'Seoul',       timezone: 'Asia/Seoul',            flag: '🇰🇷', region: 'Asia' },
  { name: 'Singapore',   timezone: 'Asia/Singapore',        flag: '🇸🇬', region: 'Asia' },
  { name: 'Taipei',      timezone: 'Asia/Taipei',           flag: '🇹🇼', region: 'Asia' },
  { name: 'Sydney',      timezone: 'Australia/Sydney',      flag: '🇦🇺', region: 'Oceania' },
  { name: 'Nairobi',     timezone: 'Africa/Nairobi',        flag: '🇰🇪', region: 'Africa' },
  { name: 'Lagos',       timezone: 'Africa/Lagos',          flag: '🇳🇬', region: 'Africa' },
]

const REGIONS = ['All', 'Americas', 'Europe', 'MENA', 'Asia', 'Oceania', 'Africa']

function getTimeData(timezone: string, now: Date) {
  const timeStr = now.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'short', month: 'short', day: 'numeric',
  })
  const hour = parseInt(
    now.toLocaleTimeString('en-US', {
      timeZone: timezone, hour: '2-digit', hour12: false,
    })
  )
  return { time: timeStr, date: dateStr, isDay: hour >= 6 && hour < 20 }
}

export default function WorldClockPanel() {
  const [filter, setFilter] = useState('All')
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const filtered = CITIES.filter(
    c => filter === 'All' || c.region === filter
  )

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex gap-1 p-2 border-b overflow-x-auto flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          {REGIONS.map(r => (
            <button key={r}
              className="px-2 py-0.5 text-xs font-mono rounded whitespace-nowrap"
              style={{ color: 'var(--text-muted)' }}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-xs"
            style={{ color: 'var(--text-muted)' }}>
            Loading clocks...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface2)' }}>
        <span className="font-mono text-xs font-bold"
          style={{ color: 'var(--accent)' }}>
          {now.toUTCString().slice(0, 25)} UTC
        </span>
      </div>

      <div className="flex gap-1 p-2 border-b overflow-x-auto flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        {REGIONS.map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className="px-2 py-0.5 text-xs font-mono rounded whitespace-nowrap
              transition-all flex-shrink-0"
            style={{
              background: filter === r ? 'var(--primary)' : 'transparent',
              color: filter === r ? '#fff' : 'var(--text-muted)',
            }}>
            {r}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(city => {
          const { time, date, isDay } = getTimeData(city.timezone, now)
          return (
            <div key={city.name}
              className="px-3 py-2 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{city.flag}</span>
                <div>
                  <div className="font-mono text-xs"
                    style={{ color: 'var(--text)' }}>
                    {city.name}
                  </div>
                  <div className="font-mono text-xs"
                    style={{ color: 'var(--text-muted)' }}>
                    {date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold tabular-nums"
                  style={{ color: isDay ? 'var(--accent)' : '#8B5CF6' }}>
                  {time}
                </div>
                <div className="font-mono text-xs"
                  style={{ color: 'var(--text-muted)' }}>
                  {isDay ? '☀ DAY' : '☽ NIGHT'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
