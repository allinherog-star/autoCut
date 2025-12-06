'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================
// 预设动画变体
// ============================================

export type MotionVariant =
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn'
  | 'scaleInBounce'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'

const variants: Record<MotionVariant, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleInBounce: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  },
  slideInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  slideInDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
}

// 默认过渡配置
const defaultTransition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1], // ease-out-expo
}

// ============================================
// 基础 Motion 组件
// ============================================

export const MotionDiv = motion.div
export const MotionSpan = motion.span
export const MotionButton = motion.button

// ============================================
// FadeIn 组件
// ============================================

interface FadeInProps extends HTMLMotionProps<'div'> {
  /** 动画方向 */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** 动画延迟 */
  delay?: number
  /** 动画时长 */
  duration?: number
  /** 是否禁用动画 */
  disabled?: boolean
}

/**
 * FadeIn 淡入动画组件
 *
 * @example
 * <FadeIn direction="up" delay={0.2}>
 *   <Card>内容</Card>
 * </FadeIn>
 */
export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  (
    {
      className,
      direction = 'none',
      delay = 0,
      duration = 0.3,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    if (disabled) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      )
    }

    const variantKey: MotionVariant =
      direction === 'none'
        ? 'fadeIn'
        : (`fadeIn${direction.charAt(0).toUpperCase()}${direction.slice(1)}` as MotionVariant)

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={variants[variantKey]}
        transition={{ ...defaultTransition, delay, duration }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

FadeIn.displayName = 'FadeIn'

// ============================================
// SlideIn 组件
// ============================================

interface SlideInProps extends HTMLMotionProps<'div'> {
  /** 滑入方向 */
  direction?: 'up' | 'down' | 'left' | 'right'
  /** 动画延迟 */
  delay?: number
  /** 动画时长 */
  duration?: number
}

/**
 * SlideIn 滑入动画组件
 */
export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ className, direction = 'up', delay = 0, duration = 0.3, children, ...props }, ref) => {
    const variantKey = `slideIn${direction.charAt(0).toUpperCase()}${direction.slice(1)}` as MotionVariant

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={variants[variantKey]}
        transition={{ ...defaultTransition, delay, duration }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

SlideIn.displayName = 'SlideIn'

// ============================================
// ScaleIn 组件
// ============================================

interface ScaleInProps extends HTMLMotionProps<'div'> {
  /** 是否使用弹性效果 */
  bounce?: boolean
  /** 动画延迟 */
  delay?: number
  /** 动画时长 */
  duration?: number
}

/**
 * ScaleIn 缩放进入动画组件
 */
export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ className, bounce = false, delay = 0, duration = 0.3, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={variants[bounce ? 'scaleInBounce' : 'scaleIn']}
        transition={bounce ? { delay } : { ...defaultTransition, delay, duration }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

ScaleIn.displayName = 'ScaleIn'

// ============================================
// StaggerContainer 容器组件
// ============================================

interface StaggerContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** 子元素间隔时间 */
  staggerDelay?: number
  /** 初始延迟 */
  delayChildren?: number
  /** 子元素 */
  children?: ReactNode
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
}

/**
 * StaggerContainer 交错动画容器
 *
 * @example
 * <StaggerContainer staggerDelay={0.1}>
 *   <StaggerItem>Item 1</StaggerItem>
 *   <StaggerItem>Item 2</StaggerItem>
 *   <StaggerItem>Item 3</StaggerItem>
 * </StaggerContainer>
 */
export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ className, staggerDelay = 0.1, delayChildren = 0, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren,
            },
          },
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

StaggerContainer.displayName = 'StaggerContainer'

// ============================================
// StaggerItem 子项组件
// ============================================

interface StaggerItemProps extends HTMLMotionProps<'div'> {
  /** 动画变体 */
  variant?: MotionVariant
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
}

/**
 * StaggerItem 交错动画子项
 */
export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ className, variant = 'fadeInUp', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={variants[variant] || staggerItemVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

StaggerItem.displayName = 'StaggerItem'

// ============================================
// 悬停动画 Hook
// ============================================

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 },
}

export const hoverLift = {
  whileHover: { y: -4 },
  transition: { duration: 0.2 },
}

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)',
  },
  transition: { duration: 0.2 },
}

// ============================================
// 页面过渡动画
// ============================================

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
}

// ============================================
// 列表动画
// ============================================

export const listAnimation = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  },
}


