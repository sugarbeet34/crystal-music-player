import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/crystal-music-player',
};

export default nextConfig;
