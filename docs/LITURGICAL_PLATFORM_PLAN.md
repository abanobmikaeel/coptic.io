# Coptic.io Liturgical Platform Architecture

## Vision

Build an open-source, logic-driven liturgical platform that dynamically assembles texts based on the Coptic church calendar, supporting multiple languages side-by-side, and powering everything from daily readings to full liturgical services.

**Not a Coptic Reader clone - a massive expansion of it.**

---

## Core Principles

1. **Logic over hardcoding** - Encode the liturgical rules, not pre-assembled texts
2. **API-first, offline-capable** - Server generates, clients can cache everything
3. **Multi-language native** - English, Arabic, Coptic as first-class citizens
4. **Extensible** - Power readings, digests, contemplations, search, and more
5. **Open source** - Community-driven contributions

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Liturgical Texts DB        │  Calendar Rules DB                │
│  ├── prayers/               │  ├── seasons.json                 │
│  ├── hymns/                 │  ├── feasts.json                  │
│  ├── readings/              │  ├── fasts.json                   │
│  └── responses/             │  └── variations.json              │
│                             │                                    │
│  Each text has:             │  Rules define:                     │
│  - id, type, category       │  - When variations apply           │
│  - translations: {en,ar,cop}│  - Priority/precedence             │
│  - variation_key (optional) │  - Substitution logic              │
│  - rubrics (instructions)   │                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LITURGICAL ENGINE                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Calendar Resolver                                            │
│     Input: Gregorian date                                        │
│     Output: Coptic date, season, feasts, fasts, day type        │
│                                                                  │
│  2. Service Assembler                                            │
│     Input: Service type + calendar context                       │
│     Output: Ordered list of text IDs with variation keys         │
│                                                                  │
│  3. Text Resolver                                                │
│     Input: Text IDs + variation keys + requested languages       │
│     Output: Full text content in requested languages             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  GET /api/v2/services/:service                                   │
│      ?date=2024-02-06                                           │
│      &lang=en,ar,cop                                            │
│      &format=full|compact|ids-only                              │
│      &role=reader|congregation|deacon                           │
│                                                                  │
│  GET /api/v2/texts/:id                                          │
│      ?lang=en,ar,cop                                            │
│      &variation=feast-minor                                     │
│                                                                  │
│  GET /api/v2/calendar/:date                                     │
│      Returns: coptic date, season, feasts, fasts, readings      │
│                                                                  │
│  GET /api/v2/bulk/download                                      │
│      Returns: Gzipped full text database for offline use        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        UI LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  Display Modes:                                                  │
│  ├── Single language (current)                                  │
│  ├── Side-by-side (2 languages)                                 │
│  ├── Triple column (en/ar/cop)                                  │
│  ├── Interlinear (cop with transliteration below)               │
│  └── Projection mode (large text for church screens)            │
│                                                                  │
│  Role Highlighting:                                              │
│  ├── Priest (black/normal)                                      │
│  ├── Deacon (blue)                                              │
│  ├── Congregation (bold)                                        │
│  └── Rubrics (red/italic)                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Text Document Structure

```typescript
interface LiturgicalText {
  id: string                    // e.g., "vespers.opening-prayer"
  type: TextType                // prayer | hymn | reading | response | rubric
  category: string              // vespers | matins | liturgy | agpeya | etc.

  translations: {
    en?: TextContent
    ar?: TextContent
    cop?: TextContent           // Coptic in Coptic script
    cop_transliterated?: TextContent
  }

  // Variation support
  variations?: {
    [key: string]: {            // e.g., "kiahk", "great-lent", "feast-major"
      translations: { ... }
    }
  }

  // Metadata
  role?: 'priest' | 'deacon' | 'congregation' | 'all'
  rubric?: string               // Instructions (always in red/italic)
  audio?: string                // URL to audio recording

  // Relationships
  follows?: string              // Text ID this typically follows
  alternatives?: string[]       // Alternative texts for same slot
}

interface TextContent {
  text: string
  transliteration?: string      // For Coptic
  pronunciation_guide?: string  // IPA or simplified
}
```

### Service Structure Definition

```typescript
interface ServiceDefinition {
  id: string                    // e.g., "vespers"
  name: { en: string, ar: string }

  // The "script" - ordered list of elements
  structure: ServiceElement[]

  // Rules for variations
  variations: VariationRule[]
}

interface ServiceElement {
  type: 'text' | 'reading' | 'conditional' | 'repeat'

  // For type: 'text'
  textId?: string

  // For type: 'reading'
  readingType?: 'psalm' | 'gospel' | 'prophecy'
  source?: 'katameros'          // Where to get the reading

  // For type: 'conditional'
  condition?: string            // e.g., "season.kiahk", "day.sunday"
  then?: ServiceElement[]
  else?: ServiceElement[]

  // For type: 'repeat'
  times?: number | 'thrice'
  element?: ServiceElement
}

interface VariationRule {
  condition: string             // e.g., "feast.type === 'major-lord'"
  apply: {
    replace?: { [textId: string]: string }
    omit?: string[]
    insert?: { after: string, elements: ServiceElement[] }
  }
}
```

---

## Calendar & Rules Engine

### Coptic Calendar Context

