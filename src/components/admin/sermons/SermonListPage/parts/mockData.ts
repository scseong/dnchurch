export interface MockPreacher {
  id: string;
  name: string;
  count: number;
}

export interface MockSeries {
  id: string;
  title: string;
  year: number;
  count: number;
}

export const NONE_SERIES_ID = '__none';

export const MOCK_PREACHERS: MockPreacher[] = [
  { id: 'p1', name: '김은혜 목사', count: 14 },
  { id: 'p2', name: '박성민 목사', count: 15 },
  { id: 'p3', name: '이주영 전도사', count: 13 }
];

export const MOCK_SERIES: MockSeries[] = [
  { id: 's1', title: '마가복음 강해', year: 2026, count: 12 },
  { id: 's2', title: '산상수훈', year: 2026, count: 5 },
  { id: 's3', title: '시편 묵상', year: 2025, count: 8 },
  { id: 's4', title: '로마서 깊이 읽기', year: 2025, count: 16 },
  { id: 's5', title: '창세기 여정', year: 2025, count: 20 },
  { id: 's6', title: '사도행전과 초대교회', year: 2024, count: 14 }
];

export type SermonRowStatus = 'published' | 'draft' | 'scheduled';

export const SERMON_STATUS_LABEL: Record<SermonRowStatus, string> = {
  published: '발행',
  draft: '초안',
  scheduled: '예약'
};

export interface SermonRow {
  id: number;
  title: string;
  slug: string;
  date: string;
  preacher: { name: string };
  series?: { title: string };
  duration?: string;
  scripture: string | null;
  status: SermonRowStatus;
  updatedAt: string;
}

export const MOCK_ROWS: SermonRow[] = [
  {
    id: 1,
    title: '광야에서의 부르심',
    slug: 'wilderness-calling',
    date: '2026-03-29',
    preacher: { name: '김은혜 목사' },
    series: { title: '마가복음 강해' },
    duration: '38:42',
    scripture: '마가복음 1:9-13',
    status: 'published',
    updatedAt: '2026-04-27T05:50:00Z'
  },
  {
    id: 2,
    title: '하나님 나라의 비유',
    slug: 'kingdom-parables',
    date: '2026-03-22',
    preacher: { name: '박성민 목사' },
    series: { title: '마가복음 강해' },
    duration: '42:15',
    scripture: '마가복음 4:26-34',
    status: 'published',
    updatedAt: '2026-04-25T11:00:00Z'
  },
  {
    id: 3,
    title: '복 있는 사람',
    slug: 'blessed-life',
    date: '2026-04-05',
    preacher: { name: '이주영 전도사' },
    duration: '35:08',
    scripture: null,
    status: 'draft',
    updatedAt: '2026-04-26T03:20:00Z'
  },
  {
    id: 4,
    title: '부활의 증인',
    slug: 'witnesses-of-resurrection',
    date: '2026-05-03',
    preacher: { name: '김은혜 목사' },
    series: { title: '사도행전과 초대교회' },
    duration: '40:30',
    scripture: '사도행전 1:1-11',
    status: 'scheduled',
    updatedAt: '2026-04-20T08:00:00Z'
  },
  {
    id: 5,
    title: '시편 23편 묵상',
    slug: 'psalm-23-meditation',
    date: '2025-12-14',
    preacher: { name: '박성민 목사' },
    series: { title: '시편 묵상' },
    duration: '29:54',
    scripture: '시편 23:1-6',
    status: 'published',
    updatedAt: '2026-03-15T10:00:00Z'
  }
];
