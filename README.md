# Coptic.IO

> A monorepo for the Coptic Orthodox Church liturgical calendar, daily readings, and Synaxarium.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Monorepo Structure

```
coptic.io/
├── apps/
│   ├── api/          # Hono API server
│   ├── web/          # Next.js public website
│   └── admin/        # Content management panel
├── packages/
│   ├── core/         # @coptic/core - Types & liturgical logic
│   ├── client/       # @coptic/client - API wrapper
│   └── data/         # @coptic/data - Offline data bundle
└── pnpm-workspace.yaml
```

## Packages

| Package | Description |
|---------|-------------|
| `@coptic/core` | Shared types, calendar conversion, Easter calculation, liturgical seasons |
| `@coptic/client` | Lightweight API client for coptic.io |
| `@coptic/data` | Offline data bundle (Bible, Synaxarium, readings) |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start API server
pnpm dev

# Start web app
pnpm dev:web

# Start admin panel
pnpm dev:admin

# Build all packages
pnpm build:packages
```

## Using the Packages

### @coptic/core

```typescript
import {
  gregorianToCoptic,
  calculateEaster,
  getLiturgicalContext
} from '@coptic/core'

// Convert date
const copticDate = gregorianToCoptic(new Date())

// Get Easter date
const easter = calculateEaster(2025)

// Get full liturgical context
const context = getLiturgicalContext(new Date())
```

### @coptic/client

```typescript
import { CopticClient } from '@coptic/client'

const client = new CopticClient()

// Get today's readings
const readings = await client.readings.today()

// Get synaxarium
const synaxarium = await client.synaxarium.today()

// Check fasting
const fasting = await client.fasting.today()
```

## API Reference

**Base URL**: `https://api.coptic.io` (or use the environment variable `API_BASE_URL`)

### REST Endpoints

| Endpoint | Description |
|----------|-------------|
| **Calendar** | |
| `GET /api/calendar/:date?` | Coptic date conversion |
| `GET /api/calendar/month/:year/:month` | Calendar month data |
| `GET /api/calendar/ical/subscribe` | iCalendar subscription feed |
| **Readings** | |
| `GET /api/readings/:date?` | Daily readings (add `?detailed=true` for full text) |
| **Synaxarium** | |
| `GET /api/synaxarium/:date` | Saints for a Gregorian date |
| `GET /api/synaxarium/coptic/:copticDate` | Saints by Coptic date (e.g. "7 Toba") |
| `GET /api/synaxarium/search/query?q=` | Search saints by name |
| **Agpeya** | |
| `GET /api/agpeya` | Current prayer hour |
| `GET /api/agpeya/hours` | List all prayer hours |
| `GET /api/agpeya/:hour` | Specific hour (prime, terce, sext, none, vespers, compline, midnight) |
| **Fasting & Seasons** | |
| `GET /api/fasting/:date` | Fasting status for date |
| `GET /api/fasting/calendar/:year` | Full year fasting calendar |
| `GET /api/season/:date?` | Liturgical season |
| `GET /api/season/year/:year` | All seasons for a year |
| **Celebrations** | |
| `GET /api/celebrations/:date` | Celebrations for date |
| `GET /api/celebrations/upcoming/list?days=` | Upcoming celebrations |
| **Search** | |
| `GET /api/search?q=` | Unified search (Bible, Synaxarium, Agpeya) |

### GraphQL

Interactive playground at `/graphql`

## Publishing

```bash
# Add a changeset
pnpm changeset

# Version packages
pnpm version

# Publish to npm
pnpm release
```

## Data Sources

| Data | Source | Notes |
|------|--------|-------|
| **Easter Calculation** | Computus algorithm for Eastern Orthodox Easter | Valid for years 1900-2199 |
| **Moveable Feasts** | [CopticChurch.net Calendar](https://www.copticchurch.net/calendar/feasts/) | Validated against official dates |
| **Feast Classifications** | [St-Takla.org](https://st-takla.org/faith/en/terms/feasts.html) | 7 Major + 7 Minor Lord's Feasts |
| **Synaxarium** | [CopticChurch.net Synaxarium](https://www.copticchurch.net/synaxarium/) | Daily saints commemorations |
| **Bible Text** | New King James Version (NKJV) | Scripture readings |
| **Daily Readings** | Coptic Katameros | Traditional lectionary cycle |
| **Fasting Calendar** | Coptic Orthodox Church tradition | Major and minor fasting periods |

### Feast Classifications

**7 Major Lord's Feasts:**
- *Fixed:* Annunciation (29 Baramhat), Nativity (29 Kiahk), Theophany (11 Tobe)
- *Moveable:* Palm Sunday, Resurrection, Ascension, Pentecost

**7 Minor Lord's Feasts:**
- *Fixed:* Circumcision (6 Tobe), Entry into Temple (8 Amshir), Flight to Egypt (24 Bashans), Cana (13 Tobe), Transfiguration (13 Mesori)
- *Moveable:* Covenant Thursday, Thomas Sunday

*Note: Feast of the Cross is a separate feast (not among the 14 Lord's Feasts).

### Validation

Moveable feast calculations are validated against official CopticChurch.net data using `scripts/validate-against-official.ts`.

## License

MIT
