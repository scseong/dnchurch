import dayjs from 'dayjs';
import { NEW_BADGE_DAYS } from '@/constants/notice';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;
const MS_PER_DAY = DAY;

export function formattedDate(date: string | number, format: string) {
  return dayjs(date).format(format);
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MINUTE) return '방금 전';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < MONTH) return `${Math.floor(diff / DAY)}일 전`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}개월 전`;
  return `${Math.floor(diff / YEAR)}년 전`;
}

export function isRecent(createdAt: string, daysThreshold = NEW_BADGE_DAYS): boolean {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < daysThreshold * MS_PER_DAY;
}
