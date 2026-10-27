import { gregorianToCoptic } from '../calendar/conversion'
import { getMoveableFeastsForDate } from '../calendar/moveable'
import { getDaysFromEaster } from '../calendar/pascha'

/**
 * Which lectionary cycle governs a day's readings, and the key to look them up by.
 *
 * - `jonah`, `greatLent`, `holyWeek`, `holyFifty`: keyed by days from Easter (Easter = 0)
 * - `sunday`: keyed by Coptic month and the Sunday of that month (1–5)
 * - `annual`: keyed by the Coptic date whose annual readings are read — usually the day
 *   itself, but a Sunday keeping the monthly commemoration reads 29 Paremhat
 */
export type ReadingCycle =
	| { cycle: 'jonah' | 'greatLent' | 'holyWeek' | 'holyFifty'; daysFromEaster: number }
	| { cycle: 'sunday'; month: number; sunday: number }
	| { cycle: 'annual'; month: number; day: number }

export type ReadingCycleName = ReadingCycle['cycle']

// Coptic months, numbered Tout=1 … Nasie=13.
const TOUT = 1
const HATOUR = 3
const KIAHK = 4
const TOBI = 5
const AMSHIR = 6
const PAREMHAT = 7
const BASHANS = 9
const NASIE = 13

/**
 * Fixed-date feasts with readings of their own, which replace the Sunday and seasonal
 * ones (Coptic month, day). The calendar's celebration ranges cannot stand in for this:
 * they span whole periods (the Nayrouz to Tout 16, the Paramoun over three days), while
 * only the feast day itself has proper readings.
 */
const FEASTS_WITH_PROPER_READINGS: ReadonlyArray<readonly [number, number]> = [
	[TOUT, 1], // the Nayrouz
	[TOUT, 17], // the Feast of the Cross, three days
	[TOUT, 18],
	[TOUT, 19],
	[KIAHK, 28], // the Nativity Paramoun
	[KIAHK, 29], // the Nativity
	[KIAHK, 30], // its second day, which a Sunday does not displace
	[TOBI, 10], // the Theophany Paramoun
	[TOBI, 11], // the Theophany
	[TOBI, 13], // Cana of Galilee
	[AMSHIR, 8], // the Entrance into the Temple
	[PAREMHAT, 10], // the Appearance of the Cross
	[PAREMHAT, 29], // the Annunciation
	[BASHANS, 24], // the Entrance into Egypt
]

const hasProperReadings = (month: number, day: number) =>
	FEASTS_WITH_PROPER_READINGS.some(([m, d]) => m === month && d === day)

/**
 * The Sunday of a Coptic month a date's readings come from.
 *
 * Kiahk keeps four Sundays before the Nativity. When the Paramoun (Kiahk 28) is itself a
 * Sunday, Kiahk has only three ordinary ones, so the last Sunday of Hatour reads Kiahk's
 * first Sunday and each Kiahk Sunday reads the next one. Nasie has a single Sunday.
 */
const sundayOf = (date: Date, month: number, day: number) => {
	if (month === NASIE) return { month, sunday: 1 }
	const daysToParamoun = month === HATOUR ? 30 - day + 28 : month === KIAHK ? 28 - day : -1
	const paramounOnSunday = daysToParamoun >= 0 && (date.getDay() + daysToParamoun) % 7 === 0
	if (paramounOnSunday && month === HATOUR && day > 23) return { month: KIAHK, sunday: 1 }
	const sunday = Math.ceil(day / 7)
	return { month, sunday: paramounOnSunday && month === KIAHK ? sunday + 1 : sunday }
}

/**
 * Get the reading cycle for a date. Precedence, highest first:
 *
 * 1. Holy Week, Monday to Great Saturday: a rite of its own, read by the Pascha hours
 * 2. A moveable feast of the Lord after Easter (Thomas Sunday, the Ascension, Pentecost)
 * 3. A fixed feast with proper readings, except from Lazarus Saturday to Easter, when
 *    none is kept
 * 4. Jonah's Fast and its Thursday feast
 * 5. Great Lent, from its Preparation Saturday to Palm Sunday
 * 6. The Holy Fifty Days, Easter to Pentecost
 * 7. A Sunday keeping the monthly commemoration of the Annunciation, Nativity and
 *    Resurrection (the 29th, outside Tobi and Amshir): the readings of 29 Paremhat
 * 8. Any other Sunday: the Sunday of the Coptic month
 * 9. Every other day: the annual reading of its Coptic date
 */
export const getReadingCycle = (date: Date): ReadingCycle => {
	const fromEaster = getDaysFromEaster(date)
	const fromEasterCycle = (cycle: 'jonah' | 'greatLent' | 'holyWeek' | 'holyFifty') =>
		({ cycle, daysFromEaster: fromEaster }) as const

	if (fromEaster >= -6 && fromEaster <= -1) return fromEasterCycle('holyWeek')
	const isLordsFeastAfterEaster = getMoveableFeastsForDate(date).some(
		(feast) => feast.type !== 'fast' && feast.daysFromEaster > 0,
	)
	if (isLordsFeastAfterEaster) return fromEasterCycle('holyFifty')

	const { month, day } = gregorianToCoptic(date)
	const inPaschaWeek = fromEaster >= -8 && fromEaster <= 0
	if (!inPaschaWeek && hasProperReadings(month, day)) return { cycle: 'annual', month, day }

	if (fromEaster >= -69 && fromEaster <= -66) return fromEasterCycle('jonah')
	if (fromEaster >= -57 && fromEaster <= -7) return fromEasterCycle('greatLent')
	if (fromEaster >= 0 && fromEaster <= 49) return fromEasterCycle('holyFifty')

	if (date.getDay() !== 0) return { cycle: 'annual', month, day }
	if (day === 29 && month !== TOBI && month !== AMSHIR)
		return { cycle: 'annual', month: PAREMHAT, day: 29 }
	return { cycle: 'sunday', ...sundayOf(date, month, day) }
}
