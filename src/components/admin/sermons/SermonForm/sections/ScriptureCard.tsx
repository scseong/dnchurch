import Field from '../primitives/Field';
import Input from '../primitives/Input';
import Textarea from '../primitives/Textarea';
import type { SermonCardProps } from '@/types/sermon-form';
import styles from '../index.module.scss';

export default function ScriptureCard({ data, setData }: SermonCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.card_header}>
        <span className={styles.card_number}>3</span>
        <div>
          <h3 className={styles.card_heading_title}>말씀</h3>
          <p className={styles.card_heading_desc}>본문 구절과 설교 요약을 입력합니다</p>
        </div>
      </header>
      <div className={styles.card_body}>
        <div className={styles.fields}>
          <Field
            label="성경 구절"
            optional
            hint="본문 구절을 입력하면 설교 카드에 태그로 표시됩니다"
          >
            <Input
              placeholder="예: 마가복음 4:35-41"
              value={data.scripture}
              onChange={(e) => setData((d) => ({ ...d, scripture: e.target.value }))}
            />
          </Field>

          <Field label="성경 본문" optional counter="0자">
            <Textarea
              tall
              placeholder="성경 본문 전체를 입력하세요. 절 번호와 함께 작성하면 좋습니다."
            />
          </Field>

          <Field label="설교 요약" optional counter="0/500">
            <Textarea
              placeholder="설교의 핵심 메시지를 2-3 문장으로 요약해주세요"
              maxLength={500}
            />
          </Field>
        </div>
      </div>
    </section>
  );
}
