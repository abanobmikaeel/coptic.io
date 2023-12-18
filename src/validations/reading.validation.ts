import Joi from 'joi'

export default {
	// GET /api/reading
	getForDate: Joi.object({
		params: {
			date: Joi.date().required(),
		},
	}),
}
