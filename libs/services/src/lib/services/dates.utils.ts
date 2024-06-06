export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

export function generateDateRanges(startDate: Date = new Date(1999, 8, 17),
    endDate: Date = new Date(), maxRange = 10): string[][] {

  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / oneDay
  );

  const ranges: string[][] = [];
  const chosenStartDays = new Set<number>();

  while (ranges.length < maxRange) {
    const randomStartDay = getRandomInt(0, totalDays - 31);
    if (!chosenStartDays.has(randomStartDay)) {
      chosenStartDays.add(randomStartDay);
      const rangeStartDate = new Date(
        startDate.getTime() + randomStartDay * oneDay
      );
      const rangeEndDate = new Date(rangeStartDate.getTime() + 30 * oneDay);
      ranges.push([formatDate(rangeStartDate), formatDate(rangeEndDate)]);
    }
  }

  return ranges;
}
