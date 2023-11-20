# WELCOME TO COPTIC.IO

![alt text](https://upload.wikimedia.org/wikipedia/commons/7/71/Coptic_cross.svg)

Bringing a 1700+ year old calendar to modern times. An API for daily coptic readings according to the Katamaross

### Key Features

- Get the readings for a given coptic day
- Readings include Katamaros readings, and the synxarium
- Get detailed text for a given coptic day
- Convert a gregorian date to a coptic date

### Roadmap

For roadmap visit github issues

### Install

```bash
npm install coptic-io
```

## Usage

```ts
import { getCopticDate, getReadings } from '../src';

getCopticDate();
// {
//   day: 8,
//   month: 3,
//   year: 1740,
// }

getReadings();
// {
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
//     };
```
