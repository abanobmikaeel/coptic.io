# COPTIC.IO

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/Coptic_cross.svg" alt="Coptic Cross" width="300"/>
</p>

Bringing a 1700+ year-old calendar to modern times. A fast, modern API for daily Coptic readings according to the Katameros.

## Features

- **Daily Coptic Readings** - Get detailed readings for any Coptic day
- **Calendar Conversion** - Convert Gregorian dates to Coptic dates
- **Celebrations & Feasts** - Browse all feasts and upcoming celebrations
- **Fasting Calendar** - Check fasting days and get annual fasting calendars
- **Synaxarium** - Search and browse saint commemorations
- **OpenAPI Documentation** - Full API spec available at `/openapi.json`
- **Fast & Modern** - Built with Hono for maximum performance

## API Endpoints

### Health Check
```bash
GET /health
```

### Calendar

#### Convert date to Coptic
```bash
GET /api/calendar/:date
# Example: GET /api/calendar/2025-01-15
```

### Readings

#### Get daily readings
```bash
GET /api/readings/:date?detailed=true
# Example: GET /api/readings/2025-01-15
# Example: GET /api/readings/2025-01-15?detailed=true
```

### Celebrations

#### Get all celebrations
```bash
GET /api/celebrations
```

#### Get celebrations for a date
```bash
GET /api/celebrations/:date
# Example: GET /api/celebrations/2025-01-07
```

#### Get upcoming celebrations
```bash
GET /api/celebrations/upcoming/list?days=30
# Example: GET /api/celebrations/upcoming/list?days=7
```

### Fasting

#### Check if date is fasting
```bash
GET /api/fasting/:date
# Example: GET /api/fasting/2025-01-07
```

Response:
```json
{
  "isFasting": true,
  "fastType": "fast",
  "description": "Advent Fast"
}
```

#### Get fasting calendar for year
```bash
GET /api/fasting/calendar/:year
# Example: GET /api/fasting/calendar/2025
```

### Synaxarium

#### Get synaxarium for date
```bash
GET /api/synaxarium/:date?detailed=true
# Example: GET /api/synaxarium/2025-01-15
```

#### Search synaxarium
```bash
GET /api/synaxarium/search/query?q=Mary
# Example: GET /api/synaxarium/search/query?q=Saint
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

### REST API
- **OpenAPI Spec**: `GET /openapi.json`
- View the full OpenAPI 3.0 specification for detailed request/response schemas

### GraphQL API
- **GraphQL Playground**: `GET /graphql`
- Interactive GraphQL playground with schema documentation
- **Endpoint**: `POST /graphql`

Example GraphQL query:
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

## Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Hono with OpenAPI
- **Language**: TypeScript
- **Validation**: Zod
- **Testing**: Vitest
- **Hosting**: Railway

## License

MIT

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
