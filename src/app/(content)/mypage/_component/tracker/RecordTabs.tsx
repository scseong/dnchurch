'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { LuChevronRight, LuPencil, LuPlus, LuBookOpen } from 'react-icons/lu';
import { Tabs, Button } from '@/components/ui';
import { formatDateLabel, type TodayEntry, type WeekView, type MonthView } from '@/utils/bible-tracker';
import styles from './tracker.module.scss';

type TabId = 'day' | 'week' | 'month';

const TAB_ITEMS = [
  { id: 'day', label: '일' },
  { id: 'week', label: '주' },
  { id: 'month', label: '월' }
];

const MONTH_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function shortDate(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}월 ${d}일`;
}

// 주 범위 — 시작·끝이 같은 달이면 끝 날짜의 '월'을 생략 (예: 7월 13일 – 19일)
function weekRange(start: string, end: string): string {
  const startMonth = start.split('-')[1];
  const endDay = Number(end.split('-')[2]);
  return startMonth === end.split('-')[1]
    ? `${shortDate(start)} – ${endDay}일`
    : `${shortDate(start)} – ${shortDate(end)}`;
}

type Props = {
  today: string;
  todayEntries: TodayEntry[];
  todayChapters: number;
  week: WeekView;
  month: MonthView;
  onOpenRecorder: (bookOrder: number | null) => void;
  onOpenGoal: () => void;
};

export default function RecordTabs({
  today,
  todayEntries,
  todayChapters,
  week,
  month,
  onOpenRecorder,
  onOpenGoal
}: Props) {
  const [tab, setTab] = useState<TabId>('day');

  return (
    <div className={styles.records}>
      <div className={styles.records_head}>
        <h3 className={styles.records_title}>성경읽기 기록</h3>
        <Tabs
          variant="pill"
          size="sm"
          items={TAB_ITEMS}
          activeId={tab}
          onChange={(id) => setTab(id as TabId)}
        />
      </div>

      {tab === 'day' && (
        <div className={styles.card}>
          <div className={styles.day_head}>
            <div>
              <p className={styles.caption}>오늘 · {formatDateLabel(today)}</p>
              <p className={styles.day_title}>오늘 읽은 곳</p>
            </div>
            <p className={styles.day_count}>
              <strong>{todayChapters}</strong>장
            </p>
          </div>

          {todayEntries.length > 0 ? (
            <>
              <ul className={styles.entry_list}>
                {todayEntries.map((entry) => (
                  <li key={entry.bookOrder}>
                    <button
                      type="button"
                      className={styles.entry}
                      onClick={() => onOpenRecorder(entry.bookOrder)}
                    >
                      <span className={styles.entry_icon} aria-hidden="true">
                        <LuBookOpen />
                      </span>
                      <span className={styles.entry_range}>{entry.ranges}</span>
                      <span className={styles.entry_count}>{entry.count}장</span>
                      <LuChevronRight aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className={styles.entry_hint}>항목을 누르면 장을 수정하거나 해제할 수 있어요</p>
            </>
          ) : (
            <div className={styles.empty}>
              <span className={styles.empty_icon} aria-hidden="true">
                <LuBookOpen />
              </span>
              <p className={styles.empty_title}>아직 오늘 읽은 곳이 없어요</p>
              <p className={styles.empty_sub}>읽은 성경을 기록해 보세요</p>
            </div>
          )}

          <Button
            variant="accent"
            fullWidth
            leadingIcon={<LuPlus aria-hidden="true" />}
            onClick={() => onOpenRecorder(null)}
          >
            읽은 곳 기록하기
          </Button>
        </div>
      )}

      {tab === 'week' && (
        <div className={styles.card}>
          <div className={styles.week_head}>
            <span>{weekRange(week.days[0].date, week.days[6].date)}</span>
            <span className={styles.week_done}>
              <strong>{week.doneCount}</strong> / 7일
            </span>
          </div>
          <ul className={styles.week_strip}>
            {week.days.map((day) => (
              <li key={day.date} className={styles.week_day}>
                <span className={clsx(styles.week_label, day.isToday && styles.week_label_today)}>
                  {day.label}
                </span>
                <span
                  className={clsx(
                    styles.week_box,
                    day.done && styles.week_box_done,
                    !day.done && day.isToday && styles.week_box_today
                  )}
                >
                  {day.done ? '✓' : day.isToday ? '오늘' : ''}
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.goal}>
            <div className={styles.goal_head}>
              <span className={styles.caption}>주간 목표</span>
              <button type="button" className={styles.goal_edit} onClick={onOpenGoal}>
                <LuPencil aria-hidden="true" /> 목표 수정
              </button>
            </div>
            <div className={styles.goal_meta}>
              <span>
                <strong>{week.chapters}</strong> / {week.goal}장
              </span>
              <span className={styles.goal_pct}>{week.goalPct}%</span>
            </div>
            <div className={styles.bar}>
              <span className={styles.bar_fill} style={{ width: `${week.goalPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {tab === 'month' && (
        <div className={styles.card}>
          <div className={styles.month_head}>
            <span className={styles.month_label}>{month.label}</span>
            <span className={styles.week_done}>
              <strong>{month.readDays}</strong>일 읽음
            </span>
          </div>
          <div className={styles.month_grid}>
            {MONTH_WEEKDAYS.map((label) => (
              <span key={label} className={styles.month_weekday}>
                {label}
              </span>
            ))}
            {month.cells.map((cell, index) => (
              <span
                key={index}
                className={clsx(
                  styles.month_cell,
                  cell.day !== null && styles[`level_${cell.level}`],
                  cell.isToday && styles.month_cell_today
                )}
              >
                {cell.day ?? ''}
              </span>
            ))}
          </div>
          <div className={styles.legend}>
            <span>적음</span>
            <span className={styles.level_0} />
            <span className={styles.level_1} />
            <span className={styles.level_2} />
            <span className={styles.level_3} />
            <span>많음</span>
          </div>
        </div>
      )}
    </div>
  );
}
