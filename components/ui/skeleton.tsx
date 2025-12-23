'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否为圆形 */
  circle?: boolean
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 是否禁用动画 */
  disableAnimation?: boolean
}

// ============================================
// 组件实现
// ============================================

/**
 * Skeleton 骨架屏组件
 *
 * @example
 * // 基础用法
 * <Skeleton className="h-4 w-32" />
 *
 * // 圆形头像
 * <Skeleton circle width={48} height={48} />
 *
 * // 组合使用
 * <div className="flex gap-3">
 *   <Skeleton circle width={40} height={40} />
 *   <div className="space-y-2">
 *     <Skeleton className="h-4 w-32" />
 *     <Skeleton className="h-3 w-24" />
 *   </div>
 * </div>
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      circle = false,
      width,
      height,
      disableAnimation = false,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'skeleton',
          circle ? 'rounded-full' : 'rounded-md',
          !disableAnimation && 'animate-pulse',
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// ============================================
// 预设骨架屏
// ============================================

/**
 * 文本行骨架屏
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

/**
 * 卡片骨架屏
 */
export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-4">
      {/* 缩略图 */}
      <Skeleton className="w-full aspect-video rounded-lg" />
      {/* 标题 */}
      <Skeleton className="h-5 w-3/4" />
      {/* 描述 */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      {/* 底部 */}
      <div className="flex items-center gap-2">
        <Skeleton circle width={24} height={24} />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

/**
 * 列表项骨架屏
 */
export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton circle width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-16 rounded-md" />
    </div>
  )
}

/**
 * 时间轴轨道骨架屏
 */
export function SkeletonTimelineTrack() {
  return (
    <div className="timeline-track flex items-center gap-1 p-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-full rounded-sm"
          style={{ width: `${Math.random() * 15 + 10}%` }}
        />
      ))}
    </div>
  )
}

export default Skeleton




















