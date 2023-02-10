import { Request, Response } from 'express'
import {
	getReadingsForCopticDate,
	getReferencesForCopticDate,
} from '../models/readings/calendar.model'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import readingValidator from '../validations/reading.validation'

// Gets todays readings
const get = async (req: Request, res: Response) => {
	const isDetailed = req.query.detailed
	const copticDate = Boolean(isDetailed)
		? await getReadingsForCopticDate()
		: await getReferencesForCopticDate()
	const celebrations = getStaticCelebrationsForDay(new Date())
	return res.status(200).json({ copticDate, celebrations })
}

// Gets readings for a certain day
const getForDate = async (req: Request, res: Response) => {
	readingValidator.getForDate.validate(req.params)
	const isDetailed = req.query.detailed
	const date = req.params.date
	if (date) {
		const parsedDate = new Date(String(date))
		const copticDate = Boolean(isDetailed)
			? await getReadingsForCopticDate(parsedDate)
			: await getReferencesForCopticDate(parsedDate)
		const celebrations = getStaticCelebrationsForDay(parsedDate)
		return res.status(200).json({ copticDate, celebrations })
	} else {
		res.status(401).json({
			error: 'incorrect date format',
		})
	}
}

export default {
	get,
	getForDate,
}
