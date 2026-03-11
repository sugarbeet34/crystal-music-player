import type { NextConfig } from 'next';

const BASE_PATH = '/crystal-music-player';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
};

export default nextConfig;
