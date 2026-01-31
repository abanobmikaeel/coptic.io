// Cached formatters - created once at module load
const fullDateFormatter = new Intl.DateTimeFormat('en-u-ca-coptic', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
})
const monthOnlyFormatter = new Intl.DateTimeFormat('en-u-ca-coptic', {
	month: 'numeric',
})
const dayOnlyFormatter = new Intl.DateTimeFormat('en-u-ca-coptic', { day: 'numeric' })
const yearOnlyFormatter = new Intl.DateTimeFormat('en-u-ca-coptic', {
	year: 'numeric',
})
const monthOnlyLongFormatter = new Intl.DateTimeFormat('en-u-ca-coptic', {
	month: 'long',
})

const fromGregorian = (gregorianDate: Date) => {
	const str = fullDateFormatter.format(gregorianDate)
	const yearStr = yearOnlyFormatter.format(gregorianDate)
	const monthOnlyLongStr = monthOnlyLongFormatter.format(gregorianDate)

	return {
		dateString: str.substring(0, str.length - 5),
		day: Number(dayOnlyFormatter.format(gregorianDate)),
		month: Number(monthOnlyFormatter.format(gregorianDate)),
		year: Number(yearStr.substring(0, yearStr.length - 5)),
		monthString: monthOnlyLongStr,
	}
}

export default fromGregorian
