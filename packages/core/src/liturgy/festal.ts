import { gregorianToCoptic } from '../calendar/conversion'
import { getEasterDate } from '../calendar/pascha'
import { MS_PER_DAY, toMidnight } from '../utils/date'

/**
 * A Lord's feast whose festal texts — the seasonal verse of the Trisagion, the feast's
 * Gospel Response — are prayed for a period around it, not only on the day.
 */
export type FestalSeason = 'nativity' | 'theophany' | 'cross' | 'resurrection' | 'ascension'

/** Days from Easter Sunday (day 0) to the date. Rounded: a DST change makes a day 23h or 25h. */
const daysFromEaster = (date: Date): number =>
	Math.round((toMidnight(date) - toMidnight(getEasterDate(date.getFullYear()))) / MS_PER_DAY)

/**
 * Get the festal season a date falls in, or null on an ordinary day.
 *
 * - Resurrection: the Feast of the Resurrection to the 39th day (Easter + 0…38)
 * - Ascension:    the 40th day to Pentecost, the 50th (Easter + 39…49)
 * - Nativity:     Kiahk 29 to the Circumcision, Tobi 6
 * - Theophany:    Tobi 11 to Cana of Galilee, Tobi 13
 * - Cross:        Tout 17–19, and Paremhat 10
 *
 * The fixed seasons are keyed off the Coptic date, so they follow the Coptic calendar's
 * drift against the Gregorian one. Coptic months are numbered Tout=1 … Nasie=13
 * (Kiahk=4, Tobi=5, Paremhat=7). Holy Week is not a festal season: its services are
 * a rite of their own.
 */
export const getFestalSeason = (date: Date): FestalSeason | null => {
	const fromEaster = daysFromEaster(date)
	if (fromEaster >= 0 && fromEaster <= 38) return 'resurrection'
	if (fromEaster >= 39 && fromEaster <= 49) return 'ascension'

	const { month, day } = gregorianToCoptic(date)
	if ((month === 4 && day >= 29) || (month === 5 && day <= 6)) return 'nativity'
	if (month === 5 && day >= 11 && day <= 13) return 'theophany'
	if ((month === 1 && day >= 17 && day <= 19) || (month === 7 && day === 10)) return 'cross'
	return null
}
