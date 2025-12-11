'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ChevronDown, Tag, Filter } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Spinner, Button } from '@/components/ui'
import {
  getAllCategories,
  type CategoryTag,
  type DimensionGroup,
  type CategoryDimension,
} from '@/lib/api/categories'
import {
  DIMENSION_ICONS,
  DIMENSION_COLORS,
  getTagIconConfig,
} from '@/lib/icons'

// ============================================
// 类型定义
// ============================================

/** 额外的自定义维度配置 */
export interface ExtraDimension {
  id: string
  name: string
  icon?: string | LucideIcon
  color?: { text: string; bg: string }
  tags: Array<{
    id: string
    name: string
    icon?: string | LucideIcon
    iconColor?: string  // 图标颜色类名
    count?: number
  }>
}

interface SubcategoryTagsProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  /** 额外的自定义维度（如花字用途），会显示在数据库维度之前 */
  extraDimensions?: ExtraDimension[]
  className?: string
}

// 只保留这几个维度，按顺序排列
const VISIBLE_DIMENSIONS: CategoryDimension[] = ['PLATFORM', 'INDUSTRY', 'STYLE', 'EMOTION', 'SCENE']

const DIMENSION_LABELS: Record<string, string> = {
  PLATFORM: '平台',
  INDUSTRY: '类型',
  STYLE: '表现力',
  EMOTION: '情绪',
  SCENE: '时机',
}

// ============================================
// 组件
// ============================================

