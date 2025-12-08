'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
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
const VISIBLE_DIMENSIONS: CategoryDimension[] = ['PLATFORM', 'INDUSTRY', 'SCENE', 'STYLE', 'EMOTION']

const DIMENSION_LABELS: Record<string, string> = {
  PLATFORM: '平台',
  INDUSTRY: '类型',
  SCENE: '场景',
  STYLE: '风格',
  EMOTION: '情绪',
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
      {/* 平铺的分类区域 */}
      <div className="space-y-3">
        {filteredDimensions.map((dim) => {
          const DimensionIcon = DIMENSION_ICONS[dim.dimension]
          const colors = DIMENSION_COLORS[dim.dimension] || { text: 'text-surface-400', bg: 'bg-surface-800' }
          
          return (
            <div key={dim.dimension} className="flex items-start gap-3">
              {/* 维度标签 */}
              <div className="flex-shrink-0 w-16 pt-1.5">
                <span className={`text-xs font-medium ${colors.text} flex items-center gap-1.5`}>
                  {DimensionIcon && <DimensionIcon className="w-3.5 h-3.5" />}
                  <span>{DIMENSION_LABELS[dim.dimension] || dim.name}</span>
                </span>
              </div>

              {/* 标签列表 */}
              <div className="flex-1 flex flex-wrap gap-1.5">
                {dim.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id)
                  const iconConfig = getTagIconConfig(dim.dimension, tag.name)
                  const TagIcon = iconConfig?.icon
                  const iconColor = iconConfig?.color || 'text-surface-400'
                  
                  return (
                    <motion.button
                      key={tag.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTag(tag.id)}
                      className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                        transition-all
                        ${isSelected
                          ? 'bg-amber-400 text-surface-950 shadow-sm shadow-amber-400/25'
                          : 'bg-surface-800 text-surface-300 hover:bg-surface-700 border border-surface-700/50'
                        }
                      `}
                    >
                      {TagIcon && (
                        <TagIcon 
                          className={`w-3.5 h-3.5 ${isSelected ? 'text-surface-950' : iconColor}`} 
                        />
                      )}
                      <span>{tag.name}</span>
                      {isSelected && <X className="w-3 h-3 ml-0.5" />}
                    </motion.button>
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
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-surface-800">
              <span className="text-xs text-surface-500 flex-shrink-0">
                已选 {selectedTags.length} 个:
              </span>
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
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/15 text-amber-400 rounded text-xs hover:bg-amber-400/25 transition-colors"
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
                className="flex-shrink-0 text-xs text-surface-400 hover:text-amber-400 transition-colors"
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
