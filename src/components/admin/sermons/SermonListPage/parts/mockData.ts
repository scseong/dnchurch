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
