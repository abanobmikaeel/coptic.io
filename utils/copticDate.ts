const fromGregorian = (gregorianDate: Date) => {
	const fullDate = new Intl.DateTimeFormat('en-u-ca-coptic', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
	const monthOnly = new Intl.DateTimeFormat('en-u-ca-coptic', {
		month: 'numeric',
	})
	const dayOnly = new Intl.DateTimeFormat('en-u-ca-coptic', { day: 'numeric' })
	const yearOnly = new Intl.DateTimeFormat('en-u-ca-coptic', {
		year: 'numeric',
	})
	const monthOnlyLong = new Intl.DateTimeFormat('en-u-ca-coptic', {
		month: 'long',
	})

	const str = fullDate.format(gregorianDate)
	const yearStr = yearOnly.format(gregorianDate)
	const monthOnlyLongStr = monthOnlyLong.format(gregorianDate)

	return {
		fullDate: str.substring(0, str.length - 5),
		day: Number(dayOnly.format(gregorianDate)),
		month: Number(monthOnly.format(gregorianDate)),
		year: Number(yearStr.substring(0, yearStr.length - 5)),
		monthName: monthOnlyLongStr,
	}
}

export default fromGregorian
