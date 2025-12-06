'use client'

import { forwardRef, useId, type HTMLAttributes } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchProps extends HTMLAttributes<HTMLButtonElement> {
  /** 是否选中 */
  checked?: boolean
  /** 默认选中状态 */
  defaultChecked?: boolean
  /** 选中状态变化回调 */
  onCheckedChange?: (checked: boolean) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 尺寸 */
  size?: SwitchSize
  /** 标签 */
  label?: string
  /** 描述 */
  description?: string
  /** 标签位置 */
  labelPosition?: 'left' | 'right'
}

// ============================================
// 样式配置
// ============================================

const rootSizes: Record<SwitchSize, string> = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
  lg: 'h-6 w-11',
}

const thumbSizes: Record<SwitchSize, string> = {
  sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
  md: 'h-4 w-4 data-[state=checked]:translate-x-4',
  lg: 'h-5 w-5 data-[state=checked]:translate-x-5',
}

// ============================================
// 组件实现
// ============================================

/**
 * Switch 开关组件
 *
 * @example
 * // 基础用法
 * <Switch />
 *
 * // 带标签
 * <Switch label="启用通知" />
 *
 * // 带描述
 * <Switch
 *   label="自动保存"
 *   description="每隔 5 分钟自动保存项目"
 * />
 *
 * // 受控模式
 * <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled = false,
      size = 'md',
      label,
      description,
      labelPosition = 'right',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const switchId = id || generatedId

    const switchElement = (
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer items-center rounded-full',
          'border-2 border-transparent',
          'transition-colors duration-200',
          // 未选中状态
          'bg-surface-600',
          // 选中状态
          'data-[state=checked]:bg-amber-400',
          // 禁用状态
          'disabled:cursor-not-allowed disabled:opacity-50',
          // 聚焦状态
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900',
          rootSizes[size],
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block rounded-full',
            'bg-white shadow-md',
            'transition-transform duration-200',
            'translate-x-0.5',
            thumbSizes[size]
          )}
        />
      </SwitchPrimitive.Root>
    )

    // 无标签时直接返回开关
    if (!label && !description) {
      return switchElement
    }

    // 有标签时包裹布局
    return (
      <div
        className={cn(
          'flex items-start gap-3',
          labelPosition === 'left' && 'flex-row-reverse'
        )}
      >
        {switchElement}
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                'text-sm font-medium text-surface-200 cursor-pointer',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-surface-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Switch.displayName = 'Switch'

// ============================================
// 导出
// ============================================

export default Switch

