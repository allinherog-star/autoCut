'use client'

import { forwardRef, type ReactNode, type HTMLAttributes } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// 类型定义
// ============================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  /** 是否打开 */
  open?: boolean
  /** 打开状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 弹窗尺寸 */
  size?: ModalSize
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean
  /** 点击遮罩是否关闭 */
  closeOnOverlayClick?: boolean
  /** 子元素 */
  children?: ReactNode
}

export interface ModalHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 标题 */
  title?: ReactNode
  /** 描述 */
  description?: ReactNode
}

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

// ============================================
// 样式配置
// ============================================

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw] max-h-[90vh]',
}

// ============================================
// Modal 主组件
// ============================================

/**
 * Modal 弹窗组件
 *
 * @example
 * <Modal open={isOpen} onOpenChange={setIsOpen}>
 *   <ModalHeader title="确认删除" description="此操作不可撤销" />
 *   <ModalContent>
 *     确定要删除这个项目吗？
 *   </ModalContent>
 *   <ModalFooter>
 *     <Button variant="ghost" onClick={() => setIsOpen(false)}>取消</Button>
 *     <Button variant="danger">删除</Button>
 *   </ModalFooter>
 * </Modal>
 */
export function Modal({
  open,
  onOpenChange,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  children,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* 遮罩层 */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-[var(--z-modal)]',
            'bg-black/60 backdrop-blur-sm',
            // 动画
            'data-[state=open]:animate-fade-in',
            'data-[state=closed]:animate-fade-out'
          )}
          onClick={closeOnOverlayClick ? undefined : (e) => e.stopPropagation()}
        />

        {/* 弹窗内容 */}
        <DialogPrimitive.Content
          className={cn(
            'fixed z-[var(--z-modal)]',
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-full',
            sizes[size],
            // 样式
            'bg-surface-800',
            'border border-surface-600',
            'rounded-2xl',
            'shadow-elevated',
            'overflow-hidden',
            // 动画
            'data-[state=open]:animate-scale-in',
            'data-[state=closed]:animate-fade-out'
          )}
          onPointerDownOutside={
            closeOnOverlayClick ? undefined : (e) => e.preventDefault()
          }
        >
          {children}

          {/* 关闭按钮 */}
          {showCloseButton && (
            <DialogPrimitive.Close
              className={cn(
                'absolute right-4 top-4',
                'p-1.5 rounded-lg',
                'text-surface-400',
                'hover:text-surface-200 hover:bg-surface-700',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50'
              )}
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ============================================
// ModalHeader 组件
// ============================================

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4',
          'border-b border-surface-600',
          className
        )}
        {...props}
      >
        {title && (
          <DialogPrimitive.Title className="text-lg font-semibold text-surface-100">
            {title}
          </DialogPrimitive.Title>
        )}
        {description && (
          <DialogPrimitive.Description className="mt-1 text-sm text-surface-400">
            {description}
          </DialogPrimitive.Description>
        )}
        {children}
      </div>
    )
  }
)

ModalHeader.displayName = 'ModalHeader'

// ============================================
// ModalContent 组件
// ============================================

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-6 py-4',
          'max-h-[60vh] overflow-y-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ModalContent.displayName = 'ModalContent'

// ============================================
// ModalFooter 组件
// ============================================

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3',
          'px-6 py-4',
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

ModalFooter.displayName = 'ModalFooter'

// ============================================
// 触发器组件
// ============================================

export const ModalTrigger = DialogPrimitive.Trigger

// ============================================
// 导出
// ============================================

export default Modal






























