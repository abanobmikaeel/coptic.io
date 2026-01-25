# Coptic.IO

> A RESTful and GraphQL API for the Coptic Orthodox liturgical calendar, daily readings, and Synaxarium.

[![CI](https://github.com/abanobmikaeel/coptic.io/actions/workflows/ci.yml/badge.svg)](https://github.com/abanobmikaeel/coptic.io/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

Coptic.IO provides programmatic access to the Coptic Orthodox Church's liturgical calendar, including daily scripture readings (Katameros), feast days, fasting periods, and saint commemorations (Synaxarium). The API supports both REST and GraphQL interfaces.

**Live API**: `https://copticio-production.up.railway.app`

## Features

- Daily scripture readings from the Katameros
- Gregorian to Coptic calendar conversion
- Liturgical feast days and celebrations
- Fasting calendar with annual schedules
- iCalendar (.ics) export for calendar subscriptions
- Synaxarium search and retrieval
- Liturgical season information
- Both REST and GraphQL endpoints

## Quick Start

```bash
# Get today's readings
curl https://copticio-production.up.railway.app/api/readings

# Convert a date to Coptic calendar
curl https://copticio-production.up.railway.app/api/calendar/2025-01-15

# Check if a date is a fasting day
curl https://copticio-production.up.railway.app/api/fasting/2025-03-15

# Subscribe to iCalendar feed
https://copticio-production.up.railway.app/api/calendar/ical/subscribe
```

## REST API Reference

### Calendar

| Endpoint | Description |
|----------|-------------|
| `GET /api/calendar/:date?` | Convert Gregorian to Coptic date (defaults to today) |
| `GET /api/calendar/ical/:year` | Get iCalendar feed for specific year |
| `GET /api/calendar/ical/subscribe` | Get live multi-year iCalendar subscription |

### Readings

| Endpoint | Description |
|----------|-------------|
| `GET /api/readings/:date?` | Get daily readings (defaults to today) |
| `GET /api/readings/:date?detailed=true` | Get parsed readings with full text |

### Celebrations

| Endpoint | Description |
|----------|-------------|
| `GET /api/celebrations` | List all celebrations |
| `GET /api/celebrations/:date` | Get celebrations for a specific date |
| `GET /api/celebrations/upcoming/list?days=N` | Get upcoming celebrations (default: 30 days) |

### Fasting

| Endpoint | Description |
|----------|-------------|
| `GET /api/fasting/:date` | Check if date is a fasting day |
| `GET /api/fasting/calendar/:year` | Get annual fasting calendar |

### Seasons

| Endpoint | Description |
|----------|-------------|
| `GET /api/season/:date?` | Get liturgical season for date |
| `GET /api/season/year/:year` | Get all seasons for a year |
| `GET /api/season/fasting/:year` | Get all fasting periods for a year |

### Synaxarium

| Endpoint | Description |
|----------|-------------|
| `GET /api/synaxarium/:date` | Get saint commemorations for date |
| `GET /api/synaxarium/search/query?q=term` | Search Synaxarium entries |

## GraphQL API

Interactive playground available at `/graphql`

**Example query:**

```graphql
{
  copticDate(date: "2025-01-15") {
    dateString
    day
    month
    year
    monthString
  }
  fastingForDate(date: "2025-01-07") {
    isFasting
    fastType
    description
  }
}
```

## Documentation

- **OpenAPI Spec**: `/openapi.json`
- **GraphQL Playground**: `/graphql`

## Development

### Prerequisites

- Node.js 22+ or Bun 1.0+

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

### Docker

```bash
# Build image
docker build -t coptic-api .

# Run container
docker run -p 3000:3000 coptic-api
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Language**: TypeScript
- **Validation**: Zod
- **Testing**: Vitest
- **GraphQL**: GraphQL Yoga
- **Deployment**: Railway

## License

MIT
