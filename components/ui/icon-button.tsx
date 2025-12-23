'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ============================================
// 类型定义
// ============================================

export type IconButtonVariant = 'default' | 'ghost' | 'outline' | 'primary'
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: IconButtonVariant
  /** 按钮尺寸 */
  size?: IconButtonSize
  /** 是否加载中 */
  isLoading?: boolean
  /** 图标 */
  icon?: ReactNode
  /** 无障碍标签 */
  'aria-label': string
}

// ============================================
// 样式配置
// ============================================

const variants: Record<IconButtonVariant, string> = {
  default: `
    bg-surface-700 text-surface-300
    hover:bg-surface-600 hover:text-surface-100
    active:bg-surface-800
  `,
  ghost: `
    bg-transparent text-surface-400
    hover:bg-surface-700 hover:text-surface-200
    active:bg-surface-800
  `,
  outline: `
    bg-transparent text-surface-300
    border border-surface-600
    hover:bg-surface-700 hover:border-surface-500
    active:bg-surface-800
  `,
  primary: `
    bg-amber-400/20 text-amber-400
    hover:bg-amber-400/30
    active:bg-amber-400/40
  `,
}

const sizes: Record<IconButtonSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
}

const iconSizes: Record<IconButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

// ============================================
// 组件实现
// ============================================

/**
 * IconButton 图标按钮组件
 *
 * @example
 * <IconButton
 *   icon={<Settings />}
 *   aria-label="设置"
 *   variant="ghost"
 * />
 *
 * <IconButton
 *   icon={<Play />}
 *   aria-label="播放"
 *   variant="primary"
 *   size="lg"
 * />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      icon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // 基础样式
          'inline-flex items-center justify-center',
          'rounded-lg',
          'transition-all duration-150 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50',
          // 变体
          variants[variant],
          // 尺寸
          sizes[size],
          // 禁用状态
          isDisabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn('animate-spin', iconSizes[size])} />
        ) : (
          <span className={iconSizes[size]}>{icon || children}</span>
        )}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton























