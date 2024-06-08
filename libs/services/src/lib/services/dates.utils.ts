export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}
/**
 * This function will get a randomized array of date ranges for a given date range. each date range would be max 30 days.
 * Any date withing an individual date range should not have an overlapping date with other date range.
 * @param startDate The lower bound date from which this function will start calculating the date range
 * @param endDate Max date within which all date ranges shoul fall.
 * @param maxRange Default 10. Specifies how many date ranges do we want.
 * @returns 
 */
export function generateDateRanges(startDate: Date = new Date(1999, 8, 17),
    endDate: Date = new Date(), maxRange = 10): string[][] {

  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / oneDay);

  const ranges: string[][] = [];
  const chosenRanges: { start: Date, end: Date }[] = [];

  while (ranges.length < maxRange) {
    const randomStartDay = getRandomInt(0, totalDays - 31);
    const rangeStartDate = new Date(startDate.getTime() + randomStartDay * oneDay);
    const rangeEndDate = new Date(rangeStartDate.getTime() + 30 * oneDay);

    if (!isOverlapping(rangeStartDate, rangeEndDate, chosenRanges)) {
      chosenRanges.push({ start: rangeStartDate, end: rangeEndDate });
      ranges.push([formatDate(rangeStartDate), formatDate(rangeEndDate)]);
    }
  }

  return ranges;
}
/**
 * 
 * @param rangeStart This function makes sure that all the date ranges do not have any overlapping ranges. Each date range is unique.
 * @param rangeEnd 
 * @param chosenRanges 
 * @param oneDay 
 * @returns 
 */
function isOverlapping(rangeStart: Date, rangeEnd: Date, chosenRanges: { start: Date, end: Date }[]): boolean {
//   for (const range of chosenRanges) {
//     const existingStart = new Date(range.start * oneDay);
//     const existingEnd = new Date(range.end * oneDay);

//     if ((rangeStart <= existingEnd && rangeStart >= existingStart) || (rangeEnd <= existingEnd && rangeEnd >= existingStart)) {
//       return true;
//     }
//   }
//   return false;
for (const range of chosenRanges) {
  if ((rangeStart <= range.end && rangeStart >= range.start) || (rangeEnd <= range.end && rangeEnd >= range.start)) {
    return true;
  }
}
return false;
}
