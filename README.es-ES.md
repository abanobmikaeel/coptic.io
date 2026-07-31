

# Coptic.IO

> Un monorepo para el calendario litúrgico, las lecturas diarias y el Sinaxario de la Iglesia Ortodoxa Copta.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Estructura del Monorepo

```
coptic.io/
├── apps/
│   ├── api/          # Servidor API Hono
│   ├── web/          # Sitio web público Next.js
│   └── admin/        # Panel de administración de contenido
├── packages/
│   ├── core/         # @coptic/core - Tipos y lógica litúrgica
│   ├── client/       # @coptic/client - Envoltorio de API
│   └── data/         # @coptic/data - Paquete de datos sin conexión
└── pnpm-workspace.yaml
```

## Paquetes

| Paquete | Descripción |
|---------|-------------|
| `@coptic/core` | Tipos compartidos, conversión de calendario, cálculo de Pascua, estaciones litúrgicas |
| `@coptic/client` | Cliente API ligero para coptic.io |
| `@coptic/data` | Paquete de datos sin conexión (Biblia, Sinaxario, lecturas) |

## Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor API
pnpm dev

# Iniciar aplicación web
pnpm dev:web

# Iniciar panel de administración
pnpm dev:admin

# Construir todos los paquetes
pnpm build:packages
```

## Uso de los Paquetes

### @coptic/core

```typescript
import {
  gregorianToCoptic,
  calculateEaster,
  getLiturgicalContext
} from '@coptic/core'

// Convertir fecha
const copticDate = gregorianToCoptic(new Date())

// Obtener fecha de Pascua
const easter = calculateEaster(2025)

// Obtener contexto litúrgico completo
const context = getLiturgicalContext(new Date())
```

### @coptic/client

```typescript
import { CopticClient } from '@coptic/client'

const client = new CopticClient()

// Obtener lecturas de hoy
const readings = await client.readings.today()

// Obtener sinaxario
const synaxarium = await client.synaxarium.today()

// Verificar ayuno
const fasting = await client.fasting.today()
```

## Referencia de la API

**URL Base**: `https://api.coptic.io` (o usar la variable de entorno `API_BASE_URL`)

### Endpoints REST

| Endpoint | Descripción |
|----------|-------------|
| **Calendario** | |
| `GET /api/calendar/:date?` | Conversión de fecha copta |
| `GET /api/calendar/month/:year/:month` | Datos del mes del calendario |
| `GET /api/calendar/ical/subscribe` | Fuente de suscripción iCalendar |
| **Lecturas** | |
| `GET /api/readings/:date?` | Lecturas diarias (agregar `?detailed=true` para texto completo) |
| **Sinaxario** | |
| `GET /api/synaxarium/:date` | Santos para una fecha gregoriana |
| `GET /api/synaxarium/coptic/:copticDate` | Santos por fecha copta (ej. "7 Toba") |
| `GET /api/synaxarium/search/query?q=` | Buscar santos por nombre |
| **Agpeya** | |
| `GET /api/agpeya` | Hora de oración actual |
| `GET /api/agpeya/hours` | Listar todas las horas de oración |
| `GET /api/agpeya/:hour` | Hora específica (prima, tercia, sexta, nona, vísperas, completas, medianoche) |
| **Ayuno y Estaciones** | |
| `GET /api/fasting/:date` | Estado de ayuno para la fecha |
| `GET /api/fasting/calendar/:year` | Calendario completo de ayunos del año |
| `GET /api/season/:date?` | Estación litúrgica |
| `GET /api/season/year/:year` | Todas las estaciones de un año |
| **Celebraciones** | |
| `GET /api/celebrations/:date` | Celebraciones para la fecha |
| `GET /api/celebrations/upcoming/list?days=` | Celebraciones próximas |
| **Búsqueda** | |
| `GET /api/search?q=` | Búsqueda unificada (Biblia, Sinaxario, Agpeya) |

### GraphQL

Entorno interactivo en `/graphql`

## Publicación

```bash
# Agregar un changeset
pnpm changeset

# Versionar paquetes
pnpm version

# Publicar en npm
pnpm release
```

## Fuentes de Datos

| Datos | Fuente | Notas |
|------|--------|-------|
| **Cálculo de Pascua** | Algoritmo Computus para la Pascua Ortodoxa Oriental | Válido para los años 1900-2199 |
| **Fiestas Móviles** | [Calendario de CopticChurch.net](https://www.copticchurch.net/calendar/feasts/) | Validado contra fechas oficiales |
| **Clasificación de Fiestas** | [St-Takla.org](https://st-takla.org/faith/en/terms/feasts.html) | 7 Fiestas Mayores + 7 Menores del Señor |
| **Sinaxario** | [Sinaxario de CopticChurch.net](https://www.copticchurch.net/synaxarium/) | Conmemoraciones diarias de santos |
| **Texto Bíblico** | Nueva Versión King James (NKJV) | Lecturas de Escrituras |
| **Lecturas Diarias** | Katameros Copto | Ciclo leccionario tradicional |
| **Calendario de Ayunos** | Tradición de la Iglesia Ortodoxa Copta | Períodos de ayuno mayores y menores |

### Clasificación de Fiestas

**7 Fiestas Mayores del Señor:**
- *Fijas:* Anunciación (29 Baramhat), Natividad (29 Kiahk), Teofanía (11 Toba)
- *Móviles:* Domingo de Ramos, Resurrección, Ascensión, Pentecostés

**7 Fiestas Menores del Señor:**
- *Fijas:* Circuncisión (6 Toba), Entrada al Templo (8 Amshir), Huida a Egipto (24 Bashans), Caná (13 Toba), Transfiguración (13 Mesra)
- *Móviles:* Jueves de la Alianza, Domingo de Tomás

*Nota: La Fiesta de la Cruz es una fiesta independiente (no está entre las 14 Fiestas del Señor).

### Validación

Los cálculos de las fiestas móviles se validan contra los datos oficiales de CopticChurch.net utilizando `scripts/validate-against-official.ts`.

## Licencia

MIT
