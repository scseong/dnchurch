'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { IoCaretDown, IoCaretUp } from 'react-icons/io5';
import styles from './ScriptureBlock.module.scss';

type Props = {
  scriptureRef: string;
  scriptureText: string | null;
};

export default function ScriptureBlock({ scriptureRef, scriptureText }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasText = !!scriptureText;

  return (
    <div className={styles.block}>
      <h4 className={styles.ref}>{scriptureRef}</h4>
      {hasText ? (
        <>
          <div className={styles.text_wrap}>
            <p className={clsx(styles.text, !expanded && styles.text_collapsed)}>
              {scriptureText}
            </p>
            {!expanded && <span className={styles.fade} aria-hidden="true" />}
          </div>
          {/* fade 밖(아래)에 둬야 '자세히 보기'가 그라디언트에 가려지지 않는다. */}
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '접기' : '자세히 보기'}
            {expanded ? (
              <IoCaretUp aria-hidden="true" />
            ) : (
              <IoCaretDown aria-hidden="true" />
            )}
          </button>
        </>
      ) : (
        <p className={styles.empty}>본문 텍스트가 등록되지 않았습니다</p>
      )}
    </div>
  );
}
