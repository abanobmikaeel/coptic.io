import { getByCopticDate, getReferencesForDate } from './readings.model'

const getReadingsForCopticDate = (gregorianDate?: Date) => {
	return getByCopticDate(gregorianDate || new Date())
}

const getReferencesForCopticDate = (gregorianDate?: Date) => {
	return getReferencesForDate(gregorianDate || new Date())
}

export { getReadingsForCopticDate, getReferencesForCopticDate }
