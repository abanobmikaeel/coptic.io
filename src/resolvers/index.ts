import { getReferencesForCopticDate } from '../models/calendar.model'
import fromGregorian from '../utils/copticDate'

export default {
	getReferences: async (args: any) => {
		let parsedDate = new Date()
		if (args.date) {
			parsedDate = new Date(String(args.date))
		}
		// Fetch the daily readings for the specified date from your data store
		const readings = await getReferencesForCopticDate(parsedDate)
		const copticDate = fromGregorian(parsedDate)
		// Return the readings in the format defined by the Reading type
		return { ...readings, copticDate }
	},
}
