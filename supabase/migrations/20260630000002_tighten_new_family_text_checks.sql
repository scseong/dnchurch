-- name/phone 공백 문자만 있는 값 차단 강화 (PR #135 리뷰).
-- btrim() 기본은 일반 space만 제거해, 탭·개행만 채운 값이 길이 검사를 통과한다.
-- 서버 액션은 JS trim()으로 막지만, PostgREST 직접 insert는 DB가 최종 방어선이라 같은 불변식을 건다.

alter table public.new_family_registrations
  drop constraint new_family_name_len,
  drop constraint new_family_phone_len,
  add constraint new_family_name_len
    check (char_length(btrim(name, E' \t\n\r')) between 1 and 50),
  add constraint new_family_phone_len
    check (char_length(btrim(phone, E' \t\n\r')) between 8 and 30);
