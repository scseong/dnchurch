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
    additionalData: `@use "@/app/styles/_variables.scss" as *;\n@use "@/app/styles/_mixins.scss" as *;\n`,
    silenceDeprecations: ['legacy-js-api'],
    quietDeps: true
  }
};

export default nextConfig;
