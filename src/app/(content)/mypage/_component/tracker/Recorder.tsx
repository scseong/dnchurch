'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { LuChevronLeft, LuChevronRight, LuX, LuCheck, LuHistory } from 'react-icons/lu';
import { BottomSheet } from '@/components/ui';
import { BIBLE_BOOKS, getBookByOrder, type Testament } from '@/constants/bible';
import {
  chaptersOnDate,
  cycleUnionByBook,
  formatDateLabel,
  shiftDate,
  type ReadingRecord
} from '@/utils/bible-tracker';
import styles from './tracker.module.scss';

type Mode = 'single' | 'range';

// date가 null이면 prior-read(이전에 읽은 기록) — 날짜 없이 통독에만 반영한다.
export type RecorderMode = 'dated' | 'prior';

type Props = {
  records: ReadingRecord[];
  today: string;
  currentCycle: number;
  initialDate: string;
  initialBook: number | null;
  initialMode: RecorderMode;
  onToggleChapter: (bookOrder: number, chapter: number, date: string | null) => void;
  onRecordChapters: (bookOrder: number, chapters: number[], date: string | null) => void;
  onClearBook: (bookOrder: number, date: string | null) => void;
  onClose: () => void;
  getBookName: (order: number) => string;
};

export default function Recorder({
  records,
  today,
  currentCycle,
  initialDate,
  initialBook,
  initialMode,
  onToggleChapter,
  onRecordChapters,
  onClearBook,
  onClose
}: Props) {
  const [date, setDate] = useState(initialDate);
  const [book, setBook] = useState<number | null>(initialBook);
  const [testament, setTestament] = useState<Testament>(
    initialBook !== null && getBookByOrder(initialBook)?.testament === '신약' ? '신약' : '구약'
  );
  const [mode, setMode] = useState<Mode>('single');
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [readingMode, setReadingMode] = useState<RecorderMode>(initialMode);

  // prior 모드는 날짜 없이 저장한다 — 저장 대상 날짜는 null.
  const recDate = readingMode === 'prior' ? null : date;
  const cycleUnion = cycleUnionByBook(records, currentCycle);
  const isChapters = book !== null;
  const canGoNext = date < today;

  // 권 목록 배지용 — dated는 선택 날짜의 책별 장 수, prior는 read_date null·현재 회차의 책별 장 집합.
  const dateCountByBook = new Map<number, number>();
  const priorByBook = new Map<number, Set<number>>();
  for (const rec of records) {
    if (rec.read_date === date) {
      dateCountByBook.set(rec.book_order, (dateCountByBook.get(rec.book_order) ?? 0) + 1);
    }
    if (rec.read_date === null && rec.cycle === currentCycle) {
      let set = priorByBook.get(rec.book_order);
      if (!set) {
        set = new Set<number>();
        priorByBook.set(rec.book_order, set);
      }
      set.add(rec.chapter);
    }
  }

  function goToBook(order: number) {
    setBook(order);
    setRangeStart(null);
  }

  function backToBooks() {
    setBook(null);
    setRangeStart(null);
  }

  function shiftRecorderDate(delta: number) {
    if (delta > 0 && !canGoNext) return;
    setDate((value) => shiftDate(value, delta));
    setRangeStart(null);
  }

  function changeReadingMode(next: RecorderMode) {
    setReadingMode(next);
    setRangeStart(null);
  }

  function tapChapter(order: number, chapter: number) {
    if (mode === 'single') {
      onToggleChapter(order, chapter, recDate);
      return;
    }
    if (rangeStart === null) {
      setRangeStart(chapter);
      return;
    }
    const from = Math.min(rangeStart, chapter);
    const to = Math.max(rangeStart, chapter);
    const range = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    onRecordChapters(order, range, recDate);
    setRangeStart(null);
  }

  const header = (
    <div className={styles.rec_head}>
      <button
        type="button"
        className={styles.rec_icon}
        onClick={isChapters ? backToBooks : onClose}
        aria-label={isChapters ? '책 목록으로' : '닫기'}
      >
        <LuChevronLeft aria-hidden="true" />
      </button>
      <span className={styles.rec_title}>
        {isChapters ? getBookByOrder(book)?.name : '성경 읽기 기록'}
      </span>
      <button type="button" className={styles.rec_icon} onClick={onClose} aria-label="닫기">
        <LuX aria-hidden="true" />
      </button>
    </div>
  );

  const selectedBook = book !== null ? getBookByOrder(book) : undefined;
  const dateChapters = book !== null ? chaptersOnDate(records, date, book) : new Set<number>();
  const priorChapters = book !== null ? priorByBook.get(book) ?? new Set<number>() : new Set<number>();
  const markedSet = readingMode === 'prior' ? priorChapters : dateChapters;
  const bookUnion = book !== null ? cycleUnion.get(book) ?? new Set<number>() : new Set<number>();

  const rangeHint =
    mode === 'range'
      ? rangeStart === null
        ? '시작 장을 선택하세요'
        : `${rangeStart}장부터 · 끝 장을 선택하세요`
      : readingMode === 'prior'
        ? '읽은 장을 눌러 표시하세요'
        : '읽은 장을 눌러 이 날짜에 기록하세요';

  return (
    <BottomSheet open onClose={onClose} size="full" ariaLabel="성경 읽기 기록" enableHistory header={header}>
      <div className={styles.rec_modebar}>
        <div className={styles.rec_testament}>
          <button
            type="button"
            className={clsx(styles.rec_seg, readingMode === 'dated' && styles.rec_seg_on)}
            onClick={() => changeReadingMode('dated')}
          >
            오늘 읽음
          </button>
          <button
            type="button"
            className={clsx(styles.rec_seg, readingMode === 'prior' && styles.rec_seg_on)}
            onClick={() => changeReadingMode('prior')}
          >
            이전에 읽은 기록
          </button>
        </div>
      </div>

      {readingMode === 'dated' ? (
        <div className={styles.rec_datebar}>
          <button
            type="button"
            className={styles.rec_date_nav}
            onClick={() => shiftRecorderDate(-1)}
            aria-label="이전 날짜"
          >
            <LuChevronLeft aria-hidden="true" />
          </button>
          <div className={styles.rec_date}>
            <span className={styles.rec_date_caption}>기록할 날짜</span>
            <span className={styles.rec_date_label}>
              {formatDateLabel(date)}
              {date === today && <span className={styles.rec_today}>오늘</span>}
            </span>
          </div>
          <button
            type="button"
            className={clsx(styles.rec_date_nav, !canGoNext && styles.rec_date_nav_off)}
            onClick={() => shiftRecorderDate(1)}
            aria-label="다음 날짜"
            disabled={!canGoNext}
          >
            <LuChevronRight aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className={styles.rec_prior_note}>
          <LuHistory aria-hidden="true" />
          통독 진행에만 반영 · 일간 기록에는 포함되지 않아요
        </div>
      )}

      {!isChapters && (
        <div className={styles.rec_body}>
          <div className={styles.rec_testament}>
            <button
              type="button"
              className={clsx(styles.rec_seg, testament === '구약' && styles.rec_seg_on)}
              onClick={() => setTestament('구약')}
            >
              구약 39권
            </button>
            <button
              type="button"
              className={clsx(styles.rec_seg, testament === '신약' && styles.rec_seg_on)}
              onClick={() => setTestament('신약')}
            >
              신약 27권
            </button>
          </div>
          <ul className={styles.book_grid}>
            {BIBLE_BOOKS.filter((item) => item.testament === testament).map((item) => {
              const read = cycleUnion.get(item.order)?.size ?? 0;
              const pct = Math.round((read / item.chapters) * 100);
              const full = read === item.chapters;
              const badgeCount =
                readingMode === 'prior'
                  ? priorByBook.get(item.order)?.size ?? 0
                  : dateCountByBook.get(item.order) ?? 0;
              return (
                <li key={item.order}>
                  <button
                    type="button"
                    className={clsx(styles.book, full && styles.book_full)}
                    onClick={() => goToBook(item.order)}
                  >
                    <span className={styles.book_row}>
                      <span className={styles.book_head}>
                        <span className={styles.book_name}>{item.name}</span>
                        {badgeCount > 0 && (
                          <span className={styles.book_badge}>
                            <LuCheck aria-hidden="true" />
                            {badgeCount}
                          </span>
                        )}
                      </span>
                      <span className={styles.book_sub}>
                        {read}/{item.chapters}
                      </span>
                    </span>
                    <span className={styles.bar}>
                      <span className={styles.bar_fill} style={{ width: `${pct}%` }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isChapters && selectedBook && (
        <div className={styles.rec_body}>
          <div className={styles.rec_controls}>
            <div className={styles.rec_modes}>
              <button
                type="button"
                className={clsx(styles.rec_seg, mode === 'single' && styles.rec_seg_on)}
                onClick={() => {
                  setMode('single');
                  setRangeStart(null);
                }}
              >
                낱장
              </button>
              <button
                type="button"
                className={clsx(styles.rec_seg, mode === 'range' && styles.rec_seg_on)}
                onClick={() => setMode('range')}
              >
                범위
              </button>
            </div>
            <div className={styles.rec_actions}>
              <button
                type="button"
                className={styles.rec_text_btn}
                onClick={() =>
                  onRecordChapters(
                    selectedBook.order,
                    Array.from({ length: selectedBook.chapters }, (_, i) => i + 1),
                    recDate
                  )
                }
              >
                모두 읽음
              </button>
              <button
                type="button"
                className={styles.rec_text_btn}
                onClick={() => onClearBook(selectedBook.order, recDate)}
              >
                해제
              </button>
            </div>
          </div>
          <div className={styles.rec_meta}>
            <p className={styles.rec_hint}>{rangeHint}</p>
            <ul className={styles.chapter_legend}>
              <li>
                <span className={clsx(styles.chapter_swatch, styles.chapter_today)} />
                {readingMode === 'prior' ? '선택됨' : '오늘 읽음'}
              </li>
              <li>
                <span className={clsx(styles.chapter_swatch, styles.chapter_before)} />
                이미 읽음
              </li>
            </ul>
          </div>
          <ul className={styles.chapter_grid}>
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => {
              const marked = markedSet.has(chapter);
              const readBefore = bookUnion.has(chapter) && !marked;
              const isStart = rangeStart === chapter;
              return (
                <li key={chapter}>
                  <button
                    type="button"
                    className={clsx(
                      styles.chapter,
                      marked && styles.chapter_today,
                      readBefore && styles.chapter_before,
                      isStart && styles.chapter_start
                    )}
                    onClick={() => tapChapter(selectedBook.order, chapter)}
                    aria-pressed={marked}
                  >
                    {chapter}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </BottomSheet>
  );
}
