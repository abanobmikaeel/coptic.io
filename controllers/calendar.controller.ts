import { Request, Response } from 'express'
import fromGregorian from '../utils/copticDate'
import calendarValidator from '../validations/calendar.validation'

const get = async (req: Request, res: Response) => {
	const copticDate = await fromGregorian(new Date())
	return res.status(200).json(copticDate)
}

const getDate = async (req: Request, res: Response) => {
	const { error, value } = calendarValidator.calendar.validate(req.params)
	if (error) return res.status(400).json({ error: 'Incorrect date format' })

	const copticDate = await fromGregorian(value.date)
	return res.status(200).json(copticDate)
}

export default {
	get,
	getDate,
}
