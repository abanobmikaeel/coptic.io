# COPTIC.IO

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/Coptic_cross.svg" alt="Coptic Cross" width="300"/>
</p>

Bringing a 1700+ year-old calendar to modern times. A fast, modern API for daily Coptic readings according to the Katameros.

## Features

- **Daily Coptic Readings** - Get detailed readings for any Coptic day
- **Calendar Conversion** - Convert Gregorian dates to Coptic dates
- **Celebrations & Feasts** - Includes celebrations and feast days
- **Synaxarium** - Links to saint commemorations for each day
- **Fast & Modern** - Built with Hono for maximum performance

## API Endpoints

### Health Check
```bash
GET /health
```

### Calendar Conversion
```bash
GET /api/calendar/:date?
# Example: GET /api/calendar/2025-01-15
```

Response:
```json
{
  "dateString": "Toba 6, 1741",
  "day": 6,
  "month": 5,
  "year": 1741,
  "monthString": "Toba"
}
```

### Daily Readings
```bash
GET /api/readings/:date?detailed=true
# Example: GET /api/readings/2025-01-15
# Example: GET /api/readings/2025-01-15?detailed=true
```

Response includes:
- Reading references (VPsalm, VGospel, MPsalm, MGospel, Pauline, Catholic, Acts, LPsalm, LGospel)
- Synaxarium entries
- Celebrations/Feasts
- Full Coptic date

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Hono
- **Language**: TypeScript
- **Hosting**: Railway

## License

MIT

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
