import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TODO: 이미지 최적화
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
    additionalData: `@use "src/app/styles/_variables.scss" as *; @use "src/app/styles/_mixins.scss" as *;`,
    silenceDeprecations: ['legacy-js-api'],
    quietDeps: true
  }
};

export default nextConfig;
