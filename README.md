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

**Live API**: `https://copticio-production.up.railway.app`

### REST Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/readings/:date?` | Daily readings |
| `GET /api/calendar/:date?` | Coptic date conversion |
| `GET /api/fasting/:date` | Fasting information |
| `GET /api/synaxarium/:date` | Saints of the day |
| `GET /api/season/:date?` | Liturgical season |
| `GET /api/celebrations/:date` | Celebrations for date |
| `GET /api/calendar/ical/subscribe` | iCalendar subscription |

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

## License

MIT
