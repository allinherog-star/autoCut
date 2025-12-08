'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  Video,
  ImageIcon,
  Music,
  Volume2,
  Type,
  Smile,
  Heart,
  Sparkles,
  Layers,
  LayoutTemplate,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui'
import type { MediaType } from '@/lib/api/media'

// ============================================
// 类型定义
// ============================================

export type MediaTypeFilter = 'ALL' | MediaType

interface MediaTypeItem {
  type: MediaTypeFilter
  label: string
  labelEn: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  description: string
}

interface MediaTypeSidebarProps {
  selectedType: MediaTypeFilter
  onTypeChange: (type: MediaTypeFilter) => void
  counts?: Record<string, number>
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

// ============================================
// 常量配置
// ============================================

export const MEDIA_TYPE_CONFIG: MediaTypeItem[] = [
  {
    type: 'ALL',
    label: '全部素材',
    labelEn: 'All Media',
    icon: FolderOpen,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/15',
    description: '浏览所有类型的素材',
  },
  {
    type: 'VIDEO',
    label: '视频',
    labelEn: 'Video',
    icon: Video,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/15',
    description: '视频素材和片段',
  },
  {
    type: 'IMAGE',
    label: '图片',
    labelEn: 'Image',
    icon: ImageIcon,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/15',
    description: '照片和图像素材',
  },
  {
    type: 'AUDIO',
    label: '音乐',
    labelEn: 'Music',
    icon: Music,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/15',
    description: '背景音乐和配乐',
  },
  {
    type: 'SOUND_EFFECT',
    label: '音效',
    labelEn: 'Sound Effect',
    icon: Volume2,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/15',
    description: '特效音和环境音',
  },
  {
    type: 'FANCY_TEXT',
    label: '花字',
    labelEn: 'Fancy Text',
    icon: Type,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/15',
    description: '装饰文字和艺术字',
  },
  {
    type: 'STICKER',
    label: '表情',
    labelEn: 'Emoji',
    icon: Smile,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/15',
    description: '表情贴纸和贴图',
  },
  {
    type: 'EMOTION',
    label: '情绪',
    labelEn: 'Emotion',
    icon: Heart,
    color: 'text-red-400',
    bgColor: 'bg-red-400/15',
    description: '情绪氛围素材',
  },
  {
    type: 'FONT',
    label: '字体',
    labelEn: 'Font',
    icon: Type,
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/15',
    description: '字体文件资源',
  },
  {
    type: 'EFFECT',
    label: '特效',
    labelEn: 'Effect',
    icon: Sparkles,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/15',
    description: '视觉特效滤镜',
  },
  {
    type: 'TRANSITION',
    label: '转场',
    labelEn: 'Transition',
    icon: Layers,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/15',
    description: '场景转换效果',
  },
  {
    type: 'TEMPLATE',
    label: '模版',
    labelEn: 'Template',
    icon: LayoutTemplate,
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/15',
    description: '预设模板样式',
  },
]

// ============================================
// 组件
// ============================================

export function MediaTypeSidebar({
  selectedType,
  onTypeChange,
  counts = {},
  className = '',
  collapsed = false,
  onCollapsedChange,
}: MediaTypeSidebarProps) {
  // 计算总数
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div
      className={`
        flex flex-col h-full bg-surface-900/50 border-r border-surface-800
        transition-all duration-300 ease-out
        ${collapsed ? 'w-16' : 'w-56'}
        ${className}
      `}
    >
      {/* 标题区域 */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-surface-800">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            素材类型
          </h2>
        )}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      {/* 类型列表 */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        <ul className="space-y-0.5 px-2">
          {MEDIA_TYPE_CONFIG.map((item) => {
            const Icon = item.icon
            const isSelected = selectedType === item.type
            const count = item.type === 'ALL' ? totalCount : (counts[item.type] || 0)

            return (
              <li key={item.type}>
                <button
                  onClick={() => onTypeChange(item.type)}
                  className={`
                    relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 group
                    ${isSelected
                      ? `${item.bgColor} ${item.color}`
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                    }
                  `}
                  title={collapsed ? `${item.label} (${count})` : undefined}
                >
                  {/* 选中指示器 */}
                  {isSelected && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${item.color.replace('text-', 'bg-')}`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* 图标 */}
                  <div
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                      transition-colors
                      ${isSelected ? item.bgColor : 'bg-surface-800 group-hover:bg-surface-700'}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? item.color : ''}`} />
                  </div>

                  {/* 标签和计数 */}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {item.label}
                      </span>
                      {count > 0 && (
                        <Badge
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className={isSelected ? `${item.bgColor} ${item.color} border-0` : 'opacity-60'}
                        >
                          {count > 999 ? '999+' : count}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 底部统计 */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-surface-800">
          <div className="flex items-center justify-between text-xs text-surface-500">
            <span>共 {totalCount} 个素材</span>
            <span>{MEDIA_TYPE_CONFIG.length - 1} 个类型</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaTypeSidebar

