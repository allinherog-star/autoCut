'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'value'> {
  /** 当前值 */
  value?: number[]
  /** 默认值 */
  defaultValue?: number[]
  /** 值变化回调 */
  onValueChange?: (value: number[]) => void
  /** 值提交回调（拖拽结束） */
  onValueCommit?: (value: number[]) => void
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 滑块方向 */
  orientation?: 'horizontal' | 'vertical'
  /** 是否显示当前值 */
  showValue?: boolean
  /** 格式化显示值 */
  formatValue?: (value: number) => string
  /** 标签 */
  label?: string
  /** 滑块尺寸 */
  size?: 'sm' | 'md' | 'lg'
}

// ============================================
// 样式配置
// ============================================

const trackSizes = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
}

const thumbSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

// ============================================
// 组件实现
// ============================================

/**
 * Slider 滑块组件
 *
 * @example
 * // 基础用法
 * <Slider defaultValue={[50]} />
 *
 * // 显示值
 * <Slider
 *   label="音量"
 *   showValue
 *   formatValue={(v) => `${v}%`}
 * />
 *
 * // 范围滑块
 * <Slider
 *   defaultValue={[20, 80]}
 *   min={0}
 *   max={100}
 * />
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue = [50],
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      orientation = 'horizontal',
      showValue = false,
      formatValue = (v) => String(v),
      label,
      size = 'md',
      ...props
    },
    ref
  ) => {
    // 用于显示的当前值
    const displayValue = value ?? defaultValue
    // thumb 数量基于 defaultValue（稳定）
    const thumbCount = defaultValue.length

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* 标签和值 */}
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <span className="text-sm text-surface-300">{label}</span>
            )}
            {showValue && (
              <span className="text-sm font-mono text-surface-400">
                {displayValue.length === 1
                  ? formatValue(displayValue[0])
                  : `${formatValue(displayValue[0])} - ${formatValue(displayValue[displayValue.length - 1])}`}
              </span>
            )}
          </div>
        )}

        {/* 滑块 */}
        <SliderPrimitive.Root
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          orientation={orientation}
          className={cn(
            'relative flex items-center',
            orientation === 'horizontal' ? 'w-full' : 'h-full flex-col',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {/* 轨道 */}
          <SliderPrimitive.Track
            className={cn(
              'relative grow rounded-full',
              'bg-surface-700',
              orientation === 'horizontal' ? 'w-full' : 'w-1.5',
              trackSizes[size]
            )}
          >
            {/* 已选择范围 */}
            <SliderPrimitive.Range
              className={cn(
                'absolute rounded-full',
                'bg-amber-400',
                orientation === 'horizontal' ? 'h-full' : 'w-full'
              )}
            />
          </SliderPrimitive.Track>

          {/* 滑块手柄 */}
          {Array.from({ length: thumbCount }).map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className={cn(
                'block rounded-full',
                'bg-amber-400',
                'border-2 border-surface-800',
                'shadow-md',
                'transition-all duration-150',
                'hover:scale-110 hover:shadow-glow-amber',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50',
                'disabled:pointer-events-none',
                thumbSizes[size]
              )}
            />
          ))}
        </SliderPrimitive.Root>
      </div>
    )
  }
)

Slider.displayName = 'Slider'

// ============================================
// 导出
// ============================================

export default Slider

