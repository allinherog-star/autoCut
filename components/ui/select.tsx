'use client'

import { forwardRef, useId, type ReactNode } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectProps {
  /** 当前值 */
  value?: string
  /** 默认值 */
  defaultValue?: string
  /** 值变化回调 */
  onValueChange?: (value: string) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符 */
  placeholder?: string
  /** 尺寸 */
  size?: SelectSize
  /** 标签 */
  label?: string
  /** 错误信息 */
  error?: string
  /** 是否必填 */
  required?: boolean
  /** 子元素（SelectItem） */
  children?: ReactNode
  /** 容器类名 */
  className?: string
}

export interface SelectItemProps {
  /** 选项值 */
  value: string
  /** 是否禁用 */
  disabled?: boolean
  /** 子元素 */
  children?: ReactNode
  /** 类名 */
  className?: string
}

export interface SelectGroupProps {
  /** 分组标签 */
  label: string
  /** 子元素 */
  children?: ReactNode
}

// ============================================
// 样式配置
// ============================================

const triggerSizes: Record<SelectSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

// ============================================
// Select 主组件
// ============================================

/**
 * Select 选择器组件
 *
 * @example
 * <Select placeholder="选择分辨率" label="导出分辨率">
 *   <SelectItem value="720p">720p HD</SelectItem>
 *   <SelectItem value="1080p">1080p Full HD</SelectItem>
 *   <SelectItem value="4k">4K Ultra HD</SelectItem>
 * </Select>
 *
 * // 分组选项
 * <Select placeholder="选择格式">
 *   <SelectGroup label="视频格式">
 *     <SelectItem value="mp4">MP4</SelectItem>
 *     <SelectItem value="webm">WebM</SelectItem>
 *   </SelectGroup>
 * </Select>
 */
export function Select({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  placeholder = '请选择',
  size = 'md',
  label,
  error,
  required,
  children,
  className,
}: SelectProps) {
  const selectId = useId()

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* 标签 */}
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-surface-200"
        >
          {label}
          {required && (
            <span className="ml-1 text-error" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        {/* 触发器 */}
        <SelectPrimitive.Trigger
          id={selectId}
          className={cn(
            'inline-flex items-center justify-between gap-2',
            'w-full',
            'bg-surface-900',
            'border border-surface-600',
            'rounded-lg',
            'text-surface-200',
            'transition-all duration-150',
            'hover:border-surface-500',
            'focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[placeholder]:text-surface-500',
            error && 'border-error/50 focus:border-error focus:ring-error/10',
            triggerSizes[size]
          )}
          aria-invalid={!!error}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="w-4 h-4 text-surface-400" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        {/* 下拉内容 */}
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              'relative z-[var(--z-popover)]',
              'min-w-[8rem] overflow-hidden',
              'bg-surface-800',
              'border border-surface-600',
              'rounded-lg',
              'shadow-elevated',
              // 动画
              'animate-fade-in',
              'data-[side=top]:animate-slide-in-down',
              'data-[side=bottom]:animate-slide-in-up'
            )}
            position="popper"
            sideOffset={4}
          >
            {/* 向上滚动按钮 */}
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-surface-800 cursor-default">
              <ChevronUp className="w-4 h-4 text-surface-400" />
            </SelectPrimitive.ScrollUpButton>

            {/* 选项列表 */}
            <SelectPrimitive.Viewport className="p-1">
              {children}
            </SelectPrimitive.Viewport>

            {/* 向下滚动按钮 */}
            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-surface-800 cursor-default">
              <ChevronDown className="w-4 h-4 text-surface-400" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {/* 错误信息 */}
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================
// SelectItem 组件
// ============================================

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    return (
      <SelectPrimitive.Item
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(
          'relative flex items-center',
          'px-3 py-2 pr-8',
          'rounded-md',
          'text-sm text-surface-200',
          'cursor-pointer select-none',
          'outline-none',
          'transition-colors duration-100',
          'hover:bg-surface-700',
          'focus:bg-surface-700',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          'data-[highlighted]:bg-surface-700',
          className
        )}
        {...props}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="absolute right-2">
          <Check className="w-4 h-4 text-amber-400" />
        </SelectPrimitive.ItemIndicator>
      </SelectPrimitive.Item>
    )
  }
)

SelectItem.displayName = 'SelectItem'

// ============================================
// SelectGroup 组件
// ============================================

export function SelectGroup({ label, children }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group>
      <SelectPrimitive.Label className="px-3 py-1.5 text-xs font-medium text-surface-500">
        {label}
      </SelectPrimitive.Label>
      {children}
    </SelectPrimitive.Group>
  )
}

// ============================================
// SelectSeparator 组件
// ============================================

export function SelectSeparator() {
  return (
    <SelectPrimitive.Separator className="h-px my-1 bg-surface-600" />
  )
}

// ============================================
// 导出
// ============================================

export default Select

