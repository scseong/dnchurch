'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { LuChevronLeft, LuChevronRight, LuX, LuCheck } from 'react-icons/lu';
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

type Props = {
  records: ReadingRecord[];
  today: string;
  currentCycle: number;
  initialDate: string;
  initialBook: number | null;
  onToggleChapter: (bookOrder: number, chapter: number, date: string) => void;
  onRecordChapters: (bookOrder: number, chapters: number[], date: string) => void;
  onClearBook: (bookOrder: number, date: string) => void;
  onClose: () => void;
  getBookName: (order: number) => string;
};

export default function Recorder({
  records,
  today,
  currentCycle,
  initialDate,
  initialBook,
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

  const cycleUnion = cycleUnionByBook(records, currentCycle);
  const isChapters = book !== null;
  const canGoNext = date < today;

  // 선택한 날짜에 책별로 기록한 장 수 — 권 목록의 배지용(상단 날짜바가 어느 날인지 알려준다).
  const dateCountByBook = new Map<number, number>();
  for (const rec of records) {
    if (rec.read_date === date) {
      dateCountByBook.set(rec.book_order, (dateCountByBook.get(rec.book_order) ?? 0) + 1);
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

  function tapChapter(order: number, chapter: number) {
    if (mode === 'single') {
      onToggleChapter(order, chapter, date);
      return;
    }
    if (rangeStart === null) {
      setRangeStart(chapter);
      return;
    }
    const from = Math.min(rangeStart, chapter);
    const to = Math.max(rangeStart, chapter);
    const range = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    onRecordChapters(order, range, date);
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
  const bookUnion = book !== null ? cycleUnion.get(book) ?? new Set<number>() : new Set<number>();

  const rangeHint =
    mode === 'range'
      ? rangeStart === null
        ? '시작 장을 선택하세요'
        : `${rangeStart}장부터 · 끝 장을 선택하세요`
      : '읽은 장을 눌러 이 날짜에 기록하세요';

  return (
    <BottomSheet open onClose={onClose} size="full" ariaLabel="성경 읽기 기록" enableHistory header={header}>
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
              const dateCount = dateCountByBook.get(item.order) ?? 0;
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
                        {dateCount > 0 && (
                          <span className={styles.book_badge}>
                            <LuCheck aria-hidden="true" />
                            {dateCount}
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
                    date
                  )
                }
              >
                모두 읽음
              </button>
              <button
                type="button"
                className={styles.rec_text_btn}
                onClick={() => onClearBook(selectedBook.order, date)}
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
                오늘 읽음
              </li>
              <li>
                <span className={clsx(styles.chapter_swatch, styles.chapter_before)} />
                이미 읽음
              </li>
            </ul>
          </div>
          <ul className={styles.chapter_grid}>
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => {
              const readToday = dateChapters.has(chapter);
              const readBefore = bookUnion.has(chapter) && !readToday;
              const isStart = rangeStart === chapter;
              return (
                <li key={chapter}>
                  <button
                    type="button"
                    className={clsx(
                      styles.chapter,
                      readToday && styles.chapter_today,
                      readBefore && styles.chapter_before,
                      isStart && styles.chapter_start
                    )}
                    onClick={() => tapChapter(selectedBook.order, chapter)}
                    aria-pressed={readToday}
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
