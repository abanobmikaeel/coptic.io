import {
	getReadingsForCopticDate,
	getReferencesForCopticDate,
} from './models/calendar.model'

import { getStaticCelebrationsForDay } from './utils/calculations/getStaticCelebrations'
import fromGregorian from './utils/copticDate'

// Gets readings for a certain day, or today's date by default
export const getReadings = (date?: Date) => {
  const parsedDate = date ?? new Date()
  const copticDate = fromGregorian(parsedDate)
  let data: any = {}

  // Default to sending back references only
  data.references = getReferencesForCopticDate(parsedDate)

  // TODO: only attach those readings to the synxarium object if we request the detailed obj.
  data.references.synxarium = data.references.synxarium.map((e: any) => { return { name: e.name, url: e.url } })

  /// Add non moveable celebrations
  const celebrations = getStaticCelebrationsForDay(parsedDate)
  return { ...data, celebrations, fullDate: copticDate }
}

export const getReadingsWithText = (date?: Date) => {
  const parsedDate = date ?? new Date()
  const copticDate = fromGregorian(parsedDate)
  let data: any = {}
  data.references = getReferencesForCopticDate(parsedDate)
  data.text = getReadingsForCopticDate(parsedDate)

  console.log(data.text)
  /// Add non moveable celebrations
  const celebrations = getStaticCelebrationsForDay(parsedDate)
  return { ...data, celebrations, fullDate: copticDate }
}

export const getCopticDate = (date?: Date) => {
  return fromGregorian(date ?? new Date());
}
