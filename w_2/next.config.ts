import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  // output: 'export', // 注释掉静态导出，API 路由需要服务器端渲染
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true // 禁用图片优化
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    return config;
  },

};

export default nextConfig;
