import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/manuscript-editor' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/manuscript-editor' : '',
};

export default nextConfig;
