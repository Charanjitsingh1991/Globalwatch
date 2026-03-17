# Skill — Free API Quick Reference

## APIs That Need No Key (Use Immediately)
| API | Endpoint | What It Returns |
|-----|----------|-----------------|
| USGS Earthquakes | https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&orderby=time&limit=500 | M2.5+ earthquakes worldwide |
| UCDP Conflicts | https://ucdpapi.pcr.uu.se/api/gedevents/23.1?pagesize=1000 | Georeferenced conflict events |
| GDELT News | https://api.gdeltproject.org/api/v2/geo/geo?query=conflict&mode=pointdata&format=json | Geolocated global news |
| NASA EONET | https://eonet.gsfc.nasa.gov/api/v3/events?status=open | Active natural events |
| GDACS Disasters | https://www.gdacs.org/xml/rss.xml | UN disaster alerts (RSS) |
| OpenMeteo Weather | https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=temperature_2m,wind_speed_10m | Weather at any coordinate |
| CoinGecko Crypto | https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd | Crypto prices |
| Yahoo Finance | npm: yahoo-finance2 | Stock/index/forex data |

---

## APIs That Need Free Registration
| API | Register At | Key Env Var | Rate Limit |
|-----|-------------|------------|------------|
| ACLED (conflicts) | acleddata.com/register | ACLED_API_KEY + ACLED_EMAIL | 500/day free research |
| NASA FIRMS (fires) | firms.modaps.eosdis.nasa.gov/api | NASA_FIRMS_API_KEY | Unlimited (reasonable use) |
| OpenAQ (air quality) | explore.openaq.org/register | OPENAQ_API_KEY | 60 req/min |
| AISStream (ships) | aisstream.io | AISSTREAM_API_KEY | Free tier |
| Groq AI | console.groq.com | GROQ_API_KEY | 30 req/min, 6k/day |
| OpenRouter AI | openrouter.ai | OPENROUTER_API_KEY | Free models available |
| FRED Economics | fred.stlouisfed.org/docs/api | FRED_API_KEY | 120 req/min |
| Cloudflare Radar | dash.cloudflare.com | CLOUDFLARE_RADAR_TOKEN | 1000 req/day free |
| AlienVault OTX | otx.alienvault.com | ALIENVAULT_OTX_KEY | Free |
| OpenSky | opensky-network.org | Optional: OPENSKY_USERNAME/PASSWORD | 400 req/day anon, 4000 registered |

---

## ACLED API Query Builder
```
Base: https://api.acleddata.com/acled/read.json
Required: key=KEY&email=EMAIL
Filters:
  ?limit=1000
  &event_date_where=BETWEEN&event_date_from=2024-01-01&event_date_to=2024-12-31
  &country=Syria
  &event_type=Battles
  &fields=event_id_cnty|event_date|event_type|latitude|longitude|fatalities
```

## NASA FIRMS API
```
CSV format: https://firms.modaps.eosdis.nasa.gov/api/country/csv/API_KEY/VIIRS_SNPP_NRT/World/1
JSON area: https://firms.modaps.eosdis.nasa.gov/api/area/json/API_KEY/VIIRS_SNPP_NRT/LAT,LON,LAT2,LON2/1
Parameters: 1 = last 24 hours, 2-10 = days back
```

## OpenSky State Vector Fields (array indices)
```
0: icao24      - Transponder address
1: callsign    - Aircraft callsign
2: origin_country
3: time_position - Unix timestamp of last position
4: last_contact
5: longitude
6: latitude
7: baro_altitude - meters, null if on ground
8: on_ground   - boolean
9: velocity    - m/s
10: true_track - degrees clockwise from north
11: vertical_rate - m/s
12: sensors    - array of sensor IDs
13: geo_altitude
14: squawk     - Mode C squawk code
15: spi        - Special purpose indicator
16: position_source
```

## AISStream WebSocket
```javascript
// Connect and subscribe to region
const ws = new WebSocket('wss://stream.aisstream.io/v0/stream')
ws.onopen = () => {
  ws.send(JSON.stringify({
    APIKey: process.env.AISSTREAM_API_KEY,
    BoundingBoxes: [[[LAT_MIN, LON_MIN], [LAT_MAX, LON_MAX]]]
  }))
}
// Response contains: MessageType, Message (PositionReport or ShipStaticData)
```

## Groq API (via SDK)
```typescript
import Groq from 'groq-sdk'
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const completion = await groq.chat.completions.create({
  model: 'llama-3.1-8b-instant', // fastest free model
  messages: [{ role: 'user', content: prompt }],
  temperature: 0,
  max_tokens: 500
})
const text = completion.choices[0].message.content
```

## GDELT 2.0 Doc API
```
https://api.gdeltproject.org/api/v2/doc/doc?query=KEYWORD&mode=ArtList&maxrecords=50&format=json
Returns: articles with tone score, themes, locations
Tone: negative = destabilizing event, positive = resolution/diplomacy
```
