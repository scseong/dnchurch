import type { Tables } from '@/types/database.types';
import type { Preacher, SermonSeries } from '@/types/sermon';

export type SermonStatusTab = 'all' | 'published' | 'draft' | 'scheduled';
export type SermonStatus = 'published' | 'draft' | 'scheduled';

export const SERMON_STATUS_LABEL: Record<SermonStatus, string> = {
  published: '발행',
  draft: '초안',
  scheduled: '예약'
};

export type AdminSermon = Tables<'sermons'> & {
  preacher: Pick<Preacher, 'id' | 'name'>;
  sermon_series: Pick<SermonSeries, 'id' | 'title'> | null;
};

const PREACHER_REF: Record<string, Pick<Preacher, 'id' | 'name'>> = {
  p1: { id: 'p1', name: '김은혜 목사' },
  p2: { id: 'p2', name: '박성민 목사' },
  p3: { id: 'p3', name: '이주영 전도사' }
};

const SERIES_REF: Record<string, Pick<SermonSeries, 'id' | 'title'>> = {
  s1: { id: 's1', title: '마가복음 강해' },
  s2: { id: 's2', title: '산상수훈' },
  s3: { id: 's3', title: '시편 묵상' },
  s4: { id: 's4', title: '로마서 깊이 읽기' },
  s5: { id: 's5', title: '창세기 여정' },
  s6: { id: 's6', title: '사도행전과 초대교회' }
};

interface MockSpec {
  title: string;
  date: string;
  preacherId: keyof typeof PREACHER_REF;
  seriesId: keyof typeof SERIES_REF | null;
  scripture?: string | null;
  videoId?: string | null;
  isPublished?: boolean;
  viewCount?: number;
  durationSeconds?: number;
  updatedAt?: string;
  createdAt?: string;
}

let nextId = 1;
function build(spec: MockSpec): AdminSermon {
  const id = nextId++;
  const slugBase = spec.title
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9가-힣-]/g, '')
    .toLowerCase();
  return {
    id,
    slug: `${slugBase}-${id}`,
    title: spec.title,
    sermon_date: spec.date,
    preacher_id: spec.preacherId,
    series_id: spec.seriesId,
    series_order: null,
    scripture: spec.scripture ?? null,
    scripture_text: null,
    summary: null,
    duration: spec.durationSeconds ? `00:${String(Math.floor(spec.durationSeconds / 60)).padStart(2, '0')}:${String(spec.durationSeconds % 60).padStart(2, '0')}` : null,
    service_type: '주일오전예배',
    video_id: spec.videoId === undefined ? `vid_${id}` : spec.videoId,
    video_provider: 'youtube',
    thumbnail_url: null,
    is_published: spec.isPublished ?? true,
    view_count: spec.viewCount ?? 0,
    updated_at: spec.updatedAt ?? '2026-04-20T00:00:00Z',
    created_at: spec.createdAt ?? '2024-01-01T00:00:00Z',
    deleted_at: null,
    preacher: PREACHER_REF[spec.preacherId],
    sermon_series: spec.seriesId ? SERIES_REF[spec.seriesId] : null
  };
}

