-- 새가족 등록 폼 하드닝 — 민감정보 별도 동의 + 입력 무결성 DB 방어선.
-- 공개 anon insert 경로라, 서버 액션을 우회한 PostgREST 직접 insert도 CHECK로 막는다.
-- 허용값 배열은 src/constants/new-family.ts와 동기화한다 — 옵션을 바꾸면 이 마이그레이션도 고친다.

-- 1) 민감정보(신앙 상태·관심 영역) 별도 동의 플래그.
alter table public.new_family_registrations
  add column if not exists sensitive_agreed boolean not null default false;

-- 2) 입력 무결성 CHECK 제약.
--    name/phone은 자유 입력이라 길이로, referral/interests는 고정 선택이라 허용값으로 막는다.
alter table public.new_family_registrations
  add constraint new_family_name_len
    check (char_length(btrim(name)) between 1 and 50),
  add constraint new_family_phone_len
    check (char_length(btrim(phone)) between 8 and 30),
  add constraint new_family_referral_allowed
    check (
      referral_source is null
      or referral_source = any (array['지인 소개', '인터넷 검색', '우연히 방문', '기타']::text[])
    ),
  add constraint new_family_interests_size
    check (coalesce(cardinality(interests), 0) <= 5),
  add constraint new_family_interests_allowed
    check (interests <@ array['자녀 교육', '교제', '봉사', '양육', '예배']::text[]),
  -- 민감 항목(초신자 여부·관심 영역)은 sensitive_agreed가 true일 때만 채울 수 있다.
  add constraint new_family_sensitive_consent
    check (
      not (is_new_believer or coalesce(cardinality(interests), 0) > 0)
      or sensitive_agreed
    );

-- 3) RLS 정책 재생성 — 익명·로그인 사용자 모두 insert 허용(공개 폼). 읽기는 service_role/admin 전용.
--    액션이 createServerSideClient(세션 인식)를 써서 로그인 성도 제출 시 role이 authenticated가 된다.
drop policy if exists "anyone can submit new family registration" on public.new_family_registrations;

create policy "anyone can submit new family registration"
  on public.new_family_registrations
  for insert
  to anon, authenticated
  with check (privacy_agreed = true);

comment on table public.new_family_registrations is
  '새가족 등록 신청 (공개 폼). 익명·로그인 사용자 insert 허용, 읽기는 service_role/admin 전용. 민감 항목(is_new_believer·interests)은 sensitive_agreed=true일 때만 저장.';
