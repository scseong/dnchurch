-- One-off cleanup SQL: dev DB seed truncate (cloudinary-asset-structure refactor)
--
-- ⚠️ 운영 환경에서 절대 실행하지 말 것 — 이 스크립트는 dnchurch-dev (mficogrxekuahjqborxw) 시드 정리용.
-- ⚠️ versioned migration에 포함하지 않음 — replay 시 다른 환경 데이터 삭제 위험.
--
-- 실행 이력:
-- - 2026-05-11: dev (mficogrxekuahjqborxw)에 Supabase MCP `apply_migration`으로 적용됨.
--               당시 11 rows의 bulletin_images가 모두 legacy 폴더 또는 환경 prefix 포함 cloudinary_id를 참조하여 신 컨벤션과 불일치.
--               사용자가 시드 데이터로 확정 후 truncate 결정.
--
-- 신 컨벤션 (ADR 0007):
-- - DB cloudinary_id는 ROOT-relative (`uploads/bulletins/{YYYY}/{MM}/{DD}/...`)
-- - 환경 prefix는 코드 헬퍼(`getCloudinaryUrl`, `createCloudinaryLoader`)에서 합성

TRUNCATE bulletin_images, bulletins RESTART IDENTITY CASCADE;
