import Field from '../primitives/Field';
import Input from '../primitives/Input';
import InputGroup from '../primitives/InputGroup';
import Select from '../primitives/Select';
import type { SermonCardProps } from '@/types/sermon-form';
import styles from '../index.module.scss';

export default function BasicInfoCard({ data, setData }: SermonCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.card_header}>
        <span className={styles.card_number}>1</span>
        <div>
          <h3 className={styles.card_heading_title}>기본 정보</h3>
          <p className={styles.card_heading_desc}>설교 제목·날짜·설교자를 입력합니다</p>
        </div>
      </header>
      <div className={styles.card_body}>
        <div className={styles.fields}>
          <Field label="설교 제목" required counter={`${data.title.length}/80`}>
            <Input
              placeholder="예: 두려움을 넘어 믿음으로"
              maxLength={80}
              value={data.title}
              onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
            />
          </Field>

          <Field
            label="URL slug"
            optional="자동 생성"
            hint="제목 입력 시 자동 생성됩니다. 수동으로 편집 가능합니다."
          >
            <InputGroup prefix="/sermons/" placeholder="dureoum-eul-neomeo-mideumeuro" />
          </Field>

          <div className={styles.field_row}>
            <Field label="설교 날짜" required>
              <Input type="date" />
            </Field>
            <Field label="설교자" required>
              <Select defaultValue="">
                <option value="" disabled>
                  설교자를 선택하세요
                </option>
                <option>김은혜 목사</option>
                <option>박성민 목사</option>
                <option>이주영 전도사</option>
              </Select>
            </Field>
          </div>

          <div className={styles.field_row}>
            <div className={styles.flex_2}>
              <Field label="설교 시리즈" optional>
                <Select defaultValue="">
                  <option value="">단독 설교</option>
                  <option>마가복음 강해</option>
                  <option>산상수훈</option>
                  <option>시편 묵상</option>
                  <option>로마서</option>
                </Select>
              </Field>
            </div>
            <Field label="시리즈 순번" optional>
              <Input type="number" min={1} placeholder="1" />
            </Field>
          </div>
        </div>
      </div>
    </section>
  );
}
