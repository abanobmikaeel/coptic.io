import { Request, Response } from 'express'

const get = async (req: Request, res: Response) => {
	return res.status(200).json({ success: true })
}

export default {
	get,
}
