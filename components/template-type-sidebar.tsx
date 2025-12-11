'use client'

import { motion } from 'framer-motion'
import {
  LayoutTemplate,
  Video,
  ImageIcon,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui'

// ============================================
// 类型定义
// ============================================

export type TemplateType = 
  | 'ALL'
  | 'VIDEO'
  | 'IMAGE'
  | 'FANCY_TEXT'

interface TemplateTypeItem {
  type: TemplateType
  label: string
  labelEn: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  description: string
}

interface TemplateTypeSidebarProps {
  selectedType: TemplateType
  onTypeChange: (type: TemplateType) => void
  counts?: Record<string, number>
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

// ============================================
// 常量配置
// ============================================

export const TEMPLATE_TYPE_CONFIG: TemplateTypeItem[] = [
  {
    type: 'ALL',
    label: '全部模版',
    labelEn: 'All Templates',
    icon: LayoutTemplate,
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/15',
    description: '浏览所有类型的模版',
  },
  {
    type: 'VIDEO',
    label: '视频模版',
    labelEn: 'Video Template',
    icon: Video,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/15',
    description: '完整视频制作模版',
  },
  {
    type: 'IMAGE',
    label: '图片模版',
    labelEn: 'Image Template',
    icon: ImageIcon,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/15',
    description: '图片排版设计模版',
  },
  {
    type: 'FANCY_TEXT',
    label: '花字模版',
    labelEn: 'Fancy Text Template',
    icon: Sparkles,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/15',
    description: '装饰文字和炫酷特效模版',
  },
]

// ============================================
// 组件
// ============================================

export function TemplateTypeSidebar({
  selectedType,
  onTypeChange,
  counts = {},
  className = '',
  collapsed = false,
  onCollapsedChange,
}: TemplateTypeSidebarProps) {
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
            模版类型
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
          {TEMPLATE_TYPE_CONFIG.map((item) => {
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
                      layoutId="template-sidebar-indicator"
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
            <span>共 {totalCount} 个模版</span>
            <span>{TEMPLATE_TYPE_CONFIG.length - 1} 个类型</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateTypeSidebar

