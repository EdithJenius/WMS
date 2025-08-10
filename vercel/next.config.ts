import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // trailingSlash: true, // 注释掉，避免URL重定向问题
  // distDir: 'out', // 注释掉，使用默认的 .next 目录
  images: {
    unoptimized: true // 禁用图片优化
  },
  // 移除有问题的webpack配置
};

export default nextConfig;
