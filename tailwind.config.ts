import type { Config } from 'tailwindcss'

/**
 * AutoCut 设计系统 - Tailwind CSS 配置
 *
 * 设计理念：
 * - 深色主题为主，专业剪辑工具风格
 * - 琥珀金作为主色调，代表创意与高端
 * - 玻璃拟态与微妙渐变
 * - 流畅的动画过渡
 */

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ============================================
      // 🎨 色彩系统
      // ============================================
      colors: {
        // 主色 - 琥珀金（创意与高端）
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // 表面色 - 深色背景系统
        surface: {
          // 最深层背景
          950: '#09090b',
          // 主背景
          900: '#0c0c0f',
          // 卡片背景
          800: '#111114',
          // 悬停态背景
          700: '#18181b',
          // 边框/分割线
          600: '#27272a',
          // 禁用态背景
          500: '#3f3f46',
          // 次要文字
          400: '#71717a',
          // 主要文字
          300: '#a1a1aa',
          // 强调文字
          200: '#d4d4d8',
          // 高亮文字
          100: '#e4e4e7',
          50: '#fafafa',
        },
        // 功能色
        success: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
          dark: '#16a34a',
        },
        warning: {
          DEFAULT: '#eab308',
          light: '#facc15',
          dark: '#ca8a04',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
      },

      // ============================================
      // 🔤 字体系统
      // ============================================
      fontFamily: {
        // 显示字体 - 标题使用
        display: [
          'Satoshi',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        // 正文字体
        sans: [
          'DM Sans',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        // 等宽字体 - 时间码显示
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },

      // ============================================
      // 📏 尺寸与间距
      // ============================================
      spacing: {
        // 时间轴专用间距
        'timeline-track': '3.5rem',
        'timeline-ruler': '2rem',
        // 工具栏高度
        toolbar: '3.5rem',
        // 侧边栏宽度
        sidebar: '16rem',
        'sidebar-collapsed': '4rem',
      },

      // ============================================
      // 🎭 圆角系统
      // ============================================
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ============================================
      // 🌫️ 阴影系统
      // ============================================
      boxShadow: {
        // 玻璃效果阴影
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.3)',
        // 发光效果
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-amber-lg': '0 0 40px rgba(251, 191, 36, 0.4)',
        // 内阴影
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        // 浮层阴影
        elevated: '0 12px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
      },

      // ============================================
      // 💫 动画系统
      // ============================================
      animation: {
        // 淡入动画
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in-down': 'fade-in-down 0.4s ease-out',
        // 缩放动画
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-in-bounce': 'scale-in-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        // 滑入动画
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        // 脉冲效果
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        // 进度条动画
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
        // 闪烁（用于加载）
        shimmer: 'shimmer 2s linear infinite',
        // 旋转
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-in-bounce': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 191, 36, 0.5)' },
        },
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // ============================================
      // 🎬 过渡时间
      // ============================================
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ============================================
      // 📐 背景图案
      // ============================================
      backgroundImage: {
        // 网格背景
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        // 径向渐变
        'radial-glow': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        // 噪点纹理（需配合 CSS）
        noise: "url('/textures/noise.png')",
      },
      backgroundSize: {
        'grid-sm': '20px 20px',
        'grid-md': '40px 40px',
        'grid-lg': '60px 60px',
      },

      // ============================================
      // 🖼️ 模糊效果
      // ============================================
      backdropBlur: {
        xs: '2px',
      },

      // ============================================
      // 📱 容器断点
      // ============================================
      screens: {
        xs: '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}

export default config





