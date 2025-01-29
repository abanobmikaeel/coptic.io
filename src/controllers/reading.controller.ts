import { Request, Response } from 'express'
import fromGregorian from '../utils/copticDate'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import { getByCopticDate } from '../models/readings'
import readingValidator from '../validations/reading.validation'

// Gets readings for a certain day, or today's date by default
const get = async (req: Request, res: Response) => {
	try {
		readingValidator.getForDate.validate(req.params)

		const isDetailed = req.query.detailed === 'true'

		// Default to today
		let parsedDate = new Date()
		if (req.params.date) {
			parsedDate = new Date(String(req.params.date))
		}

		// If asked for detailed readings, provide the text
		const data = await getByCopticDate(parsedDate || new Date(), isDetailed)

		/// Add non moveable celebrations
		const celebrations = getStaticCelebrationsForDay(parsedDate)
		const copticDate = fromGregorian(parsedDate)
		return res.status(200).json({ ...data, celebrations, fullDate: copticDate })
	} catch (e) {
		res.status(400).json({
			error: e,
		})
	}
}

export default {
	get,
}
