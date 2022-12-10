/**
 * Predicts easter date between 1900 - 2199
 * Implementation found at https://stackoverflow.com/a/3629556
 * @param {int} year: the gregorian year of the feast
 * @returns { day, month, year }: for easter
 */
const easterDate = (gregorianYear: number) => {
	const year = gregorianYear
	// do some magic
	const k = ((year % 19) * 19 + 15) % 30
	const e = (((year % 4) * 2 + (year % 7) * 4 - k + 34) % 7) + k + 127

	// estimate the month.
	let month = Math.floor(e / 31)

	// e % 31 => get the day
	let day = e % 31
	if (month > 4) {
		day += 1
	}
	if (year > 2099) {
		day += 1
	}

	// if day is less than 30 days add 1
	// otherwise, change month to May
	// and adjusts the days to match up with May.
	// e.g., 32nd of April is 2nd of May
	if (day < 30) {
		day += 1
	} else {
		month += 1
		day = month - 34 + day
	}

	return { day, month, year }
}

export default easterDate
