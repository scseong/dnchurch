import 'server-only';

import { getDeptDistrictOptions } from '@/apis/reference';

// 프로필 편집의 부서·구역 드롭다운 소스 — app은 이 service만 거친다(apis 직접 import 금지).
export const getProfileOrgOptions = () => getDeptDistrictOptions();