export function SubcategoryTags({
  selectedTags,
  onTagsChange,
  extraDimensions = [],
  className = '',
}: SubcategoryTagsProps) {
  const [dimensions, setDimensions] = useState<DimensionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  // 加载分类数据
  useEffect(() => {
    async function loadCategories() {
      setLoading(true)
      const response = await getAllCategories()
      if (response.success && response.data) {
        setDimensions(response.data.dimensions)
      }
      setLoading(false)
    }
    loadCategories()
  }, [])

  // 按指定顺序筛选维度
  const filteredDimensions = useMemo(() => {
    return VISIBLE_DIMENSIONS
      .map((dim) => dimensions.find((d) => d.dimension === dim))
      .filter(Boolean) as DimensionGroup[]
  }, [dimensions])

  // 切换标签选中状态
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  // 清除所有选中
  const clearAll = () => {
    onTagsChange([])
  }

  // 获取所有标签（包括数据库标签和额外维度标签）
  const allTagsMap = useMemo(() => {
    const map = new Map<string, { name: string; icon?: string | LucideIcon; iconColor?: string; dimension?: string }>()
    // 数据库标签
    dimensions.flatMap((d) => d.tags).forEach((t) => {
      map.set(t.id, { name: t.name, dimension: t.dimension })
    })
    // 额外维度标签
    extraDimensions.forEach((dim) => {
      dim.tags.forEach((t) => {
        map.set(t.id, { name: t.name, icon: t.icon, iconColor: t.iconColor, dimension: dim.id })
      })
    })
    return map
  }, [dimensions, extraDimensions])

  // 获取选中的标签对象
  const selectedTagObjects = useMemo(() => {
    return selectedTags
      .map((id) => {
        const tag = allTagsMap.get(id)
        if (tag) {
          return { id, ...tag }
        }
        return null
      })
      .filter(Boolean) as Array<{ id: string; name: string; icon?: string | LucideIcon; iconColor?: string; dimension?: string }>
  }, [selectedTags, allTagsMap])

  // 计算总标签数
  const totalTagCount = useMemo(() => {
    const dbTagCount = filteredDimensions.reduce((acc, d) => acc + d.tags.length, 0)
    const extraTagCount = extraDimensions.reduce((acc, d) => acc + d.tags.length, 0)
    return dbTagCount + extraTagCount
  }, [filteredDimensions, extraDimensions])

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <Spinner size="sm" />
        <span className="ml-2 text-sm text-surface-500">加载标签...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 顶部操作栏 - 已选标签 + 筛选按钮 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* 筛选按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200
            ${isExpanded 
              ? 'border-amber-400 bg-amber-400/10 text-amber-400' 
              : 'border-surface-700 bg-surface-800/60 text-surface-300 hover:border-surface-500 hover:bg-surface-800'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">筛选标签</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* 已选标签展示 */}
        {selectedTags.length > 0 && (
          <>
            <div className="h-6 w-px bg-surface-700" />
            
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-sm text-surface-500 flex-shrink-0">已选:</span>
              {selectedTagObjects.map((tag) => {
                const iconConfig = tag.dimension ? getTagIconConfig(tag.dimension as CategoryDimension, tag.name) : null
                const TagIcon = iconConfig?.icon
                const iconColor = tag.iconColor || iconConfig?.color || 'text-amber-400'
                // 检查 tag.icon 是否是 Lucide 图标组件（非字符串类型）
                const isLucideIcon = tag.icon && typeof tag.icon !== 'string'
                const ExtraTagIcon = isLucideIcon ? (tag.icon as LucideIcon) : null
                return (
                  <motion.button
                    key={tag.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => toggleTag(tag.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400/20 to-amber-500/10 text-amber-400 rounded-xl text-sm font-medium border border-amber-400/30 hover:bg-amber-400/25 hover:border-amber-400/50 transition-all group"
                  >
                    {ExtraTagIcon ? (
                      <ExtraTagIcon className={`w-4 h-4 ${iconColor}`} />
                    ) : tag.icon && typeof tag.icon === 'string' ? (
                      <span className="text-base">{tag.icon}</span>
                    ) : TagIcon ? (
                      <TagIcon className={`w-4 h-4 ${iconColor}`} />
                    ) : null}
                    <span>{tag.name}</span>
                    <X className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                )
              })}
              
              <button
                onClick={clearAll}
                className="text-xs text-surface-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-surface-800"
              >
                清除全部
              </button>
            </div>
          </>
        )}
      </div>

      {/* 展开的标签选择面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-surface-900/80 backdrop-blur-sm rounded-2xl border border-surface-700/50">
              <div className="space-y-5">
                {/* 数据库维度 */}
                {filteredDimensions.map((dim) => {
                  const DimensionIcon = DIMENSION_ICONS[dim.dimension]
                  const colors = DIMENSION_COLORS[dim.dimension] || { text: 'text-surface-400', bg: 'bg-surface-800' }
                  
                  return (
                    <div key={dim.dimension}>
                      {/* 维度标题 */}
                      <div className="flex items-center gap-2 mb-3">
                        {DimensionIcon && <DimensionIcon className={`w-4 h-4 ${colors.text}`} />}
                        <span className={`text-sm font-medium ${colors.text}`}>
                          {DIMENSION_LABELS[dim.dimension] || dim.name}
                        </span>
                        <span className="text-xs text-surface-600">
                          ({dim.tags.length})
                        </span>
                      </div>

                      {/* 标签列表 */}
                      <div className="flex flex-wrap gap-3">
                        {dim.tags.map((tag) => {
                          const isSelected = selectedTags.includes(tag.id)
                          const iconConfig = getTagIconConfig(dim.dimension, tag.name)
                          const TagIcon = iconConfig?.icon
                          const iconColor = iconConfig?.color || 'text-surface-400'
                          
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              className={`
                                group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200
                                ${isSelected
                                  ? 'border-amber-400 bg-gradient-to-br from-amber-400/15 to-amber-500/5 shadow-sm shadow-amber-400/10'
                                  : 'border-surface-700 bg-surface-800/60 hover:border-surface-500 hover:bg-surface-800'
                                }
                              `}
                            >
                              {/* 选中标记 */}
                              {isSelected && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-surface-950" />
                                </div>
                              )}
                              
                              {/* 图标 */}
                              {TagIcon && (
                                <TagIcon 
                                  className={`w-4 h-4 ${
                                    isSelected ? 'text-amber-400' : iconColor
                                  }`} 
                                />
                              )}
                              
                              {/* 名称 */}
                              <span
                                className={`text-sm font-medium ${
                                  isSelected ? 'text-amber-400' : 'text-surface-300 group-hover:text-surface-100'
                                }`}
                              >
                                {tag.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* 分隔线（如果有数据库维度和额外维度） */}
                {filteredDimensions.length > 0 && extraDimensions.length > 0 && (
                  <div className="border-t border-surface-700/50" />
                )}

                {/* 额外的自定义维度（如花字用途）- 放在最后，样式与数据库维度一致 */}
                {extraDimensions.map((dim) => {
                  const colors = dim.color || { text: 'text-surface-400', bg: 'bg-surface-800' }
                  // 检查是否是 Lucide 图标组件（非字符串类型）
                  const isLucideIcon = dim.icon && typeof dim.icon !== 'string'
                  const DimIcon = isLucideIcon ? (dim.icon as LucideIcon) : null
                  
                  return (
                    <div key={dim.id}>
                      {/* 维度标题 */}
                      <div className="flex items-center gap-2 mb-3">
                        {DimIcon ? (
                          <DimIcon className={`w-4 h-4 ${colors.text}`} />
                        ) : dim.icon ? (
                          <span className="text-base">{dim.icon as string}</span>
                        ) : null}
                        <span className={`text-sm font-medium ${colors.text}`}>
                          {dim.name}
                        </span>
                        <span className="text-xs text-surface-600">
                          ({dim.tags.length})
                        </span>
                      </div>

                      {/* 标签列表 - 样式与数据库维度一致 */}
                      <div className="flex flex-wrap gap-3">
                        {dim.tags.map((tag) => {
                          const isSelected = selectedTags.includes(tag.id)
                          // 检查是否是 Lucide 图标组件（非字符串类型）
                          const isTagLucideIcon = tag.icon && typeof tag.icon !== 'string'
                          const TagIcon = isTagLucideIcon ? (tag.icon as LucideIcon) : null
                          
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              className={`
                                group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200
                                ${isSelected
                                  ? 'border-amber-400 bg-gradient-to-br from-amber-400/15 to-amber-500/5 shadow-sm shadow-amber-400/10'
                                  : 'border-surface-700 bg-surface-800/60 hover:border-surface-500 hover:bg-surface-800'
                                }
                              `}
                            >
                              {/* 选中标记 */}
                              {isSelected && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-surface-950" />
                                </div>
                              )}
                              
                              {/* 图标 */}
                              {TagIcon ? (
                                <TagIcon 
                                  className={`w-4 h-4 ${
                                    isSelected ? 'text-amber-400' : (tag.iconColor || 'text-surface-400')
                                  }`} 
                                />
                              ) : tag.icon ? (
                                <span className={`text-base ${isSelected ? '' : 'opacity-70'}`}>
                                  {tag.icon as string}
                                </span>
                              ) : null}
                              
                              {/* 名称 */}
                              <span
                                className={`text-sm font-medium ${
                                  isSelected ? 'text-amber-400' : 'text-surface-300 group-hover:text-surface-100'
                                }`}
                              >
                                {tag.name}
                              </span>

                              {/* 数量 */}
                              {tag.count !== undefined && (
                                <span className="text-xs opacity-60">({tag.count})</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 底部操作 */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-700/50">
                <span className="text-xs text-surface-500">
                  共 {totalTagCount} 个标签
                </span>
                <div className="flex items-center gap-2">
                  {selectedTags.length > 0 && (
                    <Button variant="ghost" size="xs" onClick={clearAll}>
                      清除选择
                    </Button>
                  )}
                  <Button variant="primary" size="xs" onClick={() => setIsExpanded(false)}>
                    确定 ({selectedTags.length})
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SubcategoryTags
