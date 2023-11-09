import { generateAndWriteXMLFiles } from '../../src/utils/rss'

describe('RSS Feed Tests', () => {
	it('Returns a correct RSS Feed for a date', () => {
		const feed: any = getRSSFeed()
		expect(feed.items).toMatchObject([
			{
				title: 'Event 1',
				description: 'Description for Event 1',
				url: 'https://example.com/event1',
				guid: undefined,
				categories: [],
				author: undefined,
				date: '2023-11-10T10:00:00.000Z',
				lat: undefined,
				long: undefined,
				enclosure: false,
				custom_elements: [],
			},
			{
				title: 'Event 2',
				description: 'Description for Event 2',
				url: 'https://example.com/event2',
				guid: undefined,
				categories: [],
				author: undefined,
				date: '2023-11-15T14:00:00.000Z',
				lat: undefined,
				long: undefined,
				enclosure: false,
				custom_elements: [],
			},
		])
	})
})
