import dayjs from 'dayjs';

export function formattedDate(date: string | number, format: string) {
  return dayjs(date).format(format);
}
