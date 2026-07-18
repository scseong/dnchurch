'use client';

import { useState } from 'react';
import { LuMessageCircle, LuDownload, LuLink } from 'react-icons/lu';
import { BottomSheet, Button, Tabs } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
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
  weekChapters: number;
  weekDoneCount: number;
  monthChapters: number;
  monthReadDays: number;
};

export default function ShareSheet({
  open,
  onClose,
  todayChapters,
  weekChapters,
  weekDoneCount,
  monthChapters,
  monthReadDays
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
