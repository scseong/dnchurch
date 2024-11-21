import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  sassOptions: {
    additionalData: `@use "src/app/styles/_variables.scss" as *; @use "src/app/styles/_mixins.scss" as *;`,
    silenceDeprecations: ['legacy-js-api']
  }
};

export default nextConfig;
