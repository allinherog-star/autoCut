import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 启用严格模式
  reactStrictMode: true,

  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // FFmpeg.wasm 需要 SharedArrayBuffer，设置必要的 HTTP headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]
  },
}

export default nextConfig


