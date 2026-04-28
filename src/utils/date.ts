import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { NEW_BADGE_DAYS } from '@/constants/notice';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function formattedDate(date: string | number, format: string) {
  return dayjs(date).format(format);
}

export function formatRelativeTime(iso: string): string {
  return dayjs(iso).fromNow();
}

export function isRecent(createdAt: string, daysThreshold = NEW_BADGE_DAYS): boolean {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < daysThreshold * MS_PER_DAY;
}
