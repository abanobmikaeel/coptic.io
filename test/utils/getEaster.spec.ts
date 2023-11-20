import getEaster from '../../src/utils/calculations/getEaster';

describe('Easter calculation test', () => {
  it('Returns the correct easter date', () => {
    expect(getEaster(2018)).toMatchObject({ day: 8, month: 4, year: 2018 });
    expect(getEaster(2019)).toMatchObject({ day: 28, month: 4, year: 2019 });

    // leap year
    expect(getEaster(2020)).toMatchObject({ day: 19, month: 4, year: 2020 });

    expect(getEaster(2021)).toMatchObject({ day: 2, month: 5, year: 2021 });
    expect(getEaster(2022)).toMatchObject({ day: 24, month: 4, year: 2022 });
    expect(getEaster(2050)).toMatchObject({ day: 17, month: 4, year: 2050 });
    expect(getEaster(2075)).toMatchObject({ day: 7, month: 4, year: 2075 });
  });
});
