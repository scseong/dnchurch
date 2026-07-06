import 'server-only';

import { getSiteSettings } from '@/apis/site-settings';
import { displaySettingValue } from '@/utils/site-settings';

// admin이 site_settings에 verse_text·verse_reference를 채우기 전까지 보여줄 기본 말씀.
const VERSE_TEXT_FALLBACK = '수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라';
const VERSE_REFERENCE_FALLBACK = '마태복음 11:28';

/** 홈 "오늘의 말씀" — site_settings 키를 읽고 미설정 시 기본 말씀으로 폴백. */
export const getTodayVerse = async () => {
  const settings = await getSiteSettings(['verse_text', 'verse_reference']);

  return {
    text: displaySettingValue(settings.verse_text, VERSE_TEXT_FALLBACK),
    reference: displaySettingValue(settings.verse_reference, VERSE_REFERENCE_FALLBACK)
  };
};
