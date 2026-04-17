'use client';

import { useState } from 'react';
import clsx from 'clsx';
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
        <div className={styles.text_wrap}>
          <p className={clsx(styles.text, !expanded && styles.text_collapsed)}>
            {scriptureText}
          </p>
          {!expanded && <span className={styles.fade} aria-hidden="true" />}
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '접기' : '더 보기'}
          </button>
        </div>
      ) : (
        <p className={styles.empty}>본문 텍스트가 등록되지 않았습니다</p>
      )}
    </div>
  );
}
