'use client'

import { type ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type TooltipAlign = 'start' | 'center' | 'end'

export interface TooltipProps {
  /** 提示内容 */
  content: ReactNode
  /** 触发元素 */
  children: ReactNode
  /** 显示位置 */
  side?: TooltipSide
  /** 对齐方式 */
  align?: TooltipAlign
  /** 延迟显示时间（毫秒） */
  delayDuration?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否默认打开 */
  defaultOpen?: boolean
  /** 受控打开状态 */
  open?: boolean
  /** 打开状态变化回调 */
  onOpenChange?: (open: boolean) => void
}

// ============================================
// Provider 组件
// ============================================

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

// ============================================
// Tooltip 组件
// ============================================

/**
 * Tooltip 提示组件
 *
 * @example
 * // 基础用法（需要 TooltipProvider 包裹）
 * <TooltipProvider>
 *   <Tooltip content="这是提示内容">
 *     <Button>悬停查看</Button>
 *   </Tooltip>
 * </TooltipProvider>
 *
 * // 不同位置
 * <Tooltip content="右侧提示" side="right">
 *   <IconButton>?</IconButton>
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration,
  disabled = false,
  defaultOpen,
  open,
  onOpenChange,
}: TooltipProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipPrimitive.Root
      delayDuration={delayDuration}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>

      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            'z-[var(--z-tooltip)]',
            'px-3 py-1.5',
            'max-w-xs',
            // 样式
            'bg-surface-700',
            'border border-surface-500',
            'rounded-lg',
            'shadow-lg',
            // 文字
            'text-sm text-surface-200',
            // 动画
            'animate-fade-in',
            'data-[state=closed]:animate-fade-out',
            // 箭头位置偏移
            'data-[side=top]:animate-slide-in-down',
            'data-[side=bottom]:animate-slide-in-up',
            'data-[side=left]:animate-slide-in-right',
            'data-[side=right]:animate-slide-in-left'
          )}
        >
          {content}

          {/* 箭头 */}
          <TooltipPrimitive.Arrow
            className="fill-surface-700"
            width={12}
            height={6}
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

// ============================================
// 导出
// ============================================

export default Tooltip






