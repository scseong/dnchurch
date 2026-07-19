import { readFileSync } from 'node:fs';
import { ImageResponse } from 'next/og';
import {
  parsePeriod,
  parseCount,
  subLine,
  PERIOD_LABEL,
  CHAPTERS_MAX,
  SECONDARY_MAX,
  SHARE_BRAND,
  SHARE_EYEBROW_SUFFIX,
  SHARE_STAT_SUFFIX,
  SHARE_VERSE,
  SHARE_VERSE_REF
} from '@/utils/bible-share';

// 카카오 카드·og:image가 가져가는 통계 시각 카드(PNG). 통계를 URL 파라미터로 받아 즉석 생성한다.
// 저장소를 쓰지 않고 요청 시 생성하며 Cache-Control로 URL 단위 CDN 캐시가 걸린다.
// 폰트는 로컬 서브셋 ttf(bible-share 어휘로 1회 생성) — nodejs 런타임이라 readFileSync가 된다.
export const runtime = 'nodejs';

// Satori는 SCSS 토큰을 못 읽어 리터럴 색을 쓴다. 화면 공유 카드(tracker share_card)와 같은 값:
// $primary=#5a3f2e, $accent=#93702e, eyebrow $accent-subtle=#f5ead6, 다크 보조 rgba(255,255,255,0.6).
const GRADIENT = 'linear-gradient(150deg, #5a3f2e, #93702e)';
const DARK_MUTED = 'rgba(255, 255, 255, 0.6)';

// 모듈 스코프에서 1회 읽어 캐시. new URL(..., import.meta.url)이라 Next 파일 트레이싱이 잡는다.
const font400 = readFileSync(new URL('./NotoSerifKR-400.ttf', import.meta.url));
const font700 = readFileSync(new URL('./NotoSerifKR-700.ttf', import.meta.url));

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = parsePeriod(searchParams.get('p') ?? undefined);
  const chapters = parseCount(searchParams.get('c') ?? undefined, CHAPTERS_MAX);
  const secondary = parseCount(searchParams.get('s') ?? undefined, SECONDARY_MAX);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          backgroundColor: '#5a3f2e',
          backgroundImage: GRADIENT,
          color: '#fff',
          fontFamily: 'Noto Serif KR'
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 700 }}>{SHARE_BRAND}</div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#f5ead6'
          }}
        >
          {`${PERIOD_LABEL[period]} ${SHARE_EYEBROW_SUFFIX}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 8 }}>
          <div style={{ display: 'flex', fontSize: 120, fontWeight: 700, lineHeight: 1 }}>
            {chapters}
          </div>
          <div
            style={{
              display: 'flex',
              marginLeft: 8,
              marginBottom: 16,
              fontSize: 34,
              fontWeight: 700
            }}
          >
            {SHARE_STAT_SUFFIX}
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: 12, fontSize: 24, color: DARK_MUTED }}>
          {subLine(period, secondary)}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 28,
            paddingTop: 24,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div style={{ display: 'flex', fontSize: 26 }}>{`“${SHARE_VERSE}”`}</div>
          <div style={{ display: 'flex', marginTop: 8, fontSize: 16, color: DARK_MUTED }}>
            {SHARE_VERSE_REF}
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 400,
      fonts: [
        { name: 'Noto Serif KR', data: font400, weight: 400, style: 'normal' },
        { name: 'Noto Serif KR', data: font700, weight: 700, style: 'normal' }
      ],
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  );
}
