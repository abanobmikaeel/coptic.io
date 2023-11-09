// Generate events for a specific year
function generateEvents(year: number): any {
	const events = [
		{
			title: 'Event 1',
			description: 'Description for Event 1',
			start: new Date('2023-11-10T10:00:00Z'),
			end: new Date('2023-11-10T12:00:00Z'),
			url: 'https://example.com/event1',
		},
		{
			title: 'Event 2',
			description: 'Description for Event 2',
			start: new Date('2023-11-15T14:00:00Z'),
			end: new Date('2023-11-15T16:00:00Z'),
			url: 'https://example.com/event2',
		},
	]
	return events
}

export const generateRSSFeed = (year: number) => {
	const events = generateEvents(year)

	// Add events to RSS and iCalendar feeds
	return events.map((event: any) => {
		// Add to RSS feed
		return {
			title: event.title,
			description: event.description,
			url: event.url,
			date: event.start,
		}
	})
}

// import ical from 'ical-generator'

// export const getIcalObject = (year) => {
// 	const calendar = ical({
// 		name: feedInformation.name,
// 		url: feedInformation.url,
// 	})
// 	const startTime = new Date()
// 	const endTime = new Date()
// 	endTime.setHours(startTime.getHours() + 1)

// 	const events = generateEvents(yeare)
// 	// Add events to RSS and iCalendar feeds
// 	events.forEach((event) => {
// 		calendar.createEvent({
// 			start: event.start,
// 			end: event.end,
// 			summary: event.title,
// 			description: event.description,
// 			url: event.url,
// 		})
// 	})
// 	return calendar.toString()
// }
