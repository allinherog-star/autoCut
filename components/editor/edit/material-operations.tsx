'use client'

/**
 * 素材功能操作区组件 - 根据素材类型显示不同操作
 * Material Operations Component - Shows different operations based on material type
 */

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scissors,
  Volume2,
  VolumeX,
  FastForward,
  Crop,
  RotateCw,
  Palette,
  Sparkles,
  Type,
  AlignCenter,
  Bold,
  Italic,
  Move,
  ZoomIn,
  Layers,
  Trash2,
  Copy,
  Undo2,
  Filter,
  Wand2,
} from 'lucide-react'
import { useTimelineStore } from '@/lib/timeline/store'
import type { TrackType, Clip, Track, VEIRProject } from '@/lib/veir/types'
import { getAssetDisplayName } from './clip-display'

interface MaterialOperationsProps {
  /** 选中的素材 ID */
  selectedClipId: string | null
  /** 选中的轨道 ID */
  selectedTrackId: string | null
  /** 可选：VEIR 项目（用于把 assetId 映射成更贴近预览的显示名） */
  veirProject?: VEIRProject | null
  /** 自定义类名 */
  className?: string
}

// 操作按钮配置
interface OperationButton {
  id: string
  label: string
  icon: React.ElementType
  action?: () => void
  variant?: 'default' | 'danger'
}

// 通用操作
const COMMON_OPERATIONS: OperationButton[] = [
  { id: 'copy', label: '复制', icon: Copy },
  { id: 'delete', label: '删除', icon: Trash2, variant: 'danger' },
]

// 视频操作
const VIDEO_OPERATIONS: OperationButton[] = [
  { id: 'split', label: '分割', icon: Scissors },
  { id: 'crop', label: '裁剪', icon: Crop },
  { id: 'speed', label: '变速', icon: FastForward },
  { id: 'rotate', label: '旋转', icon: RotateCw },
  { id: 'filter', label: '滤镜', icon: Filter },
  { id: 'mute', label: '静音', icon: VolumeX },
]

// 音频操作
const AUDIO_OPERATIONS: OperationButton[] = [
  { id: 'split', label: '分割', icon: Scissors },
  { id: 'volume', label: '音量', icon: Volume2 },
  { id: 'speed', label: '变速', icon: FastForward },
  { id: 'fade', label: '淡入淡出', icon: Sparkles },
]

// 文字操作
const TEXT_OPERATIONS: OperationButton[] = [
  { id: 'edit', label: '编辑文字', icon: Type },
  { id: 'style', label: '样式', icon: Palette },
  { id: 'align', label: '对齐', icon: AlignCenter },
  { id: 'bold', label: '加粗', icon: Bold },
  { id: 'animation', label: '动画', icon: Sparkles },
]

// 贴纸/图片操作
const PIP_OPERATIONS: OperationButton[] = [
  { id: 'position', label: '位置', icon: Move },
  { id: 'scale', label: '缩放', icon: ZoomIn },
  { id: 'layer', label: '图层', icon: Layers },
  { id: 'animation', label: '动画', icon: Sparkles },
  { id: 'opacity', label: '透明度', icon: Filter },
]

// 根据轨道类型获取操作列表
const getOperationsByType = (type: TrackType): OperationButton[] => {
  switch (type) {
    case 'video':
      return VIDEO_OPERATIONS
    case 'audio':
      return AUDIO_OPERATIONS
    case 'text':
      return TEXT_OPERATIONS
    case 'subtitle':
      return TEXT_OPERATIONS
    case 'pip':
      return PIP_OPERATIONS
    default:
      return []
  }
}

// 类型标题配置
const TYPE_TITLES: Record<TrackType, { label: string; description: string }> = {
  video: { label: '视频操作', description: '裁剪、变速、滤镜等' },
  audio: { label: '音频操作', description: '音量、淡入淡出等' },
  text: { label: '文字操作', description: '样式、动画、对齐等' },
  subtitle: { label: '字幕操作', description: '编辑、样式、动画等' },
  pip: { label: '贴纸/图片操作', description: '位置、缩放、图层等' },
}

