'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IoCaretDown, IoCaretUp } from 'react-icons/io5';
import styles from './ScriptureBlock.module.scss';

type Props = {
  scriptureRef: string;
  scriptureText: string | null;
};

// 접힘 미리보기 높이(rem) — .text_collapsed의 max-height와 같은 값이라야 접기 슬라이드가 이어진다.
const COLLAPSED_MAX_HEIGHT_REM = 12;
const COLLAPSED_MAX_HEIGHT = `${COLLAPSED_MAX_HEIGHT_REM}rem`;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function ScriptureBlock({ scriptureRef, scriptureText }: Props) {
  const [expanded, setExpanded] = useState(false);
  // 본문이 접힘 높이를 넘을 때만 토글·fade·아코디언을 쓴다. 짧으면 전체를 그냥 보인다.
  const [overflowing, setOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const hasText = !!scriptureText;

  // 콘텐츠 실제 높이(scrollHeight)가 접힘 높이를 넘는지 측정. rem이 뷰포트 기반(2.777778vw)이라
  // 리사이즈마다 다시 잰다. scrollHeight는 max-height 클램프와 무관하게 전체 높이를 준다.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => {
      const rootFontPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      setOverflowing(el.scrollHeight > COLLAPSED_MAX_HEIGHT_REM * rootFontPx + 1);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [scriptureText]);

  // 아코디언 슬라이드: 실제 콘텐츠 높이(scrollHeight)를 재서 max-height를 애니메이션한다.
  // auto/none은 트랜지션이 걸리지 않으므로 px로 고정했다가 펼침이 끝난 뒤 none으로 푼다.
  const toggle = () => {
    const el = textRef.current;
    const next = !expanded;
    setExpanded(next);

    if (!el || prefersReducedMotion()) {
      if (el) el.style.maxHeight = next ? 'none' : COLLAPSED_MAX_HEIGHT;
      return;
    }

    if (next) {
      // 펼치기: 12rem(현재) → 실제 높이(px)
      el.style.maxHeight = `${el.scrollHeight}px`;
    } else {
      // 접기: none 상태엔 시작점이 없어 트랜지션이 안 되므로 현재 높이(px)로 고정 후 12rem로
      el.style.maxHeight = `${el.scrollHeight}px`;
      void el.offsetHeight; // 강제 reflow로 시작값 확정
      el.style.maxHeight = COLLAPSED_MAX_HEIGHT;
    }
  };

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLParagraphElement>
  ) => {
    if (event.propertyName !== 'max-height') return;
    // 펼침이 끝나면 제한을 풀어 뷰포트 리사이즈로 본문이 늘어도 잘리지 않게 한다.
    if (expanded && textRef.current) {
      textRef.current.style.maxHeight = 'none';
    }
  };

  const isCollapsed = overflowing && !expanded;

  return (
    <div className={styles.block}>
      <h4 className={styles.ref}>{scriptureRef}</h4>
      {hasText ? (
        <>
          <div className={styles.text_wrap}>
            <p
              ref={textRef}
              className={clsx(styles.text, isCollapsed && styles.text_collapsed)}
              onTransitionEnd={handleTransitionEnd}
            >
              {scriptureText}
            </p>
            {overflowing && (
              <span
                className={clsx(styles.fade, expanded && styles.fade_hidden)}
                aria-hidden="true"
              />
            )}
          </div>
          {/* fade 밖(아래)에 둬야 토글이 그라디언트에 가려지지 않는다. */}
          {overflowing && (
            <button
              type="button"
              className={styles.toggle}
              onClick={toggle}
              aria-expanded={expanded}
            >
              {expanded ? '간략히 보기' : '자세히 보기'}
              {expanded ? (
                <IoCaretUp aria-hidden="true" />
              ) : (
                <IoCaretDown aria-hidden="true" />
              )}
            </button>
          )}
        </>
      ) : (
        <p className={styles.empty}>본문 텍스트가 등록되지 않았습니다</p>
      )}
    </div>
  );
}
