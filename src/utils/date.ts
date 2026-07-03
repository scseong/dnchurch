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

/** 주보 날짜 라벨 — "2024. 6. 30 · 주일". sunday_date는 대개 일요일이라 일요일이면 '주일', 아니면 요일명. */
export function bulletinDateLabel(date: string): string {
  const target = dayjs(date);
  const weekday = target.day() === 0 ? '주일' : target.format('dddd');
  return `${target.format('YYYY. M. D')} · ${weekday}`;
}
