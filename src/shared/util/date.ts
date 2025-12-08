import dayjs from 'dayjs';

export function parseDateFromString(fileName: string) {
  return fileName.match(/\d+/g)?.join('');
}

export function formattedDate(date: string, format: string) {
  return dayjs(date).format(format);
}

export function getCurrentYear() {
  const now = dayjs();
  return now.year();
}
