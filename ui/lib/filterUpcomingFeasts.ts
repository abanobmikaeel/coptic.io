type Celebration = {
  name: string
  type: string
  id?: number
  displayName?: string
}

type DayCelebration = {
  date: string
  celebrations: Celebration[]
}

type EventWithDate = Celebration & { date: string }

/**
 * Filters upcoming celebrations to show only start/end of fasting periods
 * For fasts: shows only first and last day
 * For other celebrations: shows all occurrences
 */
export function filterUpcomingFeasts(upcoming: DayCelebration[]): EventWithDate[] {
  const allEvents: EventWithDate[] = []
  const fastTracking = new Map<string, { firstDate: string; lastDate: string }>()

  // First pass: collect all events and track fast periods
  upcoming.forEach(day => {
    day.celebrations.forEach(cel => {
      const eventWithDate: EventWithDate = { ...cel, date: day.date }
      allEvents.push(eventWithDate)

      // Track fast periods
      if (cel.type === 'fast') {
        const existing = fastTracking.get(cel.name)
        if (!existing) {
          fastTracking.set(cel.name, { firstDate: day.date, lastDate: day.date })
        } else {
          existing.lastDate = day.date
        }
      }
    })
  })

  // Second pass: filter events and add labels
  const seen = new Set<string>()
  const filtered = allEvents.filter(event => {
    if (event.type !== 'fast') {
      return true // Keep all non-fast events
    }

    // For fasts, only keep first and last day
    const fastPeriod = fastTracking.get(event.name)
    if (!fastPeriod) return true

    const isFirstDay = event.date === fastPeriod.firstDate
    const isLastDay = event.date === fastPeriod.lastDate

    if (isFirstDay) {
      const key = `${event.name}-start`
      if (seen.has(key)) return false
      seen.add(key)
      event.displayName = `${event.name} begins`
      return true
    }

    if (isLastDay && fastPeriod.firstDate !== fastPeriod.lastDate) {
      const key = `${event.name}-end`
      if (seen.has(key)) return false
      seen.add(key)
      event.displayName = `${event.name} ends`
      return true
    }

    return false // Skip middle days of fasts
  })

  return filtered
}
