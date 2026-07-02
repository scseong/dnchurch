import type { NextConfig } from 'next';

// @next/bundle-analyzer는 CommonJS 모듈로 export 되어 있어 require 사용. Next.js 공식 예제도 같은 패턴.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

// 레거시 설교 필터 URL(`/sermons?series=...` 등)을 `/sermons/all`로 보낸다.
// archive 뷰 이관(2026-05-14 sermons-featured) 후 페이지 안에 있던 redirect를 옮겨
// `/sermons`가 searchParams를 읽지 않고 완전 정적으로 렌더되게 한다.
// 키 목록은 src/utils/sermon.ts의 SERMON_FILTER_KEYS(series·preacher·q·year) + sort·page.
// 쿼리는 redirect 시 기본 보존되며, 목록에 없는 키(예: utm_*)만 붙은 URL은 redirect하지 않는다.
const SERMON_LEGACY_FILTER_KEYS = ['series', 'preacher', 'q', 'year', 'sort', 'page'];

const nextConfig: NextConfig = {
  async redirects() {
    return SERMON_LEGACY_FILTER_KEYS.map((key) => ({
      source: '/sermons',
      has: [{ type: 'query' as const, key }],
      destination: '/sermons/all',
      permanent: false
    }));
  },
  images: {
    loader: 'custom',
    loaderFile: './src/utils/cloudinary.ts',
    deviceSizes: [640, 750, 1080, 1440, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb'
    }
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  sassOptions: {
    additionalData: `@use "@/styles/_variables.scss" as *;\n@use "@/styles/_mixins.scss" as *;\n`,
    silenceDeprecations: ['legacy-js-api'],
    quietDeps: true
  }
};

export default withBundleAnalyzer(nextConfig);
