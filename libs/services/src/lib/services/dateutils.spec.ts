import { generateDateRanges } from './dates.utils'; // Adjust the import path

describe('generateDateRanges', () => {
  it('should generate the correct number of date ranges', () => {
    const startDate = new Date(1999, 8, 17);
    const endDate = new Date();
    const maxRange = 10;
    const ranges = generateDateRanges(startDate, endDate, maxRange);
    expect(ranges.length).toBe(maxRange);
  });

  it('should not have overlapping date ranges', () => {
    const startDate = new Date(1999, 8, 17);
    const endDate = new Date();
    const maxRange = 50;
    const ranges = generateDateRanges(startDate, endDate, maxRange);

    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const range1Start = new Date(ranges[i][0]);
        const range1End = new Date(ranges[i][1]);
        const range2Start = new Date(ranges[j][0]);
        const range2End = new Date(ranges[j][1]);

        const isOverlap = (range1Start <= range2End && range1Start >= range2Start) || (range1End <= range2End && range1End >= range2Start);
        expect(isOverlap).toBe(false);
      }
    }
  });

  it('should generate date ranges within the specified date range', () => {
    const startDate = new Date(1999, 8, 17);
    const endDate = new Date();
    const maxRange = 10;
    const ranges = generateDateRanges(startDate, endDate, maxRange);

    for (const range of ranges) {
      const rangeStart = new Date(range[0]);
      const rangeEnd = new Date(range[1]);
      expect(rangeStart.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
      expect(rangeEnd.getTime()).toBeLessThanOrEqual(endDate.getTime());
    }
  });
});
