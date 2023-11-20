import {
	getReadingsForCopticDate,
	getReferencesForCopticDate,
} from './models/calendar.model'

import { getStaticCelebrationsForDay } from './utils/calculations/getStaticCelebrations'
import fromGregorian from './utils/copticDate'

// Gets readings for a certain day, or today's date by default
export const getReadings = (isDetailed: boolean, date?: Date) => {
  const parsedDate = date ?? new Date()
  const copticDate = fromGregorian(parsedDate)
  let data: any = {}

  // Default to sending back references only
  data.references = getReferencesForCopticDate(parsedDate)

  // If asked for detailed readings, provide the text
  if (isDetailed) {
    data.text = getReadingsForCopticDate(parsedDate)
  }
  
  if(!isDetailed) {
    data.references = data.references.synxarium.map((e: any) => e.name)
  }

  /// Add non moveable celebrations
  const celebrations = getStaticCelebrationsForDay(parsedDate)
  return { ...data, celebrations, fullDate: copticDate }
}

export const getCopticDate = (date?: Date) => {
  return fromGregorian(date ?? new Date());
}
