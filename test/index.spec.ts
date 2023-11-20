import { getCopticDate } from "../src";
import { getReadings } from "../src";


describe('Get Coptic Date', () => {
  it('Returns the correct coptic date', () => {
    const todayDate = new Date('2023-11-19');
    expect(getCopticDate(todayDate)).toMatchObject({ day: 8, month: 3, year: 1740 });

    const todayDateAfter6PM = new Date('2023-11-19T18:30:00'); // Adjust the time as needed
    expect(getCopticDate(todayDateAfter6PM)).toMatchObject({ day: 9, month: 3, year: 1740 });
  });
});


describe('Get Coptic Reading Correctly', () => {
  it('Returns the correct coptic reading for a date', () => {
    const todayDate = new Date('2023-11-19');
    const expectedObject = {
         celebrations: null,
         fullDate: {
           dateString: "Hator 8, 1740",
           day: 8,
           month: 3,
           monthString: "Hator",
           year: 1740,
         },
         references: [
           "The Commemoration of the Four Incorporeal Beasts",
         ],
        }
    expect(getReadings(false, todayDate)).toMatchObject(expectedObject);
  });
});
