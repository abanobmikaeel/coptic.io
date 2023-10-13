import Joi from 'joi'

export default {
	// GET /v1/reading
	getForDate: Joi.object({
		params: {
			date: Joi.date().required(),
		},
	}),
}
