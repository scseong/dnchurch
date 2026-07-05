'use client';

import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { LuImagePlus, LuCheck } from 'react-icons/lu';
import clsx from 'clsx';
import { BottomSheet, Button, Textarea, Pill } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import {
  GALLERY_CATEGORIES,
  GALLERY_SCOPES,
  type GalleryCategory,
  type GalleryScope
} from '../_types';
import styles from './gallery.module.scss';

const STEP_COUNT = 3;

type Props = {
  open: boolean;
  onClose: () => void;
};

// 나눔글 작성 모달 — 목업의 3단계 위저드(사진 → 이야기 → 카테고리·공개 범위).
// 읽기 전용/UI 단계라 실제 업로드·저장은 없다(올리기는 안내 토스트 후 닫기).
export default function GalleryComposeSheet({ open, onClose }: Props) {
  const { info } = useToastStore();
  const [step, setStep] = useState(0);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<GalleryCategory | null>(null);
  const [scope, setScope] = useState<GalleryScope>('public');

  // 열림 전환 시 초기화 — effect 대신 렌더 중 prev 비교(React 권장, NoticeControlBar와 동일 패턴).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStep(0);
      setText('');
      setCategory(null);
      setScope('public');
    }
  }

  const isLast = step === STEP_COUNT - 1;

  const handleSubmit = () => {
    info('나눔글 작성은 준비 중이에요. 곧 직접 올릴 수 있어요.');
    onClose();
  };

  const header = (
    <>
      <div className={styles.sheet_head}>
        <span className={styles.sheet_head_spacer} aria-hidden="true" />
        <h2 className={styles.sheet_title}>나눔글 작성</h2>
        <button type="button" className={styles.sheet_head_btn} onClick={onClose} aria-label="닫기">
          <IoClose />
        </button>
      </div>
      <div className={styles.segments} aria-hidden="true">
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span key={i} className={clsx(styles.segment, i <= step && styles.segment_on)} />
        ))}
      </div>
    </>
  );

  const footer = (
    <>
      {step > 0 && (
        <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
          이전
        </Button>
      )}
      {isLast ? (
        <Button fullWidth onClick={handleSubmit}>
          올리기
        </Button>
      ) : (
        <Button fullWidth onClick={() => setStep((s) => s + 1)}>
          다음
        </Button>
      )}
    </>
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      size="full"
      ariaLabel="나눔글 작성"
      enableHistory
      header={header}
      footer={footer}
    >
      <div className={styles.compose_body}>
        {step === 0 && (
          <>
            <h3 className={styles.compose_title}>어떤 순간을 나눌까요?</h3>
            <p className={styles.compose_sub}>사진을 선택해 주세요 · 최대 10장</p>
            <button
              type="button"
              className={styles.compose_photo_main}
              onClick={() => info('사진 업로드는 준비 중이에요.')}
            >
              <LuImagePlus aria-hidden="true" />
              대표 사진 추가
            </button>
            <div className={styles.compose_photo_row}>
              {Array.from({ length: 3 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.compose_photo_add}
                  onClick={() => info('사진 업로드는 준비 중이에요.')}
                >
                  <LuImagePlus aria-hidden="true" />
                  추가
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className={styles.compose_title}>이야기를 들려주세요</h3>
            <p className={styles.compose_sub}>오늘 받은 은혜, 함께한 순간을 나눠보세요</p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              showCounter
              rows={5}
              aria-label="나눔글 내용"
              placeholder="예) 오랜만에 다 같이 목소리 모아 찬양하는데 마음이 뜨거워졌어요. 함께라서 감사한 저녁이었습니다."
            />
            <p className={styles.compose_hint}>짧아도 좋아요. 진심 한 줄이면 충분해요.</p>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className={styles.compose_title}>거의 다 됐어요</h3>
            <p className={styles.compose_sub}>카테고리와 공개 범위를 정해주세요</p>

            <p className={styles.compose_label}>카테고리</p>
            <div className={styles.compose_cats}>
              {GALLERY_CATEGORIES.map((cat) => (
                <Pill key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                  {cat}
                </Pill>
              ))}
            </div>

            <p className={styles.compose_label}>공개 범위</p>
            <div className={styles.scope_cards}>
              {GALLERY_SCOPES.map((option) => {
                const on = scope === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={clsx(styles.scope_card, on && styles.scope_card_on)}
                    onClick={() => setScope(option.value)}
                    aria-pressed={on}
                  >
                    <span className={clsx(styles.scope_check, on && styles.scope_check_on)}>
                      {on && <LuCheck aria-hidden="true" />}
                    </span>
                    <span className={styles.scope_text}>
                      <b className={styles.scope_name}>{option.label}</b>
                      <span className={styles.scope_desc}>{option.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
