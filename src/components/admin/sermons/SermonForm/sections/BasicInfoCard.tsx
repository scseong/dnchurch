import Field from '../primitives/Field';
import Input from '../primitives/Input';
import Select from '../primitives/Select';
import type { BasicInfoCardProps } from '@/types/sermon-form';
import type { ServiceType } from '@/types/sermon';
import styles from '../index.module.scss';

const SERVICE_TYPES: ServiceType[] = [
  '주일오전예배',
  '주일저녁예배',
  '수요기도회',
  '금요기도회',
  '새벽예배',
  '특별예배'
];

export default function BasicInfoCard({
  title,
  sermonDate,
  preacherId,
  seriesId,
  serviceType,
  onChange
}: BasicInfoCardProps) {
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
          <Field label="설교 제목" required counter={`${title.length}/80`}>
            <Input
              placeholder="예: 두려움을 넘어 믿음으로"
              maxLength={80}
              value={title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </Field>

          <div className={styles.field_row}>
            <Field label="설교 날짜" required>
              <Input
                type="date"
                value={sermonDate}
                onChange={(e) => onChange({ sermonDate: e.target.value })}
              />
            </Field>
            <Field label="설교자" required>
              <Select
                value={preacherId}
                onChange={(e) => onChange({ preacherId: e.target.value })}
              >
                <option value="" disabled>
                  설교자를 선택하세요
                </option>
                <option value="김은혜 목사">김은혜 목사</option>
                <option value="박성민 목사">박성민 목사</option>
                <option value="이주영 전도사">이주영 전도사</option>
              </Select>
            </Field>
          </div>

          <div className={styles.field_row}>
            <Field label="설교 시리즈" optional>
              <Select
                value={seriesId}
                onChange={(e) => onChange({ seriesId: e.target.value })}
              >
                <option value="">단독 설교</option>
                <option value="마가복음 강해">마가복음 강해</option>
                <option value="산상수훈">산상수훈</option>
                <option value="시편 묵상">시편 묵상</option>
                <option value="로마서">로마서</option>
              </Select>
            </Field>
            <Field label="예배 종류" required>
              <Select
                value={serviceType}
                onChange={(e) => onChange({ serviceType: e.target.value as ServiceType })}
              >
                <option value="" disabled>
                  예배를 선택하세요
                </option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </div>
    </section>
  );
}
