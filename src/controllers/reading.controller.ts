import { Request, Response } from 'express'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import fromGregorian from '../utils/copticDate'
import readingValidator from '../validations/reading.validation'
import { getReferencesForDate } from '../models/readings'

// Gets readings for a certain day, or today's date by default
const get = async (req: Request, res: Response) => {
	try {
		readingValidator.getForDate.validate(req.params)

		const isDetailed = req.query.detailed === 'true'
		// // Default to today
		let parsedDate = new Date()
		if (req.params.date) {
			parsedDate = new Date(String(req.params.date))
		}

		// If asked for detailed readings, provide the text
		const data = await getReferencesForDate(
			parsedDate || new Date(),
			isDetailed
		)

		/// Add non moveable celebrations
		const celebrations = getStaticCelebrationsForDay(parsedDate)
		const copticDate = fromGregorian(parsedDate)
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
