'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Spinner } from '@/components/ui'
import {
  getAllCategories,
  type CategoryTag,
  type DimensionGroup,
  DIMENSION_NAMES,
} from '@/lib/api/categories'
import {
  DIMENSION_ICONS,
  DIMENSION_COLORS,
  getTagIconConfig,
} from '@/lib/icons'

interface CategoryFilterProps {
  selectedTags: string[] // 选中的标签 ID
  onTagsChange: (tags: string[]) => void
  className?: string
}

export function CategoryFilter({
  selectedTags,
  onTagsChange,
  className = '',
}: CategoryFilterProps) {
  const [dimensions, setDimensions] = useState<DimensionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDimensions, setExpandedDimensions] = useState<string[]>(['EMOTION', 'INDUSTRY'])
  const [showAll, setShowAll] = useState(false)

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

  // 搜索过滤
  const filteredDimensions = useMemo(() => {
    if (!searchQuery.trim()) return dimensions

    const query = searchQuery.toLowerCase()
    return dimensions
      .map((dim) => ({
        ...dim,
        tags: dim.tags.filter(
          (tag) =>
            tag.name.toLowerCase().includes(query) ||
            (tag.nameEn && tag.nameEn.toLowerCase().includes(query)) ||
            (tag.description && tag.description.toLowerCase().includes(query))
        ),
      }))
      .filter((dim) => dim.tags.length > 0)
  }, [dimensions, searchQuery])

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

  // 切换维度展开状态
  const toggleDimension = (dimension: string) => {
    setExpandedDimensions((prev) =>
      prev.includes(dimension)
        ? prev.filter((d) => d !== dimension)
        : [...prev, dimension]
    )
  }

  // 获取选中的标签对象
  const selectedTagObjects = useMemo(() => {
    const allTags = dimensions.flatMap((d) => d.tags)
    return selectedTags.map((id) => allTags.find((t) => t.id === id)).filter(Boolean) as CategoryTag[]
  }, [dimensions, selectedTags])

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 搜索框 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="text"
          placeholder="搜索分类标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-10 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-amber-400/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div className="mb-4 p-3 bg-amber-400/10 border border-amber-400/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-400">
              已选 {selectedTags.length} 个标签
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-surface-400 hover:text-surface-200"
            >
              清除全部
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedTagObjects.map((tag) => {
              const iconConfig = getTagIconConfig(tag.dimension, tag.name)
              const TagIcon = iconConfig?.icon
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-amber-400/20 text-amber-400 rounded-md text-xs hover:bg-amber-400/30 transition-colors"
                >
                  {TagIcon && <TagIcon className="w-3 h-3" />}
                  <span>{tag.name}</span>
                  <X className="w-3 h-3" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 分类维度列表 */}
      <div className="space-y-3">
        {(showAll ? filteredDimensions : filteredDimensions.slice(0, 4)).map((dim) => {
          const isExpanded = expandedDimensions.includes(dim.dimension) || searchQuery.trim()
          const DimensionIcon = DIMENSION_ICONS[dim.dimension]
          const colors = DIMENSION_COLORS[dim.dimension] || { text: 'text-surface-400', bg: 'bg-surface-800' }

          return (
            <div key={dim.dimension} className="border border-surface-700 rounded-lg overflow-hidden">
              {/* 维度标题 */}
              <button
                onClick={() => toggleDimension(dim.dimension)}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface-800/50 hover:bg-surface-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {DimensionIcon && <DimensionIcon className={`w-4 h-4 ${colors.text}`} />}
                  <span className="font-medium text-surface-100">{dim.name}</span>
                  <span className="text-xs text-surface-500">({dim.tags.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-surface-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-surface-500" />
                )}
              </button>

              {/* 标签列表 */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 flex flex-wrap gap-2">
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
                              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all
                              ${isSelected
                                ? 'bg-amber-400 text-surface-950 shadow-lg shadow-amber-400/20'
                                : 'bg-surface-700 text-surface-200 hover:bg-surface-600'
                              }
                            `}
                          >
                            {TagIcon && (
                              <TagIcon 
                                className={`w-3.5 h-3.5 ${isSelected ? 'text-surface-950' : iconColor}`} 
                              />
                            )}
                            <span>{tag.name}</span>
                            {isSelected && <X className="w-3 h-3" />}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* 显示更多/收起 */}
      {filteredDimensions.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
        >
          {showAll ? '收起' : `显示全部 ${filteredDimensions.length} 个维度`}
        </button>
      )}
    </div>
  )
}

export default CategoryFilter
