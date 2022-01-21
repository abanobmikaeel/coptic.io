import { Request, Response } from 'express'
import { getReadingsForCopticDate } from '../models/readings/calendar.model'
import readingValidator from '../validations/reading.validation'

// Gets todays readings
const get = async (req: Request, res: Response) => {
	const copticDate = await getReadingsForCopticDate()
	return res.status(200).json(copticDate)
}

// Gets readings for a certain day
const getForDate = async (req: Request, res: Response) => {
	readingValidator.getForDate.validate(req.params)
	const date = req.params.date
	if (date) {
		const parsedDate = new Date(String(date))
		const copticDate = await getReadingsForCopticDate(parsedDate)
		return res.status(200).json(copticDate)
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
