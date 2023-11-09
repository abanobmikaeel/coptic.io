import Joi from 'joi'

export default {
	// GET /v1/calendar
	calendar: Joi.object({
		date: Joi.date().required(),
	}),
}
