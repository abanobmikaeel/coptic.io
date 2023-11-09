import RSS from 'rss'
import { generateRSSFeed } from '../src/utils/rss'
import { writeFile } from 'fs/promises'

export const generateAndWriteXMLFiles = async (): Promise<void> => {
	const feedInformation = {
		name: 'Coptic Calendar',
		url: 'https://coptic.io/v1/rss/feed',
		baseURL: 'https://coptic.io',
	}

	const currentYear = new Date().getFullYear()
	const numberOfYears = 3

	const combinedFeed: any = new RSS({
		title: feedInformation.name,
		feed_url: feedInformation.url,
		site_url: feedInformation.baseURL,
	})

	try {
		// Generate individual RSS feeds for each year and add them to the combined feed
		for (let year = currentYear; year < currentYear + numberOfYears; year++) {
			const rssFeed = generateRSSFeed(year)
			console.log(!!rssFeed)
			combinedFeed.items = combinedFeed.items.concat(rssFeed)
		}

		console.log(combinedFeed)
		// Write the combined RSS feed to a local XML file
		await writeFile('./xml/rss.xml', combinedFeed.xml({ indent: true }), 'utf8')
		console.log('Combined RSS feed generated and saved as rss.xml')
	} catch (error: any) {
		console.error(`Error saving combined RSS feed: ${error.message}`)
	}
}

generateAndWriteXMLFiles()
