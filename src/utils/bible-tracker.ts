// 성경읽기 트래커 파생 계산 (순수 함수, 클라이언트·서버 공용).
// 단일 진실 원천은 기록 행뿐이고 연속·일/주/월·통독은 모두 여기서 계산한다 (D4).
// 낙관적 UI를 위해 클라이언트가 로컬 기록 배열로 뷰를 다시 그린다.

import { BIBLE_TOTAL_CHAPTERS, getBookByOrder } from '@/constants/bible';

export type ReadingRecord = {
  book_order: number;
  chapter: number;
  read_date: string;
  cycle: number;
};

export type BibleReadingSettings = {
  weekly_goal: number;
  current_cycle: number;
};

const pad = (n: number) => String(n).padStart(2, '0');
const WEEKDAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

/** Asia/Seoul 기준 오늘 'YYYY-MM-DD'. 서버(UTC)·클라이언트 어디서 불러도 KST 달력 날짜를 준다. */
export function kstToday(): string {
  // en-CA 로케일은 'YYYY-MM-DD' 형태를 준다.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export function shiftDate(date: string, delta: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** "7월 17일 (목)" */
export function formatDateLabel(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}월 ${d}일 (${WEEKDAY_KR[weekdayOf(date)]})`;
}

/** 연속 장 번호를 "1–3, 5" 로 압축. */
function compressChapters(chapters: number[]): string {
  const sorted = [...chapters].sort((a, b) => a - b);
  const parts: string[] = [];
  let start: number | null = null;
  let prev: number | null = null;
  for (const n of sorted) {
    if (start === null) {
      start = prev = n;
    } else if (prev !== null && n === prev + 1) {
      prev = n;
    } else {
      parts.push(start === prev ? `${start}` : `${start}–${prev}`);
      start = prev = n;
    }
  }
  if (start !== null) parts.push(start === prev ? `${start}` : `${start}–${prev}`);
  return parts.join(', ');
}

/** 날짜별 읽은 장 수 합계. */
function countByDate(records: ReadingRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const rec of records) map.set(rec.read_date, (map.get(rec.read_date) ?? 0) + 1);
  return map;
}

/** 특정 날짜·책의 장 집합. */
export function chaptersOnDate(records: ReadingRecord[], date: string, bookOrder: number): Set<number> {
  const set = new Set<number>();
  for (const rec of records) {
    if (rec.read_date === date && rec.book_order === bookOrder) set.add(rec.chapter);
  }
  return set;
}

/** 회차 내 책별 distinct 장 집합 (통독·기록기 누적 표시용). */
export function cycleUnionByBook(records: ReadingRecord[], cycle: number): Map<number, Set<number>> {
  const map = new Map<number, Set<number>>();
  for (const rec of records) {
    if (rec.cycle !== cycle) continue;
    let set = map.get(rec.book_order);
    if (!set) {
      set = new Set<number>();
      map.set(rec.book_order, set);
    }
    set.add(rec.chapter);
  }
  return map;
}

/** 오늘부터 거꾸로 연속으로 읽은 일수. 길이 제한 없음. */
export function computeStreak(records: ReadingRecord[], today: string): number {
  const counts = countByDate(records);
  let streak = 0;
  let cursor = today;
  while ((counts.get(cursor) ?? 0) > 0) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return streak;
}

export type TodayEntry = { bookOrder: number; name: string; ranges: string; count: number };

/** 오늘 읽은 곳: 책별로 압축된 장 범위 + 장 수. */
export function computeTodayEntries(records: ReadingRecord[], today: string): TodayEntry[] {
  const byBook = new Map<number, number[]>();
  for (const rec of records) {
    if (rec.read_date !== today) continue;
    const list = byBook.get(rec.book_order) ?? [];
    list.push(rec.chapter);
    byBook.set(rec.book_order, list);
  }
  return [...byBook.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([bookOrder, chapters]) => {
      const book = getBookByOrder(bookOrder);
      return {
        bookOrder,
        name: book?.name ?? '',
        ranges: `${book?.name ?? ''} ${compressChapters(chapters)}장`,
        count: chapters.length
      };
    });
}

export function countChaptersOnDate(records: ReadingRecord[], date: string): number {
  return records.reduce((sum, rec) => (rec.read_date === date ? sum + 1 : sum), 0);
}

export type WeekDay = { label: string; date: string; done: boolean; isToday: boolean };
export type WeekView = {
  days: WeekDay[];
  doneCount: number;
  chapters: number;
  goal: number;
  goalPct: number;
};

/** 오늘이 속한 월~일 주간. */
export function computeWeek(records: ReadingRecord[], today: string, weeklyGoal: number): WeekView {
  const counts = countByDate(records);
  const mondayOffset = (weekdayOf(today) + 6) % 7; // 월요일까지 뒤로
  const monday = shiftDate(today, -mondayOffset);
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = shiftDate(monday, i);
    return {
      label: WEEKDAY_KR[weekdayOf(date)],
      date,
      done: (counts.get(date) ?? 0) > 0,
      isToday: date === today
    };
  });
  const chapters = days.reduce((sum, day) => sum + (counts.get(day.date) ?? 0), 0);
  const goalPct = weeklyGoal > 0 ? Math.min(100, Math.round((chapters / weeklyGoal) * 100)) : 0;
  return {
    days,
    doneCount: days.filter((day) => day.done).length,
    chapters,
    goal: weeklyGoal,
    goalPct
  };
}

export type MonthCell = { day: number | null; level: 0 | 1 | 2 | 3; isToday: boolean };
export type MonthView = { cells: MonthCell[]; readDays: number; chapters: number; label: string };

function levelOf(count: number): 0 | 1 | 2 | 3 {
  if (count > 6) return 3;
  if (count > 2) return 2;
  if (count > 0) return 1;
  return 0;
}

/** 오늘이 속한 달의 달력 히트맵 (일요일 시작). */
export function computeMonth(records: ReadingRecord[], today: string): MonthView {
  const counts = countByDate(records);
  const [year, month] = today.split('-').map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=일
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: MonthCell[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push({ day: null, level: 0, isToday: false });
  let readDays = 0;
  let chapters = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${pad(month)}-${pad(day)}`;
    const count = counts.get(date) ?? 0;
    const level = levelOf(count);
    if (level > 0) readDays += 1;
    chapters += count;
    cells.push({ day, level, isToday: date === today });
  }
  return { cells, readDays, chapters, label: `${year}년 ${month}월` };
}

type PlanView = {
  read: number;
  total: number;
  pct: number;
  left: number;
  done: boolean;
  cycleNum: number;
  cyclesDone: number;
};

/** 현재 회차의 통독 진행률 = distinct(book,chapter) where cycle=current_cycle / 1189. */
export function computePlan(records: ReadingRecord[], currentCycle: number): PlanView {
  const union = cycleUnionByBook(records, currentCycle);
  let read = 0;
  for (const set of union.values()) read += set.size;
  const total = BIBLE_TOTAL_CHAPTERS;
  return {
    read,
    total,
    pct: total > 0 ? Math.round((read / total) * 100) : 0,
    left: total - read,
    done: read >= total,
    cycleNum: currentCycle,
    cyclesDone: currentCycle - 1
  };
}
