'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type CardVariant = 'default' | 'elevated' | 'ghost' | 'glass'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 卡片变体 */
  variant?: CardVariant
  /** 是否可交互（悬停效果） */
  isInteractive?: boolean
  /** 是否选中 */
  isSelected?: boolean
  /** 内边距尺寸 */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 标题 */
  title?: ReactNode
  /** 副标题/描述 */
  description?: ReactNode
  /** 右侧操作区 */
  action?: ReactNode
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

// ============================================
// 样式配置
// ============================================

const variants: Record<CardVariant, string> = {
  default: 'bg-surface-800 border border-surface-600',
  elevated: 'bg-surface-800 border border-surface-600 shadow-elevated',
  ghost: 'bg-transparent',
  glass: 'glass',
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

// ============================================
// Card 主组件
// ============================================

/**
 * Card 卡片组件
 *
 * @example
 * // 基础用法
 * <Card>
 *   <CardHeader title="项目设置" />
 *   <CardContent>内容区域</CardContent>
 * </Card>
 *
 * // 可交互卡片
 * <Card isInteractive onClick={handleClick}>
 *   ...
 * </Card>
 *
 * // 玻璃效果
 * <Card variant="glass">
 *   ...
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      isInteractive = false,
      isSelected = false,
      padding = 'none',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // 基础样式
          'rounded-xl',
          'overflow-hidden',
          // 变体
          variants[variant],
          // 内边距
          paddings[padding],
          // 交互效果
          isInteractive && [
            'cursor-pointer',
            'transition-all duration-200 ease-out',
            'hover:border-surface-500',
            'hover:shadow-lg',
            'active:scale-[0.99]',
          ],
          // 选中状态
          isSelected && [
            'border-amber-400/50',
            'shadow-glow-amber',
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// ============================================
// CardHeader 组件
// ============================================

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4',
          'px-4 py-3',
          'border-b border-surface-600',
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-base font-semibold text-surface-100 truncate">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-surface-400 line-clamp-2">
              {description}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// ============================================
// CardContent 组件
// ============================================

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-4', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

// ============================================
// CardFooter 组件
// ============================================

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3',
          'px-4 py-3',
          'border-t border-surface-600',
          'bg-surface-900/50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

// ============================================
// 导出
// ============================================

export default Card












