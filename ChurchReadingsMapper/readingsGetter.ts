import * as fs from 'fs'
import { parse } from 'csv-parse'

async function getObjectsFromCSV() {
	const csvString = await fs.promises.readFile(
		'../resources/uniqueReadings.csv',
		'utf-8'
	)
	return parse(
		csvString,
		{
			columns: [
				'Day',
				'VPsalm',
				'VGospel',
				'MPsalm',
				'MGospel',
				'Pauline',
				'Catholic',
				'Acts',
				'LPsalm',
				'LGospel',
			],
			fromLine: 2,
		},
		(err, records) => {
			console.log(records)
		}
	)
}

;(async () => {
	getObjectsFromCSV()
})()
