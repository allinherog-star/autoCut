'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type ProgressVariant = 'default' | 'primary' | 'success' | 'warning' | 'error'
export type ProgressSize = 'sm' | 'md' | 'lg'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 当前值 (0-100) */
  value?: number
  /** 最大值 */
  max?: number
  /** 进度条变体 */
  variant?: ProgressVariant
  /** 进度条尺寸 */
  size?: ProgressSize
  /** 是否显示标签 */
  showLabel?: boolean
  /** 自定义标签文字 */
  label?: string
  /** 是否为不确定状态（持续动画） */
  isIndeterminate?: boolean
  /** 是否显示条纹动画 */
  striped?: boolean
}

// ============================================
// 样式配置
// ============================================

const trackVariants: Record<ProgressVariant, string> = {
  default: 'bg-surface-700',
  primary: 'bg-amber-400/20',
  success: 'bg-success/20',
  warning: 'bg-warning/20',
  error: 'bg-error/20',
}

const indicatorVariants: Record<ProgressVariant, string> = {
  default: 'bg-surface-400',
  primary: 'bg-amber-400',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
}

const sizes: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

// ============================================
// 组件实现
// ============================================

/**
 * Progress 进度条组件
 *
 * @example
 * // 基础用法
 * <Progress value={60} />
 *
 * // 显示标签
 * <Progress value={75} showLabel />
 *
 * // 不确定状态
 * <Progress isIndeterminate variant="primary" />
 *
 * // 自定义标签
 * <Progress value={45} label="上传中 45%" showLabel />
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = 'primary',
      size = 'md',
      showLabel = false,
      label,
      isIndeterminate = false,
      striped = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* 标签 */}
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-surface-300">
              {label || '进度'}
            </span>
            {!isIndeterminate && (
              <span className="text-sm font-mono text-surface-400">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* 进度条 */}
        <ProgressPrimitive.Root
          className={cn(
            'relative overflow-hidden rounded-full',
            trackVariants[variant],
            sizes[size]
          )}
          value={isIndeterminate ? undefined : percentage}
          max={100}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full rounded-full',
              'transition-transform duration-300 ease-out',
              indicatorVariants[variant],
              // 条纹效果
              striped && [
                'bg-gradient-to-r',
                'from-transparent via-white/20 to-transparent',
                'bg-[length:20px_100%]',
                'animate-[shimmer_1s_linear_infinite]',
              ],
              // 不确定状态动画
              isIndeterminate && [
                'w-1/3',
                'animate-progress-indeterminate',
              ]
            )}
            style={{
              transform: isIndeterminate
                ? undefined
                : `translateX(-${100 - percentage}%)`,
            }}
          />
        </ProgressPrimitive.Root>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

// ============================================
// 圆形进度条
// ============================================

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 当前值 (0-100) */
  value?: number
  /** 进度条尺寸 */
  size?: number
  /** 线条宽度 */
  strokeWidth?: number
  /** 进度条变体 */
  variant?: ProgressVariant
  /** 是否显示百分比 */
  showValue?: boolean
  /** 是否为不确定状态 */
  isIndeterminate?: boolean
}

const circularVariants: Record<ProgressVariant, string> = {
  default: 'stroke-surface-400',
  primary: 'stroke-amber-400',
  success: 'stroke-success',
  warning: 'stroke-warning',
  error: 'stroke-error',
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      className,
      value = 0,
      size = 48,
      strokeWidth = 4,
      variant = 'primary',
      showValue = false,
      isIndeterminate = false,
      ...props
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const percentage = Math.min(Math.max(value, 0), 100)
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <svg
          className={cn(
            'transform -rotate-90',
            isIndeterminate && 'animate-spin-slow'
          )}
          width={size}
          height={size}
        >
          {/* 背景圆环 */}
          <circle
            className="stroke-surface-700"
            fill="none"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* 进度圆环 */}
          <circle
            className={cn(
              'transition-all duration-300 ease-out',
              circularVariants[variant]
            )}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={isIndeterminate ? circumference * 0.75 : offset}
          />
        </svg>

        {/* 中心数值 */}
        {showValue && !isIndeterminate && (
          <span className="absolute text-xs font-medium font-mono text-surface-200">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'

// ============================================
// 导出
// ============================================

export default Progress



















