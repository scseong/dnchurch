import 'server-only';

import { getBibleReadingRecords, getBibleReadingSettings } from '@/apis/bible-reading';
import { kstToday, type ReadingRecord, type BibleReadingSettings } from '@/utils/bible-tracker';

type BibleTrackerData = {
  records: ReadingRecord[];
  settings: BibleReadingSettings;
  today: string;
};

// 초기 로드: 사용자 기록 전체(작은 컬럼)와 설정을 한 번에 받아 클라이언트에서 파생한다 (D4).
export async function getBibleTrackerData(userId: string): Promise<BibleTrackerData> {
  const [records, settings] = await Promise.all([
    getBibleReadingRecords(userId),
    getBibleReadingSettings(userId)
  ]);
  return { records, settings, today: kstToday() };
}