const RAW: MockSpec[] = [
  // 2026 - 마가복음 강해 시리즈 (s1) - 김은혜 (p1)
  { title: '광야에서의 부르심', date: '2026-04-19', preacherId: 'p1', seriesId: 's1', scripture: '마가복음 1:9-13', viewCount: 412, updatedAt: '2026-04-21T05:50:00Z' },
  { title: '하나님 나라의 비유', date: '2026-04-12', preacherId: 'p1', seriesId: 's1', scripture: '마가복음 4:26-34', viewCount: 367, updatedAt: '2026-04-15T11:00:00Z' },
  { title: '풍랑을 잠재우신 예수', date: '2026-04-05', preacherId: 'p1', seriesId: 's1', scripture: '마가복음 4:35-41', viewCount: 298, updatedAt: '2026-04-07T09:30:00Z' },
  { title: '오천 명을 먹이심', date: '2026-03-29', preacherId: 'p1', seriesId: 's1', scripture: '마가복음 6:30-44', viewCount: 521, updatedAt: '2026-04-01T08:00:00Z' },
  { title: '베드로의 신앙고백', date: '2026-03-22', preacherId: 'p1', seriesId: 's1', scripture: '마가복음 8:27-30', viewCount: 488, updatedAt: '2026-03-24T14:00:00Z' },
  { title: '변화산의 영광', date: '2026-03-15', preacherId: 'p1', seriesId: 's1', scripture: '마가복음 9:2-13', viewCount: 333, updatedAt: '2026-03-17T10:00:00Z' },

  // 2026 - 산상수훈 (s2) - 박성민 (p2)
  { title: '심령이 가난한 자의 복', date: '2026-04-26', preacherId: 'p2', seriesId: 's2', scripture: '마태복음 5:3-6', viewCount: 256, updatedAt: '2026-04-27T07:00:00Z' },
  { title: '소금과 빛으로 부름받음', date: '2026-04-19', preacherId: 'p2', seriesId: 's2', scripture: '마태복음 5:13-16', viewCount: 312, updatedAt: '2026-04-20T08:00:00Z' },
  { title: '구하라 찾으라 두드리라', date: '2026-04-12', preacherId: 'p2', seriesId: 's2', scripture: '마태복음 7:7-12', viewCount: 401, updatedAt: '2026-04-14T09:00:00Z' },

  // 2026 - 단독 설교(시리즈 없음) - 이주영 (p3)
  { title: '부활절 새벽의 빛', date: '2026-04-05', preacherId: 'p3', seriesId: null, scripture: '요한복음 20:1-10', viewCount: 689, updatedAt: '2026-04-06T22:00:00Z' },
  { title: '종려주일의 환호', date: '2026-03-29', preacherId: 'p3', seriesId: null, scripture: '마태복음 21:1-11', viewCount: 234, updatedAt: '2026-03-30T15:00:00Z' },

  // 미래 발행 예정 - scheduled
  { title: '오순절 성령강림', date: '2026-05-24', preacherId: 'p1', seriesId: null, scripture: '사도행전 2:1-13', viewCount: 0, updatedAt: '2026-04-25T10:00:00Z' },
  { title: '교회 창립 기념 설교', date: '2026-06-07', preacherId: 'p2', seriesId: null, scripture: '에베소서 2:19-22', viewCount: 0, updatedAt: '2026-04-22T16:00:00Z' },

  // draft (미발행)
  { title: '맥추절 감사', date: '2026-07-05', preacherId: 'p1', seriesId: null, scripture: null, isPublished: false, videoId: null, viewCount: 0, updatedAt: '2026-04-28T11:00:00Z' },
  { title: '여름수련회 메시지', date: '2026-08-02', preacherId: 'p3', seriesId: null, scripture: null, isPublished: false, videoId: null, viewCount: 0, updatedAt: '2026-04-26T17:00:00Z' },

  // 2025 - 시편 묵상 (s3) - 박성민 (p2)
  { title: '시편 1편 - 복 있는 사람', date: '2025-12-28', preacherId: 'p2', seriesId: 's3', scripture: '시편 1:1-6', viewCount: 712, updatedAt: '2026-01-05T08:00:00Z' },
  { title: '시편 23편 - 여호와는 나의 목자', date: '2025-12-14', preacherId: 'p2', seriesId: 's3', scripture: '시편 23:1-6', viewCount: 1024, updatedAt: '2025-12-20T10:00:00Z' },
  { title: '시편 51편 - 회개의 기도', date: '2025-11-30', preacherId: 'p2', seriesId: 's3', scripture: '시편 51:1-12', viewCount: 588, updatedAt: '2025-12-05T11:00:00Z' },
  { title: '시편 100편 - 감사의 노래', date: '2025-11-16', preacherId: 'p2', seriesId: 's3', scripture: '시편 100:1-5', viewCount: 432, updatedAt: '2025-11-20T14:00:00Z' },
  { title: '시편 121편 - 도움이 어디서 올까', date: '2025-11-02', preacherId: 'p2', seriesId: 's3', scripture: '시편 121:1-8', viewCount: 367, updatedAt: '2025-11-08T09:00:00Z' },

  // 2025 - 로마서 깊이 읽기 (s4) - 김은혜 (p1)
  { title: '복음의 능력', date: '2025-10-26', preacherId: 'p1', seriesId: 's4', scripture: '로마서 1:16-17', viewCount: 502, updatedAt: '2025-11-02T08:00:00Z' },
  { title: '믿음으로 의롭다 하심', date: '2025-10-19', preacherId: 'p1', seriesId: 's4', scripture: '로마서 3:21-26', viewCount: 478, updatedAt: '2025-10-25T10:00:00Z' },
  { title: '아브라함의 믿음', date: '2025-10-12', preacherId: 'p1', seriesId: 's4', scripture: '로마서 4:1-25', viewCount: 389, updatedAt: '2025-10-18T11:00:00Z' },
  { title: '그리스도와 함께 죽고 살리니', date: '2025-10-05', preacherId: 'p1', seriesId: 's4', scripture: '로마서 6:1-11', viewCount: 421, updatedAt: '2025-10-12T13:00:00Z' },
  { title: '성령의 인도하심', date: '2025-09-28', preacherId: 'p1', seriesId: 's4', scripture: '로마서 8:1-17', viewCount: 567, updatedAt: '2025-10-05T09:00:00Z' },
  { title: '하나님의 사랑에서 끊을 수 없음', date: '2025-09-21', preacherId: 'p1', seriesId: 's4', scripture: '로마서 8:31-39', viewCount: 644, updatedAt: '2025-09-28T15:00:00Z' },

  // 2025 - 창세기 여정 (s5) - 이주영 (p3)
  { title: '태초에 하나님이', date: '2025-09-14', preacherId: 'p3', seriesId: 's5', scripture: '창세기 1:1-5', viewCount: 712, updatedAt: '2025-09-20T08:00:00Z' },
  { title: '하나님의 형상으로', date: '2025-09-07', preacherId: 'p3', seriesId: 's5', scripture: '창세기 1:26-31', viewCount: 567, updatedAt: '2025-09-14T11:00:00Z' },
  { title: '에덴에서의 타락', date: '2025-08-31', preacherId: 'p3', seriesId: 's5', scripture: '창세기 3:1-19', viewCount: 489, updatedAt: '2025-09-07T10:00:00Z' },
  { title: '노아와 무지개 언약', date: '2025-08-24', preacherId: 'p3', seriesId: 's5', scripture: '창세기 9:8-17', viewCount: 412, updatedAt: '2025-08-31T09:00:00Z' },
  { title: '아브람의 부르심', date: '2025-08-17', preacherId: 'p3', seriesId: 's5', scripture: '창세기 12:1-9', viewCount: 533, updatedAt: '2025-08-24T13:00:00Z' },
  { title: '이삭을 바치라', date: '2025-08-10', preacherId: 'p3', seriesId: 's5', scripture: '창세기 22:1-19', viewCount: 678, updatedAt: '2025-08-17T15:00:00Z' },
  { title: '야곱의 사다리', date: '2025-08-03', preacherId: 'p3', seriesId: 's5', scripture: '창세기 28:10-22', viewCount: 421, updatedAt: '2025-08-10T11:00:00Z' },

  // 2024 - 사도행전과 초대교회 (s6) - 박성민 (p2)
  { title: '예루살렘에서 시작된 교회', date: '2024-12-29', preacherId: 'p2', seriesId: 's6', scripture: '사도행전 2:42-47', viewCount: 891, updatedAt: '2025-01-05T10:00:00Z' },
  { title: '베드로와 요한의 담대함', date: '2024-12-22', preacherId: 'p2', seriesId: 's6', scripture: '사도행전 4:1-22', viewCount: 654, updatedAt: '2024-12-29T08:00:00Z' },
  { title: '스데반의 순교', date: '2024-12-15', preacherId: 'p2', seriesId: 's6', scripture: '사도행전 7:54-60', viewCount: 723, updatedAt: '2024-12-22T11:00:00Z' },
  { title: '사울의 회심', date: '2024-12-08', preacherId: 'p2', seriesId: 's6', scripture: '사도행전 9:1-22', viewCount: 812, updatedAt: '2024-12-15T13:00:00Z' },
  { title: '안디옥 교회의 부흥', date: '2024-11-24', preacherId: 'p2', seriesId: 's6', scripture: '사도행전 11:19-30', viewCount: 567, updatedAt: '2024-12-01T09:00:00Z' },

  // 2024 - 단독 설교 / 다양한 설교자
  { title: '추수감사절의 의미', date: '2024-11-17', preacherId: 'p1', seriesId: null, scripture: '데살로니가전서 5:16-18', viewCount: 487, updatedAt: '2024-11-24T10:00:00Z' },
  { title: '교회 창립 70주년 기념', date: '2024-10-13', preacherId: 'p2', seriesId: null, scripture: '에베소서 2:19-22', viewCount: 945, updatedAt: '2024-10-20T15:00:00Z' },
  { title: '종교개혁 주일', date: '2024-10-27', preacherId: 'p1', seriesId: null, scripture: '로마서 1:16-17', viewCount: 412, updatedAt: '2024-11-03T11:00:00Z' },
  { title: '여름성경학교 헌신예배', date: '2024-07-21', preacherId: 'p3', seriesId: null, scripture: '신명기 6:4-9', videoId: null, viewCount: 234, updatedAt: '2024-07-28T14:00:00Z' },
  { title: '맥추감사주일', date: '2024-07-07', preacherId: 'p1', seriesId: null, scripture: '신명기 16:9-12', viewCount: 312, updatedAt: '2024-07-14T10:00:00Z' },

  // 2024 초반 — 오래된 기록
  { title: '사순절 묵상', date: '2024-03-17', preacherId: 'p1', seriesId: null, scripture: '이사야 53:1-12', viewCount: 678, updatedAt: '2024-03-24T09:00:00Z' },
  { title: '고난주간 특별집회', date: '2024-03-31', preacherId: 'p2', seriesId: null, scripture: '누가복음 23:33-46', viewCount: 821, updatedAt: '2024-04-07T11:00:00Z' },
  { title: '부활주일 연합예배', date: '2024-04-07', preacherId: 'p1', seriesId: null, scripture: '마태복음 28:1-10', viewCount: 1124, updatedAt: '2024-04-14T13:00:00Z' },
  { title: '신년감사예배', date: '2024-01-07', preacherId: 'p1', seriesId: null, scripture: '예레미야 29:11-13', videoId: null, viewCount: 967, updatedAt: '2024-01-14T08:00:00Z' }
];

export const MOCK_ADMIN_SERMONS: AdminSermon[] = RAW.map(build);

export function deriveSermonStatus(
  sermon: Pick<AdminSermon, 'is_published' | 'sermon_date'>,
  now: Date = new Date()
): SermonStatus {
  if (!sermon.is_published) return 'draft';
  if (new Date(sermon.sermon_date) > now) return 'scheduled';
  return 'published';
}
