'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Spinner } from '@/components/ui'
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

interface SubcategoryTagsProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
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
  className = '',
}: SubcategoryTagsProps) {
  const [dimensions, setDimensions] = useState<DimensionGroup[]>([])
  const [loading, setLoading] = useState(true)

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

  // 获取选中的标签对象
  const selectedTagObjects = useMemo(() => {
    const allTags = dimensions.flatMap((d) => d.tags)
    return selectedTags
      .map((id) => allTags.find((t) => t.id === id))
      .filter(Boolean) as CategoryTag[]
  }, [dimensions, selectedTags])

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
      {/* 平铺的标签区域 */}
      <div className="space-y-4">
        {filteredDimensions.map((dim) => {
          const DimensionIcon = DIMENSION_ICONS[dim.dimension]
          const colors = DIMENSION_COLORS[dim.dimension] || { text: 'text-surface-400', bg: 'bg-surface-800' }
          
          return (
            <div key={dim.dimension}>
              {/* 维度标题 */}
              <div className="flex items-center gap-2 mb-2.5">
                {DimensionIcon && <DimensionIcon className={`w-4 h-4 ${colors.text}`} />}
                <span className={`text-sm font-medium ${colors.text}`}>
                  {DIMENSION_LABELS[dim.dimension] || dim.name}
                </span>
              </div>

              {/* 标签列表 - 与上传页面风格一致 */}
              <div className="flex flex-wrap gap-2.5">
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
                        group relative flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200
                        ${isSelected
                          ? 'border-amber-400 bg-gradient-to-br from-amber-400/15 to-amber-500/5 shadow-lg shadow-amber-400/10'
                          : 'border-surface-700 bg-surface-800/60 hover:border-surface-500 hover:bg-surface-800 hover:shadow-md'
                        }
                      `}
                    >
                      {/* 选中标记 */}
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                          <Check className="w-2.5 h-2.5 text-surface-950" />
                        </div>
                      )}
                      
                      {/* 图标 */}
                      {TagIcon && (
                        <TagIcon 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isSelected ? 'text-amber-400 scale-110' : `${iconColor} group-hover:scale-105`
                          }`} 
                        />
                      )}
                      
                      {/* 名称 */}
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isSelected ? 'text-amber-400' : 'text-surface-200 group-hover:text-surface-100'
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
      </div>

      {/* 已选标签汇总 */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface-800">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400/20 to-amber-500/10 rounded-lg border border-amber-400/40">
                <span className="text-sm font-semibold text-amber-400">
                  已选 {selectedTags.length} 个标签
                </span>
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                {selectedTagObjects.map((tag) => {
                  const iconConfig = getTagIconConfig(tag.dimension, tag.name)
                  const TagIcon = iconConfig?.icon
                  return (
                    <motion.button
                      key={tag.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => toggleTag(tag.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-400/15 text-amber-400 rounded-md text-xs hover:bg-amber-400/25 transition-colors"
                    >
                      {TagIcon && <TagIcon className="w-3 h-3" />}
                      <span>{tag.name}</span>
                      <X className="w-3 h-3" />
                    </motion.button>
                  )
                })}
              </div>
              <button
                onClick={clearAll}
                className="flex-shrink-0 text-xs text-surface-400 hover:text-amber-400 transition-colors px-2 py-1 rounded hover:bg-surface-800"
              >
                清除全部
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SubcategoryTags
