'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ============================================
// 类型定义
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: ButtonVariant
  /** 按钮尺寸 */
  size?: ButtonSize
  /** 是否加载中 */
  isLoading?: boolean
  /** 加载文字 */
  loadingText?: string
  /** 左侧图标 */
  leftIcon?: ReactNode
  /** 右侧图标 */
  rightIcon?: ReactNode
  /** 是否为图标按钮 */
  isIconOnly?: boolean
  /** 是否占满宽度 */
  fullWidth?: boolean
}

// ============================================
// 样式配置
// ============================================

const variants: Record<ButtonVariant, string> = {
  primary: `
    bg-amber-400 text-surface-950 
    hover:bg-amber-300 
    active:bg-amber-500
    shadow-sm hover:shadow-glow-amber
    disabled:bg-amber-400/50
  `,
  secondary: `
    bg-surface-700 text-surface-100 
    hover:bg-surface-600 
    active:bg-surface-800
    border border-surface-600
    disabled:bg-surface-700/50
  `,
  ghost: `
    bg-transparent text-surface-300 
    hover:bg-surface-700 hover:text-surface-100
    active:bg-surface-800
  `,
  outline: `
    bg-transparent text-amber-400 
    border border-amber-400/50
    hover:bg-amber-400/10 hover:border-amber-400
    active:bg-amber-400/20
  `,
  danger: `
    bg-error text-white 
    hover:bg-error-light 
    active:bg-error-dark
    disabled:bg-error/50
  `,
  success: `
    bg-success text-white 
    hover:bg-success-light 
    active:bg-success-dark
    disabled:bg-success/50
  `,
}

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
  xl: 'h-12 px-6 text-base gap-2.5',
}

const iconOnlySizes: Record<ButtonSize, string> = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
  xl: 'h-12 w-12',
}

// ============================================
// 组件实现
// ============================================

/**
 * Button 按钮组件
 *
 * @example
 * // 主要按钮
 * <Button variant="primary">开始剪辑</Button>
 *
 * // 带图标的按钮
 * <Button leftIcon={<Plus />}>新建项目</Button>
 *
 * // 加载状态
 * <Button isLoading loadingText="处理中...">提交</Button>
 *
 * // 图标按钮
 * <Button isIconOnly variant="ghost"><Settings /></Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      isIconOnly = false,
      fullWidth = false,
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
          'btn-base',
          'font-medium',
          'transition-all duration-150 ease-out',
          // 变体样式
          variants[variant],
          // 尺寸样式
          isIconOnly ? iconOnlySizes[size] : sizes[size],
          // 宽度
          fullWidth && 'w-full',
          // 禁用状态
          isDisabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      >
        {/* 加载指示器 */}
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}

        {/* 左侧图标 */}
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* 按钮内容 */}
        {!isIconOnly && (
          <span className="truncate">
            {isLoading && loadingText ? loadingText : children}
          </span>
        )}

        {/* 图标按钮内容 */}
        {isIconOnly && !isLoading && children}

        {/* 右侧图标 */}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// ============================================
// 导出
// ============================================

export default Button