```typescript
interface CalendarContext {
  // Dates
  gregorian: string             // "2024-02-06"
  coptic: {
    day: number
    month: string               // "Tobi", "Meshir", etc.
    year: number
  }

  // Day classification
  dayOfWeek: number             // 0-6, 0 = Sunday

  // Seasons
  season: {
    id: string                  // "standard" | "kiahk" | "great-lent" | "pentecost" | etc.
    week?: number               // Week number within season
    name: { en: string, ar: string }
  }

  // Feasts (can have multiple)
  feasts: Feast[]

  // Fasting
  fasting: {
    isFasting: boolean
    type?: string               // "apostles" | "nativity" | "virgin" | "lent" | etc.
    level?: 'strict' | 'fish' | 'none'
  }

  // Special flags
  flags: {
    isSunday: boolean
    isWednesdayOrFriday: boolean
    isSaturdayOrSunday: boolean
    isJoyfulSeason: boolean     // No Metanias
    hasMatins: boolean          // Some days skip matins
  }
}

interface Feast {
  id: string
  type: 'major-lord' | 'major-theotokos' | 'minor' | 'saint' | 'commemoration'
  name: { en: string, ar: string }
  rank: number                  // For precedence when multiple feasts
}
```

### Variation Resolution Priority

1. **Feast (Major Lord's)** - Highest priority, overrides everything
2. **Feast (Major Theotokos)**
3. **Season-specific** (Kiahk, Great Lent, Pentecost)
4. **Fast-specific**
5. **Day of week** (Sunday variations)
6. **Default**

---

## Implementation Phases

### Phase 1: Vespers Service (Proof of Concept)
**Goal:** End-to-end implementation of one complete service

- [ ] Define Vespers service structure in JSON/TypeScript
- [ ] Create text database for Vespers prayers (en/ar/cop)
- [ ] Implement basic service assembler
- [ ] Build multi-language UI component (side-by-side view)
- [ ] Add basic variation support (Sunday vs weekday)

**Texts needed for Vespers:**
1. Opening prayers (Trisagion, Lord's Prayer, etc.)
2. Thanksgiving Prayer
3. Psalm 116 (or seasonal psalm)
4. Vespers Gospel introduction
5. Gospel reading (from Katameros - already have)
6. Litanies
7. Closing prayers

### Phase 2: Complete Variation System
**Goal:** Full calendar-aware text selection

- [ ] Implement all season variations (Kiahk, Lent, Pentecost, etc.)
- [ ] Implement feast variations (Major Lord's feasts)
- [ ] Add Wednesday/Friday variations
- [ ] Saturday Theotokia support

### Phase 3: Matins & Liturgy
**Goal:** Expand to full daily cycle

- [ ] Matins (Midnight Praises on Saturday)
- [ ] Liturgy of the Word
- [ ] Liturgy of the Faithful (St. Basil)
- [ ] St. Gregory Liturgy variations

### Phase 4: Enhanced Features
**Goal:** Platform capabilities

- [ ] Full-text search across all liturgical texts
- [ ] Audio integration
- [ ] Offline download (gzipped bundle)
- [ ] Projection/presentation mode
- [ ] Contemplations & devotionals

### Phase 5: Community & Expansion
**Goal:** Open source ecosystem

- [ ] Public API for third-party apps
- [ ] Contribution guidelines for text additions
- [ ] Additional languages (French, Amharic, etc.)
- [ ] St. Cyril Liturgy
- [ ] Pascha services

---

## UI Components Needed

### Multi-Language Text Display

```tsx
interface MultiLangTextProps {
  text: {
    en?: string
    ar?: string
    cop?: string
  }
  displayMode: 'single' | 'side-by-side' | 'triple' | 'interlinear'
  primaryLang: 'en' | 'ar' | 'cop'
  role?: 'priest' | 'deacon' | 'congregation'
  isRubric?: boolean
}

// Display modes:
// - single: One language, full width
// - side-by-side: Two languages in columns
// - triple: Three languages in columns
// - interlinear: Coptic with transliteration/translation below each line
```

### Service Viewer Component

```tsx
interface ServiceViewerProps {
  service: 'vespers' | 'matins' | 'liturgy' | ...
  date: string
  languages: ('en' | 'ar' | 'cop')[]
  displayMode: DisplayMode
  role?: Role

  // Callbacks
  onTextTap?: (textId: string) => void  // For audio, notes, etc.
  onProgress?: (position: number) => void
}
```

---

## Open Questions

1. **Data storage format?**
   - JSON files in repo (easy to contribute, version controlled)
   - Database (better for search, harder to contribute)
   - Hybrid (JSON source of truth, compiled to DB)

2. **Coptic font handling?**
   - Web fonts (CS Avva Shenouda, etc.)
   - Standardize on one font or support multiple?
   - Transliteration standards?

3. **How to handle hymn tunes?**
   - Different tunes for same text (Adam vs Watos)
   - Seasonal variations (Kiahk midnight praises)

4. **Contribution workflow?**
   - How do community members add/correct texts?
   - Review process for accuracy?

---

## Next Steps

1. **Create `/packages/liturgy`** - Shared package for liturgical engine
2. **Define Vespers structure** - JSON schema for service definition
3. **Gather Vespers texts** - Compile en/ar/cop for all Vespers prayers
4. **Build MultiLangText component** - UI for side-by-side display
5. **Implement basic assembler** - Vespers without variations first

---

## Resources & References

- Coptic Reader app (iOS) - Reference implementation
- Tasbeha.org - Text source
- St. Takla - Arabic texts
- Coptic Orthodox Church Network - Various resources
- CopticChurch.net - Katameros source (current)

---

*This document is a living plan. Update as we learn and build.*
