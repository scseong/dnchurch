import { LayoutContainer } from '@/components/layout';
import styles from './NewHere.module.scss';

const INFO = [
  { label: '예배 시간', value: '주일 11시 · 수요 7시' },
  { label: '복장', value: '편한 차림 그대로' },
  { label: '주차', value: '교회 주차장 이용' },
  { label: '자녀', value: '영유아실 · 교회학교' }
];

export default function NewHere() {
  return (
    <section className={styles.section} id="new-here">
      <LayoutContainer>
        <div className={styles.card}>
          <h2 className={styles.title}>처음 오시나요?</h2>
          <p className={styles.desc}>
            편하게 오셔서 함께 예배드리면 됩니다. 부담 가질 것 하나도 없어요.
          </p>
          <ul className={styles.grid}>
            {INFO.map(({ label, value }) => (
              <li key={label} className={styles.tile}>
                <span className={styles.tile_label}>{label}</span>
                <span className={styles.tile_value}>{value}</span>
              </li>
            ))}
          </ul>
          <p className={styles.notice}>
            예배 30분 전, 본당 입구 <strong>새가족 안내데스크</strong>로 오시면 자리 안내부터 끝까지
            도와드려요.
          </p>
        </div>
      </LayoutContainer>
    </section>
  );
}
