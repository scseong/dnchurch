-- worship_schedules 확장
-- 디자인 시스템 v2 적용을 위한 표시용 부가 필드 + 분류 컬럼

ALTER TABLE worship_schedules
  ADD COLUMN description text,
  ADD COLUMN duration text,
  ADD COLUMN age_group text,
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN sub_category text
    CHECK (sub_category IN ('sunday', 'weekday') OR sub_category IS NULL);

-- main 카테고리 시드: sub_category + featured + description + duration
UPDATE worship_schedules SET sub_category = 'sunday',  is_featured = true,
       description = '온 성도가 함께 드리는 대표 예배입니다.', duration = '약 90분'
 WHERE name = '주일낮예배';

UPDATE worship_schedules SET sub_category = 'sunday',
       description = '한 주를 정리하며 드리는 저녁 예배입니다.', duration = '약 70분'
 WHERE name = '주일저녁예배';

UPDATE worship_schedules SET sub_category = 'weekday',
       description = '말씀과 기도로 한 주의 중심을 잡습니다.'
 WHERE name = '수요기도회';

UPDATE worship_schedules SET sub_category = 'weekday',
       description = '통성기도와 중보기도의 시간입니다.'
 WHERE name = '금요기도회';

UPDATE worship_schedules SET sub_category = 'weekday',
       description = '매일 아침 말씀과 기도로 시작합니다.'
 WHERE name = '새벽기도회';

-- church_school 카테고리 시드: age_group
UPDATE worship_schedules SET age_group = '5–7세'   WHERE name = '유치부';
UPDATE worship_schedules SET age_group = '1–6학년' WHERE name = '초등부';
UPDATE worship_schedules SET age_group = '중1–고3' WHERE name = '중고등부';
UPDATE worship_schedules SET age_group = '20–30대' WHERE name = '청년부';
