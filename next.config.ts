import type { NextConfig } from 'next';

// @next/bundle-analyzer는 CommonJS 모듈로 export 되어 있어 require 사용. Next.js 공식 예제도 같은 패턴.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

const nextConfig: NextConfig = {
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
      bodySizeLimit: '5mb'
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
