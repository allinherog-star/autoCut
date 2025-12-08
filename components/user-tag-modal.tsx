'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import {
  createCategoryTag,
  deleteCategoryTag,
  type CategoryDimension,
  type CategoryTag,
} from '@/lib/api/categories'

interface UserTagModalProps {
  isOpen: boolean
  onClose: () => void
  onTagCreated: () => void
  userTags: CategoryTag[]
}

// 可用的维度选项
const DIMENSION_OPTIONS: { value: CategoryDimension; label: string }[] = [
  { value: 'STYLE', label: '表现力' },
  { value: 'EMOTION', label: '情绪' },
  { value: 'SCENE', label: '时机' },
  { value: 'INDUSTRY', label: '类型' },
]

// 预设颜色
const PRESET_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
]

export function UserTagModal({ isOpen, onClose, onTagCreated, userTags }: UserTagModalProps) {
  const [dimension, setDimension] = useState<CategoryDimension>('STYLE')
  const [name, setName] = useState('')
  const [color, setColor] = useState('#4CAF50')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 创建标签
  const handleCreate = async () => {
    if (!name.trim()) {
      setError('请输入标签名称')
      return
    }

    setCreating(true)
    setError(null)

    const response = await createCategoryTag({
      dimension,
      name: name.trim(),
      color,
      description: description.trim() || undefined,
    })

    if (response.success) {
      setName('')
      setDescription('')
      onTagCreated()
    } else {
      setError(response.error || '创建失败')
    }

    setCreating(false)
  }

  // 删除标签
  const handleDelete = async (id: string) => {
    setDeleting(id)
    const response = await deleteCategoryTag(id)
    if (response.success) {
      onTagCreated()
    }
    setDeleting(null)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-surface-900 rounded-2xl border border-surface-700 shadow-2xl overflow-hidden"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
            <h2 className="text-lg font-semibold text-surface-100">管理我的标签</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6 space-y-6">
            {/* 创建新标签 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-surface-300">创建新标签</h3>
              
              {/* 维度选择 */}
              <div className="flex flex-wrap gap-2">
                {DIMENSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDimension(opt.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${dimension === opt.value
                        ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                        : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-500'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* 名称输入 */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="标签名称"
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-amber-400/50"
              />

              {/* 颜色选择 */}
              <div className="space-y-2">
                <span className="text-xs text-surface-500">选择颜色</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`
                        w-7 h-7 rounded-full transition-all
                        ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-900' : 'hover:scale-110'}
                      `}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* 描述 */}
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述（可选）"
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-amber-400/50"
              />

              {/* 错误提示 */}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              {/* 创建按钮 */}
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    创建标签
                  </>
                )}
              </Button>
            </div>

            {/* 我的标签列表 */}
            {userTags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-surface-300">我的标签</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between px-3 py-2 bg-surface-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#808080' }}
                        />
                        <span className="text-sm text-surface-200">{tag.name}</span>
                        <span className="text-xs text-surface-500">
                          {DIMENSION_OPTIONS.find((d) => d.value === tag.dimension)?.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        disabled={deleting === tag.id}
                        className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-surface-700 transition-colors disabled:opacity-50"
                      >
                        {deleting === tag.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UserTagModal



