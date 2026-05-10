import 'server-only';

import { getSiteCollection } from '@/apis/site-collections';
import { getSiteSettings, type SiteSettings } from '@/apis/site-settings';
import { getActiveStaff } from '@/apis/staff';
import { getWorshipScheduleGroups } from '@/services/worship';
import type { FaqItem, GreetingParagraph, HistoryItem } from '@/types/about';
import type { StaffType, WorshipScheduleType } from '@/types/common';

// site_settings 키 모음 — 페이지별 fetch 범위
const HUB_SETTING_KEYS = [
  'church_address',
  'church_phone',
  'church_zipcode',
  'opening_hours_sunday',
  'directions_subway'
] as const;

const LOCATION_SETTING_KEYS = [
  'church_address',
  'church_lat',
  'church_lng',
  'church_phone',
  'church_email',
  'church_zipcode',
  'opening_hours_sunday',
  'opening_hours_weekday',
  'opening_hours_saturday',
  'parking_info_1',
  'parking_info_2',
  'directions_subway',
  'directions_bus_stop_1',
  'directions_bus_routes_1',
  'directions_bus_stop_2',
  'directions_bus_routes_2'
] as const;

const SENIOR_PASTOR_TITLE = '담임목사';

// staff에 role 컬럼이 없어 title 매칭. 다중 hit는 getActiveStaff가 order_index 정렬이라 첫 번째 우선.
const findSeniorPastor = (rows: StaffType[]): StaffType | null =>
  rows.find((row) => row.title === SENIOR_PASTOR_TITLE) ?? null;

// worshipService.list()는 handle-response.ts에서 Supabase error throw — silent wrap으로 정합 (ADR 0006 silent fallback 원칙).
const getWorshipGroupsSafe = async (): Promise<{
  sunday: WorshipScheduleType[];
  weekday: WorshipScheduleType[];
  school: WorshipScheduleType[];
}> => {
  try {
    return await getWorshipScheduleGroups();
  } catch {
    return { sunday: [], weekday: [], school: [] };
  }
};

type PastorData = {
  name: string;
  title: string;
  imageUrl: string | null;
  education: string[];
  experience: string[];
  greetingParagraphs: GreetingParagraph[];
};

const toPastorData = (row: StaffType | null): PastorData | null => {
  if (!row) return null;
  return {
    name: row.name,
    title: row.title,
    imageUrl: row.image_url,
    education: row.education ?? [],
    experience: row.experience ?? [],
    greetingParagraphs: (row.greeting_paragraphs ?? []) as GreetingParagraph[]
  };
};

// ─── 페이지별 fetch ────────────────────────────────────────────────────────

export const getHubPageData = async (): Promise<{
  history: HistoryItem[];
  settings: SiteSettings;
}> => {
  const [history, settings] = await Promise.all([
    getSiteCollection<HistoryItem>('church_history'),
    getSiteSettings([...HUB_SETTING_KEYS])
  ]);
  return { history, settings };
};

export const getPastorPageData = async (): Promise<{ pastor: PastorData | null }> => {
  const result = await getActiveStaff();
  const rows = (result.data ?? []) as StaffType[];
  return { pastor: toPastorData(findSeniorPastor(rows)) };
};

export const getWelcomePageData = async (): Promise<{ faq: FaqItem[] }> => {
  const faq = await getSiteCollection<FaqItem>('welcome_faq');
  return { faq };
};

export const getVisionPageData = async (): Promise<{ history: HistoryItem[] }> => {
  const history = await getSiteCollection<HistoryItem>('church_history');
  return { history };
};

export const getWorshipPageData = async () => {
  const groups = await getWorshipGroupsSafe();
  return { groups };
};

export const getLocationPageData = async () => {
  const [settings, worship] = await Promise.all([
    getSiteSettings([...LOCATION_SETTING_KEYS]),
    getWorshipGroupsSafe()
  ]);
  return { settings, worship };
};
