import dayjs from 'dayjs';
import { NEW_BADGE_DAYS } from '@/constants/notice';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function formattedDate(date: string | number, format: string) {
  return dayjs(date).format(format);
}

export function isRecent(createdAt: string, daysThreshold = NEW_BADGE_DAYS): boolean {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < daysThreshold * MS_PER_DAY;
}
