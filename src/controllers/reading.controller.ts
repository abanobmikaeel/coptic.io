import { Request, Response } from 'express'
import {
	getReadingsForCopticDate,
	getReferencesForCopticDate,
} from '../models/readings/calendar.model'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import fromGregorian from '../utils/copticDate'
import readingValidator from '../validations/reading.validation'

// Gets readings for a certain day, or today's date by default
const get = async (req: Request, res: Response) => {
	try {
		readingValidator.getForDate.validate(req.params)

		const isDetailed = req.query.detailed
		// Default to today
		let parsedDate = new Date()
		if (req.params.date) {
			parsedDate = new Date(String(req.params.date))
		}
		const copticDate = fromGregorian(parsedDate)
		let data: any = {}

		// Default to sending back references only
		data.references = await getReferencesForCopticDate(parsedDate)

		// If asked for detailed readings, provide the text
		if (isDetailed === 'true') {
			data.text = await getReadingsForCopticDate(parsedDate)
		}

		/// Add non moveable celebrations
		const celebrations = getStaticCelebrationsForDay(parsedDate)
		return res.status(200).json({ ...data, celebrations, fullDate: copticDate })
	} catch (e) {
		res.status(401).json({
			error: e,
		})
	}
}

export default {
	get,
}
