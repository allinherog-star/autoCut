'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 徽章变体 */
  variant?: BadgeVariant
  /** 徽章尺寸 */
  size?: BadgeSize
  /** 是否显示脉冲动画（用于状态指示） */
  pulse?: boolean
  /** 是否为点状徽章（无文字） */
  dot?: boolean
}

// ============================================
// 样式配置
// ============================================

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-700 text-surface-300 border-surface-600',
  primary: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
  success: 'bg-success/20 text-success-light border-success/30',
  warning: 'bg-warning/20 text-warning-light border-warning/30',
  error: 'bg-error/20 text-error-light border-error/30',
  info: 'bg-info/20 text-info-light border-info/30',
  outline: 'bg-transparent text-surface-300 border-surface-500',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
}

const dotSizes: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

// ============================================
// 组件实现
// ============================================

/**
 * Badge 徽章组件
 *
 * @example
 * // 基础用法
 * <Badge>默认</Badge>
 *
 * // 状态徽章
 * <Badge variant="success">已完成</Badge>
 * <Badge variant="warning">处理中</Badge>
 * <Badge variant="error">失败</Badge>
 *
 * // 带脉冲动画
 * <Badge variant="success" pulse>在线</Badge>
 *
 * // 点状徽章
 * <Badge variant="primary" dot />
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      pulse = false,
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    // 点状徽章
    if (dot) {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center',
            'rounded-full',
            'border',
            variants[variant],
            dotSizes[size],
            pulse && 'animate-pulse',
            className
          )}
          {...props}
        />
      )
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1',
          'font-medium',
          'rounded-full',
          'border',
          'whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {pulse && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              'animate-pulse',
              variant === 'success' && 'bg-success',
              variant === 'warning' && 'bg-warning',
              variant === 'error' && 'bg-error',
              variant === 'info' && 'bg-info',
              variant === 'primary' && 'bg-amber-400',
              variant === 'default' && 'bg-surface-400',
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// ============================================
// 导出
// ============================================

export default Badge












