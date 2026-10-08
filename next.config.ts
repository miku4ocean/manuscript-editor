import type { NextConfig } from "next";

// GitHub Pages 子路徑部署用 /manuscript-editor；Cloudflare Pages（網域根目錄）設 DEPLOY_TARGET=cloudflare 則不加 basePath
const basePath =
  process.env.DEPLOY_TARGET === 'cloudflare' || process.env.NODE_ENV !== 'production'
    ? ''
    : '/manuscript-editor';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
