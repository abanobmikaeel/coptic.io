import { Request, Response } from 'express'

const get = async (_: Request, res: Response) => {
	return res.status(200).json({ success: true })
}

export default {
	get,
}
