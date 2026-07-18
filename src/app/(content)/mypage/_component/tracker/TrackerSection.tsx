'use client';

import { useMemo, useState } from 'react';
import { LuFlame, LuShare2, LuBookOpen } from 'react-icons/lu';
import { Button } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import {
  recordChaptersAction,
  unrecordChaptersAction,
  setWeeklyGoalAction,
  startNextCycleAction
} from '@/actions/bible-reading.action';
import {
  computeStreak,
  computeTodayEntries,
  countChaptersOnDate,
  computeWeek,
  computeMonth,
  computePlan,
  chaptersOnDate,
  type ReadingRecord,
  type BibleReadingSettings
} from '@/utils/bible-tracker';
import { getBookByOrder } from '@/constants/bible';
import RecordTabs from './RecordTabs';
import GoalModal from './GoalModal';
import Recorder from './Recorder';
import ShareSheet from './ShareSheet';
import styles from './tracker.module.scss';

type Props = {
  initialRecords: ReadingRecord[];
  initialSettings: BibleReadingSettings;
  today: string;
};

export default function TrackerSection({ initialRecords, initialSettings, today }: Props) {
  const { success, error } = useToastStore();
  const [records, setRecords] = useState<ReadingRecord[]>(initialRecords);
  const [settings, setSettings] = useState<BibleReadingSettings>(initialSettings);
  const [recorderDate, setRecorderDate] = useState<string | null>(null);
  const [recorderBook, setRecorderBook] = useState<number | null>(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const streak = useMemo(() => computeStreak(records, today), [records, today]);
  const todayEntries = useMemo(() => computeTodayEntries(records, today), [records, today]);
  const todayChapters = useMemo(() => countChaptersOnDate(records, today), [records, today]);
  const week = useMemo(
    () => computeWeek(records, today, settings.weekly_goal),
    [records, today, settings.weekly_goal]
  );
  const month = useMemo(() => computeMonth(records, today), [records, today]);
  const plan = useMemo(() => computePlan(records, settings.current_cycle), [records, settings.current_cycle]);

  // 낙관적 쓰기 — 로컬 기록을 먼저 바꾸고 액션 실패 시 되돌린다.
  async function persist(
    action: () => Promise<{ success: boolean; message: string }>,
    rollback: () => void
  ) {
    const result = await action();
    if (!result.success) {
      rollback();
      error(result.message);
    }
  }

  function addRecords(bookOrder: number, chapters: number[], date: string) {
    const cycle = settings.current_cycle;
    setRecords((prev) => {
      const existing = new Set(
        prev
          .filter((r) => r.read_date === date && r.book_order === bookOrder)
          .map((r) => r.chapter)
      );
      const additions = chapters
        .filter((chapter) => !existing.has(chapter))
        .map((chapter) => ({ book_order: bookOrder, chapter, read_date: date, cycle }));
      return additions.length ? [...prev, ...additions] : prev;
    });
  }

  function removeRecords(bookOrder: number, chapters: number[], date: string) {
    const remove = new Set(chapters);
    setRecords((prev) =>
      prev.filter(
        (r) => !(r.read_date === date && r.book_order === bookOrder && remove.has(r.chapter))
      )
    );
  }

  function restoreRecords(removed: ReadingRecord[]) {
    if (removed.length === 0) return;
    setRecords((prev) => {
      const existing = new Set(
        prev.map((r) => `${r.read_date}:${r.book_order}:${r.chapter}:${r.cycle}`)
      );
      const restored = removed.filter(
        (r) => !existing.has(`${r.read_date}:${r.book_order}:${r.chapter}:${r.cycle}`)
      );
      return restored.length ? [...prev, ...restored] : prev;
    });
  }

  function toggleChapter(bookOrder: number, chapter: number, date: string) {
    const isRecorded = chaptersOnDate(records, date, bookOrder).has(chapter);
    if (isRecorded) {
      const removed = records.filter(
        (r) => r.read_date === date && r.book_order === bookOrder && r.chapter === chapter
      );
      removeRecords(bookOrder, [chapter], date);
      void persist(
        () => unrecordChaptersAction(bookOrder, [chapter], date),
        () => restoreRecords(removed)
      );
    } else {
      addRecords(bookOrder, [chapter], date);
      void persist(
        () => recordChaptersAction(bookOrder, [chapter], date),
        () => removeRecords(bookOrder, [chapter], date)
      );
    }
  }

  function recordChapters(bookOrder: number, chapters: number[], date: string) {
    const before = chaptersOnDate(records, date, bookOrder);
    const fresh = chapters.filter((chapter) => !before.has(chapter));
    if (fresh.length === 0) return;
    addRecords(bookOrder, fresh, date);
    void persist(
      () => recordChaptersAction(bookOrder, fresh, date),
      () => removeRecords(bookOrder, fresh, date)
    );
  }

  function clearBook(bookOrder: number, date: string) {
    const removed = records.filter((r) => r.read_date === date && r.book_order === bookOrder);
    const chapters = removed.map((r) => r.chapter);
    if (chapters.length === 0) return;
    removeRecords(bookOrder, chapters, date);
    void persist(
      () => unrecordChaptersAction(bookOrder, chapters, date),
      () => restoreRecords(removed)
    );
  }

  async function changeGoal(goal: number) {
    const previous = settings.weekly_goal;
    setSettings((prev) => ({ ...prev, weekly_goal: goal }));
    setGoalOpen(false);
    await persist(
      () => setWeeklyGoalAction(goal),
      () => setSettings((prev) => ({ ...prev, weekly_goal: previous }))
    );
  }

  async function startNextCycle() {
    const result = await startNextCycleAction();
    if (result.success) {
      setSettings((prev) => ({ ...prev, current_cycle: prev.current_cycle + 1 }));
      success(result.message);
    } else {
      error(result.message);
    }
  }

  function openRecorder(date: string, bookOrder: number | null) {
    setRecorderDate(date);
    setRecorderBook(bookOrder);
  }

  const cyclePastLabel = plan.cyclesDone > 0 ? `지난 ${plan.cyclesDone}회독 완료` : '첫 통독';

  return (
    <section className={styles.tracker} aria-label="성경읽기 기록">
      <div className={styles.streak}>
        <div className={styles.streak_top}>
          <div className={styles.streak_head}>
            <span className={styles.streak_eyebrow}>성경읽기 연속</span>
            <p className={styles.streak_count}>
              <strong>{streak}</strong>일째
            </p>
            <p className={styles.streak_sub}>
              이번 달 <b>{month.readDays}일</b> 말씀과 함께했어요
            </p>
          </div>
          <span className={styles.streak_flame} aria-hidden="true">
            <LuFlame />
          </span>
        </div>
        <Button
          variant="secondary"
          leadingIcon={<LuShare2 aria-hidden="true" />}
          onClick={() => setShareOpen(true)}
        >
          내 기록 공유하기
        </Button>
      </div>

      <RecordTabs
        today={today}
        todayEntries={todayEntries}
        todayChapters={todayChapters}
        week={week}
        month={month}
        onOpenRecorder={(bookOrder) => openRecorder(today, bookOrder)}
        onOpenGoal={() => setGoalOpen(true)}
      />

      <div className={styles.plan}>
        <div className={styles.plan_head}>
          <span className={styles.plan_title}>
            성경 통독
            <span className={styles.plan_cycle}>{plan.cycleNum}회독</span>
          </span>
          <span className={styles.plan_pct}>{plan.pct}%</span>
        </div>
        <div className={styles.bar}>
          <span className={styles.bar_fill} style={{ width: `${plan.pct}%` }} />
        </div>
        <div className={styles.plan_meta}>
          <span>
            {plan.read} / {plan.total}장 · {plan.left}장 남음
          </span>
          <span>{cyclePastLabel}</span>
        </div>
        {plan.done && (
          <div className={styles.plan_done}>
            <p className={styles.plan_done_title}>🎉 {plan.cycleNum}회독 완료!</p>
            <p className={styles.plan_done_sub}>1,189장을 모두 읽었어요. 다음 회독을 새로 시작할 수 있어요.</p>
            <Button variant="accent" fullWidth onClick={startNextCycle}>
              다음 회독 시작하기
            </Button>
          </div>
        )}
        <Button
          variant="accent"
          fullWidth
          leadingIcon={<LuBookOpen aria-hidden="true" />}
          onClick={() => openRecorder(today, null)}
        >
          지난 날짜·권별로 기록하기
        </Button>
      </div>

      {recorderDate !== null && (
        <Recorder
          records={records}
          today={today}
          currentCycle={settings.current_cycle}
          initialDate={recorderDate}
          initialBook={recorderBook}
          onToggleChapter={toggleChapter}
          onRecordChapters={recordChapters}
          onClearBook={clearBook}
          onClose={() => setRecorderDate(null)}
          getBookName={(order) => getBookByOrder(order)?.name ?? ''}
        />
      )}

      <GoalModal
        open={goalOpen}
        initialGoal={settings.weekly_goal}
        onClose={() => setGoalOpen(false)}
        onSave={changeGoal}
      />

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        todayChapters={todayChapters}
        weekChapters={week.chapters}
        weekDoneCount={week.doneCount}
        monthChapters={month.chapters}
        monthReadDays={month.readDays}
      />
    </section>
  );
}
