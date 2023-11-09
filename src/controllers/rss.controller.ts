import { Request, Response } from 'express'
// import { getIcalObject } from '../utils/rss'
import { join } from 'path'
// Gets readings for a certain day, or today's date by default
// const getICAL = async (req: Request, res: Response) => {
// 	try {
// 		res.header('Content-Type', 'text/calendar')
// 		res.status(200).send(getIcalObject)
// 	} catch (e) {
// 		res.status(401).json({
// 			error: e,
// 		})
// 	}
// }

const getRSS = async (req: Request, res: Response) => {
	const currentYear = new Date().getFullYear()

	try {
		// Serve the pre-generated XML files for the current year and the next two years
		for (let year = currentYear; year <= currentYear + 2; year++) {
			const filePath = join(__dirname, `rss_${year}.xml`)
			res.sendFile(filePath) // Serve the XML file directly
		}
	} catch (error: any) {
		console.error(`Error saving RSS feed for ${currentYear}: ${error.message}`)
	}
}

export default {
	// getICAL,
	getRSS,
}
