import getByCopticDate from '.'

const getReadingsForCopticDate = (gregorianDate?: Date) => {
	return getByCopticDate(gregorianDate || new Date())
}

export { getReadingsForCopticDate }
