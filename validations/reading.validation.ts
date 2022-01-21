import Joi from 'joi'

export default {
	// GET /v1/calendar
	getForDate: Joi.object({
		params: {
			date: Joi.date().required(),
		},
	}),
}
