// Airline ICAO prefixes → carrier name + type
export const AIRLINE_CODES: Record<string, { name: string; type: 'passenger' | 'cargo' | 'charter' }> = {
  // Middle East
  'UAE': { name: 'Emirates',          type: 'passenger' },
  'ETD': { name: 'Etihad Airways',    type: 'passenger' },
  'QTR': { name: 'Qatar Airways',     type: 'passenger' },
  'SVA': { name: 'Saudi Arabian',     type: 'passenger' },
  'GFA': { name: 'Gulf Air',          type: 'passenger' },
  'FDB': { name: 'flydubai',          type: 'passenger' },
  'ABY': { name: 'Air Arabia',        type: 'passenger' },
  'OMA': { name: 'Oman Air',          type: 'passenger' },
  'KAC': { name: 'Kuwait Airways',    type: 'passenger' },
  // Europe
  'BAW': { name: 'British Airways',   type: 'passenger' },
  'AFR': { name: 'Air France',        type: 'passenger' },
  'DLH': { name: 'Lufthansa',         type: 'passenger' },
  'KLM': { name: 'KLM',              type: 'passenger' },
  'IBE': { name: 'Iberia',            type: 'passenger' },
  'AZA': { name: 'Alitalia/ITA',     type: 'passenger' },
  'SWR': { name: 'Swiss',             type: 'passenger' },
  'AUA': { name: 'Austrian',          type: 'passenger' },
  'SAS': { name: 'SAS',              type: 'passenger' },
  'FIN': { name: 'Finnair',           type: 'passenger' },
  'THY': { name: 'Turkish Airlines',  type: 'passenger' },
  'ROT': { name: 'TAROM',            type: 'passenger' },
  'RYR': { name: 'Ryanair',          type: 'passenger' },
  'EZY': { name: 'easyJet',          type: 'passenger' },
  'VLG': { name: 'Vueling',          type: 'passenger' },
  'NOZ': { name: 'Norwegian',         type: 'passenger' },
  // Americas
  'AAL': { name: 'American Airlines', type: 'passenger' },
  'DAL': { name: 'Delta Air Lines',   type: 'passenger' },
  'UAL': { name: 'United Airlines',   type: 'passenger' },
  'SWA': { name: 'Southwest',         type: 'passenger' },
  'JBU': { name: 'JetBlue',          type: 'passenger' },
  'ASA': { name: 'Alaska Airlines',   type: 'passenger' },
  'ACA': { name: 'Air Canada',        type: 'passenger' },
  'TAM': { name: 'LATAM',            type: 'passenger' },
  'AVA': { name: 'Avianca',           type: 'passenger' },
  // Asia-Pacific
  'CPA': { name: 'Cathay Pacific',    type: 'passenger' },
  'SIA': { name: 'Singapore Airlines',type: 'passenger' },
  'MAS': { name: 'Malaysia Airlines', type: 'passenger' },
  'THA': { name: 'Thai Airways',      type: 'passenger' },
  'GIA': { name: 'Garuda Indonesia',  type: 'passenger' },
  'CCA': { name: 'Air China',         type: 'passenger' },
  'CSN': { name: 'China Southern',    type: 'passenger' },
  'CES': { name: 'China Eastern',     type: 'passenger' },
  'JAL': { name: 'Japan Airlines',    type: 'passenger' },
  'ANA': { name: 'All Nippon',        type: 'passenger' },
  'KAL': { name: 'Korean Air',        type: 'passenger' },
  'AAR': { name: 'Asiana Airlines',   type: 'passenger' },
  'PAL': { name: 'Philippine Airlines',type:'passenger'},
  'ETF': { name: 'Ethiopian Airlines',type: 'passenger' },
  'PIA': { name: 'Pakistan Int\'l',   type: 'passenger' },
  'ISS': { name: 'IndiGo',            type: 'passenger' },
  'AIC': { name: 'Air India',         type: 'passenger' },
  // Cargo
  'FDX': { name: 'FedEx',             type: 'cargo' },
  'UPS': { name: 'UPS Airlines',      type: 'cargo' },
  'GTI': { name: 'Atlas Air',         type: 'cargo' },
  'DHL': { name: 'DHL Air',           type: 'cargo' },
  'CLX': { name: 'Cargolux',          type: 'cargo' },
  'MPH': { name: 'Martinair Cargo',   type: 'cargo' },
}

// Military callsign prefixes
export const MILITARY_PREFIXES = [
  'RRR', 'USAF', 'USMC', 'UAF', 'VVAF', 'MMF', 'RFF',
  'NATO', 'DUKE', 'REACH', 'EVAC', 'ATLAS', 'JAKE',
  'IRON', 'STEEL', 'GHOST', 'VIPER', 'HAWG', 'BONE',
  'RCH',  // USAF Air Mobility Command
  'CNV',  // US Navy
  'PAT',  // USAF patient transport
  'SAM',  // Special Air Mission (VIP)
  'VENUS','HERKY', 'ROCKY',
]

// Emergency squawks
export const EMERGENCY_SQUAWKS = ['7700', '7600', '7500']
// 7700 = general emergency, 7600 = radio failure, 7500 = hijack

export function detectCategory(callsign: string, squawk: string): {
  category: 'military' | 'cargo' | 'passenger' | 'private' | 'unknown'
  airline: string | null
  isEmergency: boolean
} {
  const cs = callsign.trim().toUpperCase()
  const isEmergency = EMERGENCY_SQUAWKS.includes(squawk)

  // Military check
  if (MILITARY_PREFIXES.some((p) => cs.startsWith(p))) {
    return { category: 'military', airline: 'Military', isEmergency }
  }

  // Airline code check (first 3 letters of callsign = ICAO airline code)
  const prefix = cs.slice(0, 3)
  if (AIRLINE_CODES[prefix]) {
    const { name, type } = AIRLINE_CODES[prefix]
    return {
      category: type === 'cargo' ? 'cargo' : 'passenger',
      airline: name,
      isEmergency,
    }
  }

  // Private/GA — short callsigns or all-numeric
  if (cs.length <= 5 && /^[A-Z0-9]+$/.test(cs)) {
    return { category: 'private', airline: null, isEmergency }
  }

  return { category: 'unknown', airline: null, isEmergency }
}
