'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** 方向 */
  orientation?: 'horizontal' | 'vertical'
  /** 标签文字 */
  label?: string
  /** 标签位置 */
  labelPosition?: 'left' | 'center' | 'right'
}

// ============================================
// 组件实现
// ============================================

/**
 * Divider 分割线组件
 *
 * @example
 * // 水平分割线
 * <Divider />
 *
 * // 带标签
 * <Divider label="或者" />
 *
 * // 垂直分割线
 * <Divider orientation="vertical" className="h-6" />
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className,
      orientation = 'horizontal',
      label,
      labelPosition = 'center',
      ...props
    },
    ref
  ) => {
    // 垂直分割线
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="vertical"
          className={cn(
            'w-px bg-surface-600',
            'self-stretch',
            className
          )}
          {...props}
        />
      )
    }

    // 无标签的水平分割线
    if (!label) {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={cn(
            'h-px w-full bg-surface-600',
            className
          )}
          {...props}
        />
      )
    }

    // 带标签的水平分割线
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          'flex items-center gap-3',
          'w-full',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-px bg-surface-600',
            labelPosition === 'left' && 'w-8',
            labelPosition === 'center' && 'flex-1',
            labelPosition === 'right' && 'flex-1'
          )}
        />
        <span className="text-sm text-surface-500 whitespace-nowrap">
          {label}
        </span>
        <div
          className={cn(
            'h-px bg-surface-600',
            labelPosition === 'left' && 'flex-1',
            labelPosition === 'center' && 'flex-1',
            labelPosition === 'right' && 'w-8'
          )}
        />
      </div>
    )
  }
)

Divider.displayName = 'Divider'

export default Divider
















