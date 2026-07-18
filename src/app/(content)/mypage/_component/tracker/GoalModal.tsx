'use client';

import { useState } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';
import { Modal, Button } from '@/components/ui';
import styles from './tracker.module.scss';

const GOAL_MIN = 5;
const GOAL_MAX = 150;
const GOAL_STEP = 1;

const clampGoal = (value: number) => Math.min(GOAL_MAX, Math.max(GOAL_MIN, value));

type Props = {
  open: boolean;
  initialGoal: number;
  onClose: () => void;
  onSave: (goal: number) => void;
};

export default function GoalModal({ open, initialGoal, onClose, onSave }: Props) {
  const [goal, setGoal] = useState(initialGoal);

  // 열릴 때 현재 목표로 초기화 — 렌더 중 prev 비교 (앱 공통 패턴).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setGoal(initialGoal);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="주간 목표"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="accent" onClick={() => onSave(clampGoal(goal))}>
            완료
          </Button>
        </>
      }
    >
      <p className={styles.goal_desc}>일주일에 읽을 목표 장 수를 정하세요</p>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepper_btn}
          onClick={() => setGoal((value) => clampGoal(value - GOAL_STEP))}
          aria-label="목표 줄이기"
        >
          <LuMinus aria-hidden="true" />
        </button>
        <span className={styles.stepper_value}>
          <input
            type="number"
            className={styles.stepper_input}
            value={goal}
            min={GOAL_MIN}
            max={GOAL_MAX}
            inputMode="numeric"
            aria-label="주간 목표 장 수"
            onChange={(event) => {
              const next = Number(event.target.value);
              setGoal(Number.isFinite(next) ? next : GOAL_MIN);
            }}
            onBlur={() => setGoal((value) => clampGoal(value))}
          />
          장
        </span>
        <button
          type="button"
          className={styles.stepper_btn}
          onClick={() => setGoal((value) => clampGoal(value + GOAL_STEP))}
          aria-label="목표 늘리기"
        >
          <LuPlus aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
}
