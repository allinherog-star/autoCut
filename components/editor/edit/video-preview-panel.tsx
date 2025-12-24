'use client'

/**
 * 视频预览区组件 - 支持素材拖拽调整位置
 * Video Preview Panel Component - Supports dragging materials to adjust position
 */

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Move,
  Grid3X3,
  Lock,
  Unlock,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useTimelineStore } from '@/lib/timeline/store'
import type { Clip, Track } from '@/lib/veir/types'

interface VideoPreviewPanelProps {
  /** 选中的素材 ID */
  selectedClipId: string | null
  /** 选中的轨道 ID */
  selectedTrackId: string | null
  /** 素材位置变化回调 */
  onClipPositionChange?: (clipId: string, x: number, y: number) => void
  /** 自定义类名 */
  className?: string
}

// 模拟的素材位置数据
interface ClipPosition {
  x: number  // 0-100 百分比
  y: number  // 0-100 百分比
  scale: number
  rotation: number
}

// 默认位置
const DEFAULT_POSITION: ClipPosition = {
  x: 50,
  y: 50,
  scale: 100,
  rotation: 0,
}

export function VideoPreviewPanel({
  selectedClipId,
  selectedTrackId,
  onClipPositionChange,
  className = '',
}: VideoPreviewPanelProps) {
  const { data, playback, togglePlay, seek } = useTimelineStore()
  
  // 状态
  const [isMuted, setIsMuted] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [clipPositions, setClipPositions] = useState<Record<string, ClipPosition>>({})
  
  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const previewRef = useRef<HTMLDivElement>(null)

  // 获取选中素材信息
  const selectedClipInfo = useMemo(() => {
    if (!selectedClipId || !selectedTrackId) return null
    
    const track = data.tracks.find(t => t.id === selectedTrackId)
    if (!track) return null
    
    const clip = track.clips.find(c => c.id === selectedClipId)
    if (!clip) return null
    
    return { clip, track }
  }, [selectedClipId, selectedTrackId, data.tracks])

  // 获取当前素材位置
  const currentPosition = selectedClipId 
    ? (clipPositions[selectedClipId] || DEFAULT_POSITION)
    : DEFAULT_POSITION

  // 获取当前时间点可见的所有素材（用于画中画/贴纸显示）
  const visibleClips = useMemo(() => {
    const clips: Array<{ clip: Clip; track: Track; position: ClipPosition }> = []
    
    data.tracks.forEach(track => {
      if (track.type === 'pip' || track.type === 'text') {
        track.clips.forEach(clip => {
          if (playback.currentTime >= clip.time.start && playback.currentTime < clip.time.end) {
            clips.push({
              clip,
              track,
              position: clipPositions[clip.id] || {
                ...DEFAULT_POSITION,
                x: track.type === 'pip' ? 75 : 50,
                y: track.type === 'pip' ? 25 : 85,
              },
            })
          }
        })
      }
    })
    
    return clips
  }, [data.tracks, playback.currentTime, clipPositions])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 开始拖拽
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!selectedClipId || isLocked) return
    
    setIsDragging(true)
    const rect = previewRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - (rect.left + (currentPosition.x / 100) * rect.width),
        y: e.clientY - (rect.top + (currentPosition.y / 100) * rect.height),
      })
    }
  }, [selectedClipId, isLocked, currentPosition])

  // 拖拽中
  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedClipId || !previewRef.current) return
    
    const rect = previewRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100))
    
    setClipPositions(prev => ({
      ...prev,
      [selectedClipId]: { ...currentPosition, x, y },
    }))
  }, [isDragging, selectedClipId, dragOffset, currentPosition])

  // 结束拖拽
  const handleDragEnd = useCallback(() => {
    if (isDragging && selectedClipId) {
      setIsDragging(false)
      onClipPositionChange?.(selectedClipId, currentPosition.x, currentPosition.y)
    }
  }, [isDragging, selectedClipId, currentPosition, onClipPositionChange])

  // 调整缩放
  const handleScaleChange = (delta: number) => {
    if (!selectedClipId) return
    setClipPositions(prev => ({
      ...prev,
      [selectedClipId]: {
        ...currentPosition,
        scale: Math.max(10, Math.min(300, currentPosition.scale + delta)),
      },
    }))
  }

  // 重置位置
  const handleResetPosition = () => {
    if (!selectedClipId) return
    setClipPositions(prev => ({
      ...prev,
      [selectedClipId]: DEFAULT_POSITION,
    }))
  }

  return (
    <div className={`flex flex-col h-full bg-black ${className}`}>
      {/* 工具栏 */}
      <div className="flex-shrink-0 h-10 px-3 flex items-center justify-between bg-[#1a1a1e] border-b border-[#2a2a2e]">
        {/* 左侧：视图控制 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-violet-500/20 text-violet-400' : 'text-[#666] hover:text-[#999]'}`}
            title="网格参考线"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`p-1.5 rounded transition-colors ${isLocked ? 'bg-amber-500/20 text-amber-400' : 'text-[#666] hover:text-[#999]'}`}
            title={isLocked ? '解锁位置' : '锁定位置'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>

        {/* 中间：选中素材信息 */}
        {selectedClipInfo && (
          <div className="flex items-center gap-2">
            <Move className="w-3.5 h-3.5 text-[#555]" />
            <span className="text-xs text-[#888] truncate max-w-[150px]">
              {selectedClipInfo.clip.asset}
            </span>
          </div>
        )}

        {/* 右侧：缩放控制 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleScaleChange(-10)}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#666] font-mono w-10 text-center">
            {currentPosition.scale}%
          </span>
          <button
            onClick={() => handleScaleChange(10)}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetPosition}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors ml-1"
            title="重置位置"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      <div 
        ref={previewRef}
        className="flex-1 relative overflow-hidden cursor-crosshair"
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* 视频背景 - 模拟 */}
        <div className="absolute inset-4 bg-gradient-to-br from-[#1e1e22] to-[#141418] rounded-lg overflow-hidden">
          {/* 网格参考线 */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              {/* 三分线 */}
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/10" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/10" />
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/10" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/10" />
              {/* 中心线 */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-violet-500/30" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-violet-500/30" />
            </div>
          )}

          {/* 主视频区域 - 模拟 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-[#252528] flex items-center justify-center">
                <Play className="w-8 h-8 text-[#444]" />
              </div>
              <p className="text-xs text-[#555]">
                {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
              </p>
            </div>
          </div>

          {/* 可见的贴纸/画中画素材 */}
          {visibleClips.map(({ clip, track, position }) => (
            <DraggableElement
              key={clip.id}
              clip={clip}
              track={track}
              position={position}
              isSelected={clip.id === selectedClipId}
              isLocked={isLocked}
              onDragStart={handleDragStart}
            />
          ))}

          {/* 选中素材的控制框 */}
          {selectedClipInfo && (selectedClipInfo.track.type === 'pip' || selectedClipInfo.track.type === 'text') && (
            <SelectedElementOverlay
              position={currentPosition}
              isLocked={isLocked}
              onDragStart={handleDragStart}
            />
          )}
        </div>

        {/* 安全区域提示 */}
        <div className="absolute inset-4 border border-dashed border-[#333] rounded-lg pointer-events-none opacity-30" />
      </div>

      {/* 播放控制栏 */}
      <div className="flex-shrink-0 h-12 px-4 flex items-center justify-between bg-[#1a1a1e] border-t border-[#2a2a2e]">
        {/* 左侧：播放控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => seek(0)}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white transition-colors"
          >
            {playback.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => seek(playback.duration)}
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* 中间：时间进度 */}
        <div className="flex-1 mx-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#888] font-mono w-12">
              {formatTime(playback.currentTime)}
            </span>
            <div className="flex-1 h-1 bg-[#333] rounded-full overflow-hidden cursor-pointer">
              <div 
                className="h-full bg-violet-500 transition-all"
                style={{ width: `${(playback.currentTime / playback.duration) * 100}%` }}
              />
            </div>
            <span className="text-xs text-[#555] font-mono w-12">
              {formatTime(playback.duration)}
            </span>
          </div>
        </div>

        {/* 右侧：音量和全屏 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded transition-colors ${isMuted ? 'text-amber-400' : 'text-[#666] hover:text-[#999]'}`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 可拖拽元素组件
function DraggableElement({
  clip,
  track,
  position,
  isSelected,
  isLocked,
  onDragStart,
}: {
  clip: Clip
  track: Track
  position: ClipPosition
  isSelected: boolean
  isLocked: boolean
  onDragStart: (e: React.MouseEvent) => void
}) {
  const isPip = track.type === 'pip'
  
  return (
    <motion.div
      className={`
        absolute cursor-move transition-shadow
        ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black' : ''}
        ${isPip ? 'rounded-lg overflow-hidden' : ''}
      `}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scale(${position.scale / 100}) rotate(${position.rotation}deg)`,
      }}
      onMouseDown={!isLocked ? onDragStart : undefined}
      whileHover={!isLocked ? { scale: (position.scale / 100) * 1.02 } : {}}
    >
      {isPip ? (
        <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg flex items-center justify-center">
          <span className="text-2xl">{clip.asset.includes('.gif') ? '🎭' : '🖼️'}</span>
        </div>
      ) : (
        <div className="px-3 py-1.5 bg-amber-400/20 border border-amber-400/30 rounded-lg">
          <span className="text-xs text-amber-400">{clip.asset}</span>
        </div>
      )}
    </motion.div>
  )
}

// 选中元素控制框
function SelectedElementOverlay({
  position,
  isLocked,
  onDragStart,
}: {
  position: ClipPosition
  isLocked: boolean
  onDragStart: (e: React.MouseEvent) => void
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* 控制点 */}
      {!isLocked && (
        <>
          {/* 四角控制点 */}
          {[
            { x: -1, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: 1 },
          ].map((corner, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 bg-amber-400 rounded-sm pointer-events-auto cursor-nwse-resize"
              style={{
                left: `calc(50% + ${corner.x * 40}px - 5px)`,
                top: `calc(50% + ${corner.y * 40}px - 5px)`,
              }}
            />
          ))}
          
          {/* 移动手柄 */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
              w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center
              pointer-events-auto cursor-move shadow-lg"
            onMouseDown={onDragStart}
          >
            <Move className="w-3 h-3 text-black" />
          </div>
        </>
      )}
    </div>
  )
}

