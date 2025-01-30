import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
