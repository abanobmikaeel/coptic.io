import httpStatus from 'http-status'
import expressValidation from 'express-validation'
import APIError from '../errors/apiError'
import { Request, Response, NextFunction } from 'express'
import vars from '../config/vars'

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
const handler = (err: any, req: Request, res: Response, next: NextFunction) => {
	const response = {
		code: err.status,
		message: err.message || httpStatus[err.status],
		errors: err.errors,
		stack: err.stack,
	}

	if (vars.env !== 'development') {
		delete response.stack
	}

	res.status(err.status)
	res.json(response)
}

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
const converter = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let convertedError = err

	if (err instanceof expressValidation.ValidationError) {
		convertedError = new APIError({
			message: err.message,
			status: err.statusCode,
		})
	} else if (!(err instanceof APIError)) {
		convertedError = new APIError({
			message: err.message,
			status: err.status,
			stack: err.stack,
		})
	}

	return handler(convertedError, req, res, next)
}

/**
 * Catch 404 and forward to error handler
 * @public
 */
const notFound = (req: Request, res: Response, next: NextFunction) => {
	const err = new APIError({
		message: 'Not found',
		status: httpStatus.NOT_FOUND,
	})
	return handler(err, req, res, next)
}

export default { handler, converter, notFound }
