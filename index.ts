import uniqueReadings from './resources/uniqueReadings.json'
import dayReadings from './resources/dayReadings.json'
import { transformReading } from './BibleMapper/index'

export const getByCopticDate = (dateString: string) => {
	const [day, month] = dateString.split(' ')
	const monthFound = dayReadings.find(
		(dayReading) => dayReading.month === month
	)
	if (!monthFound) {
		throw new Error('Month not found')
	}
	const readingID = monthFound?.readings[Number(day) - 1]
	const reading = uniqueReadings.find((reading) => reading.id === readingID)
	return transformReading(reading)
}

console.log(JSON.stringify(getByCopticDate('10 Toba'), null, 2))
