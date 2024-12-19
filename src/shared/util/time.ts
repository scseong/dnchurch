export function convertYearToTimestamptz(year: number | string) {
  return new Date(`${year}`).toISOString();
}
