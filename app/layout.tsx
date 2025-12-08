import type { Metadata, Viewport } from 'next'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

/**
 * 网站元数据
 */
export const metadata: Metadata = {
  title: {
    default: 'AutoCut - AI 智能视频剪辑',
    template: '%s | AutoCut',
  },
  description:
    '一键成片的 AI 视频剪辑工具，从素材上传到爆款视频，全程智能引导，让每个人都能轻松创作专业视频。',
  keywords: ['视频剪辑', 'AI', '一键成片', '智能剪辑', '视频编辑', '内容创作'],
  authors: [{ name: 'AutoCut Team' }],
  creator: 'AutoCut',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

/**
 * 视口配置
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
}

/**
 * 根布局组件
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <head>
        {/* 预连接字体服务 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="min-h-screen bg-surface-950 text-surface-100 antialiased"
        suppressHydrationWarning
      >
        <TooltipProvider>
          {/* 背景装饰 */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* 网格背景 */}
            <div className="absolute inset-0 bg-grid opacity-50" />
            {/* 渐变光晕 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-400/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl" />
          </div>

          {/* 主内容 */}
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}







