import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className，支持条件类名和 Tailwind CSS 类名去重
 * @example cn('px-4 py-2', isActive && 'bg-amber-400', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * 格式化时间码（毫秒 -> HH:MM:SS.ms）
 * @param ms 毫秒数
 * @param showMs 是否显示毫秒
 */
export function formatTimecode(ms: number, showMs = true): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)

  const parts = [
    hours > 0 ? hours.toString().padStart(2, '0') : null,
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].filter(Boolean)

  const time = parts.join(':')
  return showMs ? `${time}.${milliseconds.toString().padStart(2, '0')}` : time
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化持续时间（秒 -> 可读格式）
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}秒`
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`
  }
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`
}

/**
 * 限制数值在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}























