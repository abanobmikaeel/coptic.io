import axios from 'axios'
import parse from 'csv-parse/lib/sync'
import { readFile } from 'fs/promises'

function getVerse(
	bookName: string,
	chapterNumber: number,
	verseNumberOrRange: string
) {
	const BIBLE_API_PORT = 5000
	const url = `http://localhost:${BIBLE_API_PORT}/api/get_verse/${bookName}/${chapterNumber}/${verseNumberOrRange}`
	return axios.get(url)
}

// getVerse('genesis', 1, '2')
getVerse('Psalms', 132, '10-11').then((e) => console.log(e.data))

async function getObjectsFromCSV() {
	const file = await readFile('uniqueReadings.csv')

	const x = parse(file, {
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
	})
	console.log(x)
}

getObjectsFromCSV()
// async function pushToCMS(type: string, service: string, text: string) {
// 	await axios
// 		.post('https://copticsanctuary.boftware.com/auth/local/', {
// 			identifier: 'abanobmikaeel@gmail.com',
// 			password: '123456789102',
// 		})
// 		.then(
// 			(data: any) =>
// 				(axios.defaults.headers.common.Authorization = `Bearer ${data.data.jwt}`)
// 		)

// await axios
// 	.post(`https://copticsanctuary.boftware.com/readings/`, {
// 		type, // 'psalm',
// 		service, // liturgy
// 		english_text: text,
// 	})
// 	.catch((err) => console.log(err.response.data))
