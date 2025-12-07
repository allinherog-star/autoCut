'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'default' | 'primary' | 'white'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** 尺寸 */
  size?: SpinnerSize
  /** 变体 */
  variant?: SpinnerVariant
  /** 加载文字 */
  label?: string
}

// ============================================
// 样式配置
// ============================================

const sizes: Record<SpinnerSize, { spinner: string; text: string }> = {
  xs: { spinner: 'w-3 h-3 border', text: 'text-xs' },
  sm: { spinner: 'w-4 h-4 border-2', text: 'text-xs' },
  md: { spinner: 'w-6 h-6 border-2', text: 'text-sm' },
  lg: { spinner: 'w-8 h-8 border-2', text: 'text-base' },
  xl: { spinner: 'w-12 h-12 border-3', text: 'text-lg' },
}

const variants: Record<SpinnerVariant, string> = {
  default: 'border-surface-600 border-t-surface-300',
  primary: 'border-amber-400/30 border-t-amber-400',
  white: 'border-white/30 border-t-white',
}

// ============================================
// 组件实现
// ============================================

/**
 * Spinner 加载指示器组件
 *
 * @example
 * // 基础用法
 * <Spinner />
 *
 * // 不同尺寸
 * <Spinner size="lg" />
 *
 * // 带标签
 * <Spinner label="加载中..." />
 *
 * // 主色调
 * <Spinner variant="primary" />
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      label,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label || '加载中'}
        className={cn(
          'inline-flex flex-col items-center gap-2',
          className
        )}
        {...props}
      >
        {/* 旋转圆环 */}
        <div
          className={cn(
            'rounded-full animate-spin',
            sizes[size].spinner,
            variants[variant]
          )}
        />

        {/* 加载文字 */}
        {label && (
          <span
            className={cn(
              'text-surface-400',
              sizes[size].text
            )}
          >
            {label}
          </span>
        )}

        {/* 屏幕阅读器文字 */}
        <span className="sr-only">{label || '加载中'}</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

// ============================================
// 全屏加载组件
// ============================================

interface FullPageSpinnerProps {
  /** 加载文字 */
  label?: string
  /** 是否显示背景遮罩 */
  overlay?: boolean
}

/**
 * FullPageSpinner 全屏加载组件
 *
 * @example
 * <FullPageSpinner label="正在处理视频..." />
 */
export function FullPageSpinner({ label, overlay = true }: FullPageSpinnerProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        overlay && 'bg-surface-950/80 backdrop-blur-sm'
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant="primary" />
        {label && (
          <p className="text-surface-300 text-lg font-medium">{label}</p>
        )}
      </div>
    </div>
  )
}

export default Spinner



