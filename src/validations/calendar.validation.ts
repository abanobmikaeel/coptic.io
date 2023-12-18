import Joi from 'joi'

export default {
	// GET /api/calendar
	calendar: Joi.object({
		date: Joi.date().required(),
	}),
}
