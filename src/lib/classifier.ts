import type { Severity } from '@/types/events'

type Category = 'conflict' | 'terrorism' | 'cyber' | 'disaster' | 'military' | 'economic' | 'general'

interface ClassifyResult {
  severity: Severity
  category: Category
  confidence: number
}

const KEYWORDS: Record<Severity, string[]> = {
  critical: [
    'airstrike', 'air strike', 'bombing', 'explosion', 'missile', 'rocket attack',
    'nuclear', 'chemical attack', 'massacre', 'genocide', 'coup', 'assassination',
    'mass casualty', 'terrorist attack', 'suicide bomb', 'car bomb', 'mass shooting',
  ],
  high: [
    'attack', 'killed', 'deaths', 'casualties', 'military', 'troops', 'invasion',
    'conflict', 'war', 'battle', 'sanctions', 'offensive', 'shelling', 'gunfire',
    'hostage', 'kidnapping', 'detained', 'arrested', 'crackdown', 'emergency',
  ],
  medium: [
    'protest', 'demonstration', 'tension', 'border', 'deployment', 'election',
    'disputed', 'clashes', 'riot', 'strike', 'blockade', 'threat', 'warning',
    'evacuation', 'flooding', 'earthquake', 'wildfire', 'hurricane', 'volcano',
  ],
  low: [
    'diplomacy', 'talks', 'agreement', 'ceasefire', 'peace', 'aid', 'humanitarian',
    'relief', 'recovery', 'rebuild', 'negotiation', 'summit', 'treaty',
  ],
  info: [],
  unknown: [],
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  conflict:   ['war', 'battle', 'attack', 'killed', 'troops', 'military offensive', 'airstrike', 'shelling'],
  terrorism:  ['terrorist', 'bomb', 'suicide attack', 'isis', 'al-qaeda', 'extremist', 'jihad'],
  cyber:      ['cyber', 'hack', 'ransomware', 'data breach', 'malware', 'ddos', 'phishing'],
  disaster:   ['earthquake', 'hurricane', 'flood', 'wildfire', 'tsunami', 'volcano', 'drought', 'storm'],
  military:   ['military', 'troops', 'navy', 'air force', 'defense', 'weapons', 'missile', 'nuclear'],
  economic:   ['sanctions', 'economy', 'inflation', 'oil', 'gas', 'trade', 'gdp', 'recession'],
  general:    [],
}

export function classify(headline: string, description?: string): ClassifyResult {
  const text = `${headline} ${description ?? ''}`.toLowerCase()

  // Determine severity
  let severity: Severity = 'info'
  let confidence = 0.3

  for (const [sev, keywords] of Object.entries(KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i')
      if (regex.test(text)) {
        severity = sev as Severity
        confidence = Math.min(0.95, confidence + 0.2)
        break
      }
    }
    if (confidence > 0.5) break
  }

  // Determine category
  let category: Category = 'general'
  let maxMatches = 0

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter((kw) =>
      new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i').test(text)
    ).length
    if (matches > maxMatches) {
      maxMatches = matches
      category = cat as Category
    }
  }

  return { severity, category, confidence }
}