export function MaterialOperations({
  selectedClipId,
  selectedTrackId,
  veirProject,
  className = '',
}: MaterialOperationsProps) {
  const { data, removeClip, playback, seek } = useTimelineStore()
  
  // 查找选中的素材和轨道
  const selectedInfo = useMemo(() => {
    if (!selectedClipId || !selectedTrackId) return null
    
    const track = data.tracks.find(t => t.id === selectedTrackId)
    if (!track) return null
    
    const clip = track.clips.find(c => c.id === selectedClipId)
    if (!clip) return null
    
    return { clip, track }
  }, [selectedClipId, selectedTrackId, data.tracks])

  // 处理操作点击
  const handleOperation = (operationId: string) => {
    if (!selectedInfo) return
    
    switch (operationId) {
      case 'delete':
        removeClip(selectedInfo.track.id, selectedInfo.clip.id)
        break
      case 'copy':
        // TODO: 实现复制功能
        console.log('复制素材:', selectedInfo.clip.asset)
        break
      case 'split':
        // TODO: 实现分割功能
        console.log('分割素材:', selectedInfo.clip.asset)
        break
      default:
        console.log('操作:', operationId, selectedInfo.clip.asset)
    }
  }

  // 空状态
  if (!selectedInfo) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <div className="text-center px-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#252528] flex items-center justify-center">
            <Wand2 className="w-8 h-8 text-[#444]" />
          </div>
          <h3 className="text-sm font-medium text-[#888] mb-2">选择素材进行操作</h3>
          <p className="text-xs text-[#555] leading-relaxed">
            从左侧素材列表选择一个素材，<br />
            或在时间轴上点击素材片段
          </p>
        </div>
      </div>
    )
  }

  const typeConfig = TYPE_TITLES[selectedInfo.track.type]
  const operations = getOperationsByType(selectedInfo.track.type)
  const clipLabel = getAssetDisplayName(veirProject, selectedInfo.clip.asset)

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 当前素材信息 */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#2a2a2e]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <h3 className="text-sm font-medium text-[#eee] truncate">
            {clipLabel}
          </h3>
        </div>
        {veirProject && clipLabel !== selectedInfo.clip.asset && (
          <p className="text-[11px] text-[#555] mt-1 font-mono truncate">{selectedInfo.clip.asset}</p>
        )}
        <p className="text-xs text-[#666] mt-1">
          {typeConfig.label} · {typeConfig.description}
        </p>
      </div>

      {/* 操作按钮网格 */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedInfo.track.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 类型专属操作 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {operations.map(op => (
                <OperationButtonComponent
                  key={op.id}
                  operation={op}
                  onClick={() => handleOperation(op.id)}
                />
              ))}
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-[#2a2a2e] my-4" />

            {/* 通用操作 */}
            <div className="grid grid-cols-2 gap-2">
              {COMMON_OPERATIONS.map(op => (
                <OperationButtonComponent
                  key={op.id}
                  operation={op}
                  onClick={() => handleOperation(op.id)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 快速调整滑块 - 根据类型显示 */}
      <div className="flex-shrink-0 px-4 pb-4">
        {selectedInfo.track.type === 'video' && (
          <QuickSlider label="播放速度" value={100} unit="%" min={25} max={400} />
        )}
        {selectedInfo.track.type === 'audio' && (
          <QuickSlider label="音量" value={100} unit="%" min={0} max={200} />
        )}
        {selectedInfo.track.type === 'pip' && (
          <QuickSlider label="缩放" value={100} unit="%" min={10} max={300} />
        )}
      </div>
    </div>
  )
}

// 操作按钮组件
function OperationButtonComponent({
  operation,
  onClick,
}: {
  operation: OperationButton
  onClick: () => void
}) {
  const Icon = operation.icon
  const isDanger = operation.variant === 'danger'
  
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl
        transition-all duration-200 group
        ${isDanger 
          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' 
          : 'bg-[#252528] hover:bg-[#2f2f32] text-[#999] hover:text-[#eee]'
        }
      `}
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="text-xs">{operation.label}</span>
    </button>
  )
}

// 快速调整滑块组件
function QuickSlider({
  label,
  value,
  unit,
  min,
  max,
}: {
  label: string
  value: number
  unit: string
  min: number
  max: number
}) {
  const [currentValue, setCurrentValue] = React.useState(value)
  
  return (
    <div className="bg-[#1e1e22] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#888]">{label}</span>
        <span className="text-xs font-mono text-[#ccc]">{currentValue}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onChange={(e) => setCurrentValue(Number(e.target.value))}
        className="w-full h-1.5 bg-[#333] rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-amber-400
          [&::-webkit-slider-thumb]:hover:bg-amber-300
          [&::-webkit-slider-thumb]:transition-colors"
      />
    </div>
  )
}

