'use client'

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 输入框尺寸 */
  size?: InputSize
  /** 左侧图标/元素 */
  leftElement?: ReactNode
  /** 右侧图标/元素 */
  rightElement?: ReactNode
  /** 错误信息 */
  error?: string
  /** 是否有错误 */
  isInvalid?: boolean
  /** 标签 */
  label?: string
  /** 帮助文字 */
  helperText?: string
  /** 是否必填 */
  isRequired?: boolean
  /** 容器类名 */
  containerClassName?: string
}

// ============================================
// 样式配置
// ============================================

const sizes: Record<InputSize, string> = {
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-sm px-4',
  lg: 'h-12 text-base px-4',
}

const leftPaddings: Record<InputSize, string> = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-12',
}

const rightPaddings: Record<InputSize, string> = {
  sm: 'pr-9',
  md: 'pr-10',
  lg: 'pr-12',
}

// ============================================
// 组件实现
// ============================================

/**
 * Input 输入框组件
 *
 * @example
 * // 基础用法
 * <Input placeholder="请输入项目名称" />
 *
 * // 带图标
 * <Input leftElement={<Search />} placeholder="搜索..." />
 *
 * // 带标签和帮助文字
 * <Input
 *   label="项目名称"
 *   helperText="为你的项目起一个独特的名字"
 *   isRequired
 * />
 *
 * // 错误状态
 * <Input error="名称不能为空" isInvalid />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      size = 'md',
      leftElement,
      rightElement,
      error,
      isInvalid,
      label,
      helperText,
      isRequired,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const hasError = isInvalid || !!error
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-surface-200"
          >
            {label}
            {isRequired && (
              <span className="ml-1 text-error" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 左侧元素 */}
          {leftElement && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'text-surface-400',
                'pointer-events-none'
              )}
              aria-hidden="true"
            >
              {leftElement}
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={cn(
              // 基础样式
              'input-base w-full',
              'placeholder:text-surface-500',
              // 尺寸
              sizes[size],
              // 左右内边距（有图标时）
              leftElement && leftPaddings[size],
              rightElement && rightPaddings[size],
              // 错误状态
              hasError && [
                'border-error/50',
                'focus:border-error',
                'focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
              ],
              // 禁用状态
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            {...props}
          />

          {/* 右侧元素 */}
          {rightElement && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'text-surface-400'
              )}
            >
              {rightElement}
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* 帮助文字 */}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-surface-400"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ============================================
// 导出
// ============================================

export default Input

