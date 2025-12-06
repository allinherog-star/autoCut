'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type TabsVariant = 'default' | 'pills' | 'underline'
export type TabsSize = 'sm' | 'md' | 'lg'

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** 当前选中的 tab */
  value?: string
  /** 默认选中的 tab */
  defaultValue?: string
  /** 选中变化回调 */
  onValueChange?: (value: string) => void
  /** 变体样式 */
  variant?: TabsVariant
  /** 尺寸 */
  size?: TabsSize
  /** 子元素 */
  children?: ReactNode
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** 变体样式（从父级继承） */
  variant?: TabsVariant
}

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** tab 值 */
  value: string
  /** 是否禁用 */
  disabled?: boolean
  /** 左侧图标 */
  leftIcon?: ReactNode
  /** 右侧徽章 */
  badge?: ReactNode
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  /** tab 值 */
  value: string
}

// ============================================
// 样式配置
// ============================================

const listVariants: Record<TabsVariant, string> = {
  default: 'bg-surface-800 rounded-lg p-1 gap-1',
  pills: 'gap-2',
  underline: 'border-b border-surface-600 gap-1',
}

const triggerVariants: Record<TabsVariant, string> = {
  default: cn(
    'rounded-md',
    'text-surface-400',
    'hover:text-surface-200 hover:bg-surface-700',
    'data-[state=active]:bg-surface-700 data-[state=active]:text-surface-100'
  ),
  pills: cn(
    'rounded-full',
    'text-surface-400',
    'hover:text-surface-200 hover:bg-surface-700',
    'data-[state=active]:bg-amber-400 data-[state=active]:text-surface-950'
  ),
  underline: cn(
    'rounded-none border-b-2 border-transparent -mb-px',
    'text-surface-400',
    'hover:text-surface-200',
    'data-[state=active]:border-amber-400 data-[state=active]:text-amber-400'
  ),
}

const sizes: Record<TabsSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

// ============================================
// Tabs 主组件
// ============================================

/**
 * Tabs 标签页组件
 *
 * @example
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">基础信息</TabsTrigger>
 *     <TabsTrigger value="tab2">高级设置</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">基础信息内容</TabsContent>
 *   <TabsContent value="tab2">高级设置内容</TabsContent>
 * </Tabs>
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      variant = 'default',
      size = 'md',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <TabsPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        className={cn('w-full', className)}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    )
  }
)

Tabs.displayName = 'Tabs'

// ============================================
// TabsList 组件
// ============================================

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          'inline-flex items-center',
          // 从父级读取 variant
          'group-data-[variant=default]:bg-surface-800 group-data-[variant=default]:rounded-lg group-data-[variant=default]:p-1',
          'group-data-[variant=underline]:border-b group-data-[variant=underline]:border-surface-600',
          variant ? listVariants[variant] : listVariants.default,
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    )
  }
)

TabsList.displayName = 'TabsList'

// ============================================
// TabsTrigger 组件
// ============================================

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, leftIcon, badge, children, ...props }, ref) => {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-medium',
          'whitespace-nowrap',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50',
          'disabled:pointer-events-none disabled:opacity-50',
          // 默认尺寸
          'px-3 py-1.5 text-sm',
          // 默认变体
          triggerVariants.default,
          className
        )}
        {...props}
      >
        {leftIcon && (
          <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {badge && (
          <span className="flex-shrink-0" aria-hidden="true">
            {badge}
          </span>
        )}
      </TabsPrimitive.Trigger>
    )
  }
)

TabsTrigger.displayName = 'TabsTrigger'

// ============================================
// TabsContent 组件
// ============================================

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    return (
      <TabsPrimitive.Content
        ref={ref}
        value={value}
        className={cn(
          'mt-4',
          'focus:outline-none',
          // 动画
          'data-[state=active]:animate-fade-in-up',
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Content>
    )
  }
)

TabsContent.displayName = 'TabsContent'

// ============================================
// 导出
// ============================================

export default Tabs

