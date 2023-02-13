import { Request, Response } from 'express'
import fromGregorian from '../utils/copticDate'
// import calendarValidator from '../validations/calendar.validation'

const get = async (req: Request, res: Response) => {
	const copticDate = await fromGregorian(new Date())
	return res.status(200).json(copticDate)
}

export default {
	get,
}
