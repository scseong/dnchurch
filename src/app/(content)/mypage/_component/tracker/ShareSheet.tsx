'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { LuMessageCircle, LuDownload, LuLink } from 'react-icons/lu';
import { BottomSheet, Button, Tabs } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import type { WeekDay, MonthCell } from '@/utils/bible-tracker';
import styles from './tracker.module.scss';

type Period = 'day' | 'week' | 'month';

const PERIOD_ITEMS = [
  { id: 'day', label: '일간' },
  { id: 'week', label: '주간' },
  { id: 'month', label: '월간' }
];

type Props = {
  open: boolean;
  onClose: () => void;
  todayChapters: number;
  todayRanges: string[];
  weekChapters: number;
  weekDoneCount: number;
  weekDays: WeekDay[];
  monthChapters: number;
  monthReadDays: number;
  monthCells: MonthCell[];
};

export default function ShareSheet({
  open,
  onClose,
  todayChapters,
  todayRanges,
  weekChapters,
  weekDoneCount,
  weekDays,
  monthChapters,
  monthReadDays,
  monthCells
}: Props) {
  const { info } = useToastStore();
  const [period, setPeriod] = useState<Period>('week');

  const stat =
    period === 'day'
      ? { title: '오늘', value: todayChapters, sub: '오늘 읽은 장' }
      : period === 'week'
        ? { title: '이번 주', value: weekChapters, sub: `${weekDoneCount}일 함께한 한 주` }
        : { title: '이번 달', value: monthChapters, sub: `${monthReadDays}일 읽은 이번 달` };

  return (
    <BottomSheet open={open} onClose={onClose} title="기록 공유하기">
      <div className={styles.share}>
        <Tabs
          variant="pill"
          size="sm"
          fitted
          items={PERIOD_ITEMS}
          activeId={period}
          onChange={(id) => setPeriod(id as Period)}
        />

        <div className={styles.share_card}>
          <span className={styles.share_brand}>대구동남교회</span>
          <span className={styles.share_eyebrow}>{stat.title} 성경읽기</span>
          <p className={styles.share_stat}>
            <strong>{stat.value}</strong>장 읽음
          </p>
          <p className={styles.share_sub}>{stat.sub}</p>

          {period === 'day' && (
            <div className={styles.share_detail}>
              <span className={styles.share_detail_title}>오늘 읽은 곳</span>
              {todayRanges.length > 0 ? (
                <ul className={styles.share_ranges}>
                  {todayRanges.map((range) => (
                    <li key={range}>{range}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.share_empty}>아직 오늘 기록한 말씀이 없어요</p>
              )}
            </div>
          )}

          {period === 'week' && (
            <ul className={styles.share_strip}>
              {weekDays.map((day) => (
                <li key={day.date} className={styles.share_strip_day}>
                  <span className={styles.share_strip_label}>{day.label}</span>
                  <span
                    className={clsx(
                      styles.share_strip_mark,
                      day.done && styles.share_strip_mark_done
                    )}
                  >
                    {day.done ? '✓' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {period === 'month' && (
            <div className={styles.share_detail}>
              <span className={styles.share_detail_title}>한 달의 발자취</span>
              <div className={styles.share_footprint}>
                {monthCells.map((cell, index) => (
                  <span
                    key={index}
                    className={clsx(
                      styles.share_dot,
                      cell.day !== null && styles[`dot_${cell.level}`],
                      cell.isToday && styles.share_dot_today
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <p className={styles.share_verse}>
            “주의 말씀은 내 발에 등이요 내 길에 빛이니이다”
            <span className={styles.share_verse_ref}>시편 119:105</span>
          </p>
        </div>

        <div className={styles.share_actions}>
          <button
            type="button"
            className={styles.share_action}
            onClick={() => info('카카오톡 공유는 준비 중이에요.')}
          >
            <span className={styles.share_action_icon}>
              <LuMessageCircle aria-hidden="true" />
            </span>
            카카오톡
          </button>
          <button
            type="button"
            className={styles.share_action}
            onClick={() => info('이미지 저장은 준비 중이에요.')}
          >
            <span className={styles.share_action_icon}>
              <LuDownload aria-hidden="true" />
            </span>
            이미지 저장
          </button>
          <button
            type="button"
            className={styles.share_action}
            onClick={() => info('링크 복사는 준비 중이에요.')}
          >
            <span className={styles.share_action_icon}>
              <LuLink aria-hidden="true" />
            </span>
            링크 복사
          </button>
        </div>

        <Button variant="secondary" fullWidth onClick={onClose}>
          닫기
        </Button>
      </div>
    </BottomSheet>
  );
}
