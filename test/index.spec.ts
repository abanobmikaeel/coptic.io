import { getCopticDate, getReadings } from '../src'

describe('Get Coptic Date', () => {
	it('Returns the correct coptic date', () => {
		const todayDate = new Date('2023-11-19')
		expect(getCopticDate(todayDate)).toMatchObject({
			day: 8,
			month: 3,
			year: 1740,
		})
	})

	it('Returns the correct coptic date after 6PM', () => {
		const todayDateAfter6PM = new Date('2023-11-19T18:30:00') // Adjust the time as needed
		expect(getCopticDate(todayDateAfter6PM)).toMatchObject({
			day: 9,
			month: 3,
			year: 1740,
		})
	})
})

describe('Get Coptic Reading Correctly', () => {
	it('Returns the correct coptic reading for a date', () => {
		const todayDate = new Date('2023-11-18T16:30:00')
		const expectedObject = {
			celebrations: null,
			fullDate: {
				dateString: 'Hator 8, 1740',
				day: 8,
				month: 3,
				monthString: 'Hator',
				year: 1740,
			},
			references: {
				acts: 'Acts 11:2-14',
				catholic: '1 Peter 3:15-22',
				lGospel: 'John 1:43-51',
				lPsalm: 'Psalms 80:1-3',
				mGospel: 'John 12:26-36',
				mPsalm: 'Psalms 33:6;Psalms 33:9',
				pauline: 'Hebrews 12:21-13:2',
				synxarium: [
					{
						name: 'The Commemoration of the Four Incorporeal Beasts',
						url: 'https://www.copticchurch.net/synaxarium/3_8.html?lang=en#1',
					},
				],
			},
		}
		expect(getReadings(todayDate)).toMatchObject(expectedObject)
	})
})

// describe('Get Coptic Reading with Text Correctly', () => {
//   it('Returns the correct coptic reading with the full text correctly', () => {
//     const todayDate = new Date('2023-11-19');
//     const expectedObject = {
//       celebrations: null,
//       fullDate: {
//         dateString: 'Hator 8, 1740',
//         day: 8,
//         month: 3,
//         monthString: 'Hator',
//         year: 1740,
//       },
//       references: {
//         acts: 'Acts 11:2-14',
//         catholic: '1 Peter 3:15-22',
//         lGospel: 'John 1:43-51',
//         lPsalm: 'Psalms 80:1-3',
//         mGospel: 'John 12:26-36',
//         mPsalm: 'Psalms 33:6;Psalms 33:9',
//         pauline: 'Hebrews 12:21-13:2',
//         synxarium: [
//           {
//             name: 'The Commemoration of the Four Incorporeal Beasts',
//             url: 'https://www.copticchurch.net/synaxarium/3_8.html?lang=en#1',
//           },
//         ],
//       },
//       text: {
//         VPsalm: [{ bookName: 'Psalms', chapters: [] }],
//         VGospel: [
//           { bookName: 'Mark', chapters: [] },
//           { bookName: 'Mark', chapters: [] },
//         ],
//         MPsalm: [
//           { bookName: 'Psalms', chapters: [] },
//           { bookName: 'Psalms', chapters: [] },
//         ],
//         MGospel: [{ bookName: 'John', chapters: [] }],
//         Pauline: [{ bookName: 'Hebrews', chapters: [] }],
//         Catholic: [{ bookName: '1 Peter', chapters: [] }],
//         Acts: [
//           {
//             bookName: 'Acts',
//             chapters: [
//               {
//                 chapterNum: 11,
//                 verses: [
//                   {
//                     num: 2,
//                     text: 'And when Peter came up to Jerusalem, those of the circumcision contended with him,',
//                   },
//                   {
//                     num: 3,
//                     text: 'saying, "You went in to uncircumcised men and ate with them!"',
//                   },
//                   {
//                     num: 4,
//                     text: 'But Peter explained it to them in order from the beginning, saying:',
//                   },
//                   {
//                     num: 5,
//                     text: '"I was in the city of Joppa praying; and in a trance I saw a vision, an object descending like a great sheet, let down from heaven by four corners; and it came to me.',
//                   },
//                   {
//                     num: 6,
//                     text: 'When I observed it intently and considered, I saw four-footed animals of the earth, wild beasts, creeping things, and birds of the air.',
//                   },
//                   {
//                     num: 7,
//                     text: 'And I heard a voice saying to me, "Rise, Peter; kill and eat.\'',
//                   },
//                   {
//                     num: 8,
//                     text: 'But I said, "Not so, Lord! For nothing common or unclean has at any time entered my mouth.\'',
//                   },
//                   {
//                     num: 9,
//                     text: 'But the voice answered me again from heaven, "What God has cleansed you must not call common.\'',
//                   },
//                   {
//                     num: 10,
//                     text: 'Now this was done three times, and all were drawn up again into heaven.',
//                   },
//                   {
//                     num: 11,
//                     text: 'At that very moment, three men stood before the house where I was, having been sent to me from Caesarea.',
//                   },
//                   {
//                     num: 12,
//                     text: "Then the Spirit told me to go with them, doubting nothing. Moreover these six brethren accompanied me, and we entered the man's house.",
//                   },
//                   {
//                     num: 13,
//                     text: 'And he told us how he had seen an angel standing in his house, who said to him, "Send men to Joppa, and call for Simon whose surname is Peter,',
//                   },
//                   {
//                     num: 14,
//                     text: "who will tell you words by which you and all your household will be saved.'",
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//         LPsalm: [{ bookName: 'Psalms', chapters: [] }],
//         LGospel: [{ bookName: 'John', chapters: [] }],
//       },
//     };
//     expect(getReadingsWithText(todayDate)).toMatchObject(expectedObject);
//   });
// });
