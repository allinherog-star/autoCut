'use client'

/**
 * 视频预览区组件 - 支持素材拖拽调整位置
 * Video Preview Panel Component - Supports dragging materials to adjust position
 * 
 * 使用 UniversalPreview 组件实现专业级预览，支持：
 * - 三层坐标系统（Content/Canvas/View Space）
 * - 多比例自适应
 * - 网格/安全区/中心线辅助
 * 
 * 选中/拖拽体验设计（对标 PR/AE/Figma）：
 * - 选中：高亮边框 + 8 个控制点 + 浮动标签
 * - 拖拽：实时跟随 + 吸附参考线 + 位移投影
 * - 松手：位置写入 VEIR，Canvas 重新渲染后交互层同步
 */

import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react'
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
import type { Clip, Track, VEIRProject } from '@/lib/veir/types'
import { VEIRCanvasPreview } from './veir-canvas-preview'
import { UniversalPreview, type UniversalPreviewRef } from '@/components/ui/universal-preview'
import { getAssetDisplayName } from './clip-display'
import type { ElementBounds } from '@/lib/modern-composer'

type TargetDevice = 'phone' | 'pc'

type DeviceConfig = {
  id: TargetDevice
  name: string
  description?: string
  aspectRatio: string
  width: number
  height: number
}

interface VideoPreviewPanelProps {
  /** 选中的素材 ID */
  selectedClipId: string | null
  /** 选中的轨道 ID */
  selectedTrackId: string | null
  /** 目标设备（决定预览比例） */
  targetDevice: TargetDevice
  /** 目标设备配置（决定预览分辨率与比例） */
  deviceConfig: DeviceConfig
  /** 可选：完整 VEIR 项目（用于加载真实素材并按 vocabulary/adjustments 渲染） */
  veirProject?: VEIRProject | null
  /** 素材位置变化回调 */
  onClipPositionChange?: (clipId: string, x: number, y: number) => void
  /** 素材变换变化回调（推荐：写回 VEIR adjustments.video.transform） */
  onClipTransformChange?: (
    clipId: string,
    patch: { xPercent?: number; yPercent?: number; scale?: number; rotation?: number }
  ) => void
  /** 选中素材回调 */
  onSelectClip?: (clipId: string, trackId: string) => void
  /** 自定义类名 */
  className?: string
}

// 素材位置数据（百分比坐标）
interface ClipPosition {
  x: number  // 0-100 百分比
  y: number  // 0-100 百分比
  scale: number
  rotation: number
}

type DragPhase = 'idle' | 'pending' | 'dragging'

type SnapGuideState = {
  v: number | null
  h: number | null
}

type DragSession = {
  phase: DragPhase
  clipId: string | null
  trackId: string | null
  pointerId: number | null
  startClientX: number
  startClientY: number
  startPosX: number
  startPosY: number
  lastX: number
  lastY: number
  moved: boolean
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
  targetDevice,
  deviceConfig,
  veirProject,
  onClipPositionChange,
  onClipTransformChange,
  onSelectClip,
  className = '',
}: VideoPreviewPanelProps) {
  const { data, playback, togglePlay, seek, pause, play } = useTimelineStore()

  // UniversalPreview 组件引用
  const universalPreviewRef = useRef<UniversalPreviewRef>(null)

  // 内容分辨率：优先使用 VEIR 项目的分辨率，确保预览与导出一致
  const contentResolution: [number, number] = useMemo(() => {
    if (veirProject?.meta?.resolution) {
      return veirProject.meta.resolution as [number, number]
    }
    return [deviceConfig.width, deviceConfig.height]
  }, [veirProject?.meta?.resolution, deviceConfig.width, deviceConfig.height])

  // 状态
  const [isMuted, setIsMuted] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  
  // 拖拽时的临时位置覆盖（仅在拖拽过程中使用，松手后清除）
  const [dragOverride, setDragOverride] = useState<{ clipId: string; x: number; y: number } | null>(null)

  // 严格比例预览内框（现在由 UniversalPreview 组件处理）
  const viewportRef = useRef<HTMLDivElement>(null)
  const [frameSize, setFrameSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  // 拖拽/吸附状态（PR/AE 风格：直接拖拽选中框/对象命中区域）
  const dragSessionRef = useRef<DragSession>({
    phase: 'idle',
    clipId: null,
    trackId: null,
    pointerId: null,
    startClientX: 0,
    startClientY: 0,
    startPosX: 0,
    startPosY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
  })
  const [dragUI, setDragUI] = useState<{ phase: DragPhase; clipId: string | null }>({ phase: 'idle', clipId: null })
  const [snapGuides, setSnapGuides] = useState<SnapGuideState>({ v: null, h: null })
  const [isPreviewHot, setIsPreviewHot] = useState(false)
  const [boundsByClipId, setBoundsByClipId] = useState<Record<string, ElementBounds>>({})
  const resumeAfterDragRef = useRef(false)

  // 监听可用空间变化，计算严格比例内框尺寸
  // 关键：使用 VEIR 项目的分辨率 (meta.resolution) 确保预览与导出效果一致
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    // 优先使用 VEIR 项目分辨率，回退到 deviceConfig
    // 这确保预览比例与导出完全一致（类似 PR/AE 的 WYSIWYG 体验）
    const [veirW, veirH] = veirProject?.meta?.resolution || [0, 0]
    const ratio = veirW > 0 && veirH > 0
      ? veirW / veirH
      : (deviceConfig.width > 0 && deviceConfig.height > 0 ? deviceConfig.width / deviceConfig.height : 16 / 9)

    const compute = () => {
      const rect = el.getBoundingClientRect()
      const availableW = Math.max(0, rect.width)
      const availableH = Math.max(0, rect.height)
      if (availableW === 0 || availableH === 0) return

      let width = availableW
      let height = width / ratio
      if (height > availableH) {
        height = availableH
        width = height * ratio
      }

      // 避免小数导致的抖动
      const next = { width: Math.floor(width), height: Math.floor(height) }
      setFrameSize(prev => (prev.width === next.width && prev.height === next.height ? prev : next))
    }

    const rafCompute = () => requestAnimationFrame(compute)
    const timer = window.setTimeout(rafCompute, 0)

    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(rafCompute)
      ro.observe(el)
    } catch {
      // 降级：无 ResizeObserver 时不做自动监听
    }

    return () => {
      window.clearTimeout(timer)
      ro?.disconnect()
    }
  }, [veirProject?.meta?.resolution, deviceConfig.width, deviceConfig.height])

  // 获取选中素材信息
  const selectedClipInfo = useMemo(() => {
    if (!selectedClipId || !selectedTrackId) return null

    const track = data.tracks.find(t => t.id === selectedTrackId)
    if (!track) return null

    const clip = track.clips.find(c => c.id === selectedClipId)
    if (!clip) return null

    return { clip, track }
  }, [selectedClipId, selectedTrackId, data.tracks])

  // 从 VEIR project 获取素材（若提供）
  const getAsset = useCallback((assetId: string) => {
    return veirProject?.assets.assets?.[assetId]
  }, [veirProject])

  // 从 VEIR clipOverrides 读取位置
  const readTransformFromVEIR = useCallback((clipId: string): ClipPosition | null => {
    if (!veirProject) return null
    const t = veirProject.adjustments?.clipOverrides?.[clipId]?.video?.transform
    if (!t?.offset) return null

    const [w, h] = veirProject.meta.resolution
    const x = (t.offset[0] / w) * 100
    const y = (t.offset[1] / h) * 100
    const scale = typeof t.scale === 'number' ? t.scale * 100 : DEFAULT_POSITION.scale
    const rotation = typeof t.rotation === 'number' ? t.rotation : DEFAULT_POSITION.rotation

    return {
      x: Number.isFinite(x) ? x : DEFAULT_POSITION.x,
      y: Number.isFinite(y) ? y : DEFAULT_POSITION.y,
      scale,
      rotation,
    }
  }, [veirProject])

  // 从 Canvas bounds 计算锚点位置（用于交互层定位）
  // 关键：根据轨道类型和布局返回正确的锚点位置（而非包围盒中心）
  // - 字幕：originY 取决于 track.layout.position（'top' 或 'bottom'）
  // - 文本/PIP：originY='center'
  const getPositionFromBounds = useCallback((
    clipId: string, 
    trackType: string,
    trackLayout?: { position?: 'top' | 'bottom' }
  ): { x: number; y: number } | null => {
    const bounds = boundsByClipId[clipId]
    if (!bounds) return null
    
    const [cw, ch] = contentResolution
    if (cw <= 0 || ch <= 0) return null
    
    // originX 始终是 'center'
    const anchorX = ((bounds.left + bounds.width / 2) / cw) * 100
    
    // originY 取决于轨道类型和布局
    let anchorY: number
    if (trackType === 'subtitle') {
      // 字幕的 originY 取决于 layout.position
      const position = trackLayout?.position ?? 'bottom'
      if (position === 'top') {
        // originY: 'top' - 锚点在顶部边缘
        anchorY = (bounds.top / ch) * 100
      } else {
        // originY: 'bottom' - 锚点在底部边缘
        anchorY = ((bounds.top + bounds.height) / ch) * 100
      }
    } else {
      // 文本、PIP 使用 originY: 'center'
      anchorY = ((bounds.top + bounds.height / 2) / ch) * 100
    }
    
    return { x: anchorX, y: anchorY }
  }, [boundsByClipId, contentResolution])

  // 获取素材位置：优先拖拽覆盖 > Canvas bounds > VEIR > 默认
  // trackLayout 用于字幕元素确定 originY
  const getClipPosition = useCallback((
    clipId: string, 
    trackType: string,
    trackLayout?: { position?: 'top' | 'bottom' }
  ): ClipPosition => {
    // 1. 拖拽时使用临时覆盖位置
    if (dragOverride?.clipId === clipId) {
      return {
        ...DEFAULT_POSITION,
        x: dragOverride.x,
        y: dragOverride.y,
      }
    }

    // 2. 尝试从 Canvas bounds 获取锚点位置（最准确的当前渲染位置）
    const boundsPos = getPositionFromBounds(clipId, trackType, trackLayout)
    if (boundsPos) {
      return {
        ...DEFAULT_POSITION,
        x: boundsPos.x,
        y: boundsPos.y,
      }
    }

    // 3. 从 VEIR clipOverrides 读取
    const veirPos = readTransformFromVEIR(clipId)
    if (veirPos) return veirPos

    // 4. 根据轨道类型返回默认位置
    return {
      ...DEFAULT_POSITION,
      x: trackType === 'pip' ? 75 : 50,
      y: trackType === 'pip' ? 25 : trackType === 'subtitle' ? 88 : 85,
    }
  }, [dragOverride, getPositionFromBounds, readTransformFromVEIR])

  // 获取当前选中素材的位置
  const currentPosition = useMemo(() => {
    if (!selectedClipId) return DEFAULT_POSITION

    const track = selectedTrackId
      ? data.tracks.find(t => t.id === selectedTrackId)
      : data.tracks.find(t => t.clips.some(c => c.id === selectedClipId))
    const trackType = track?.type || 'text'
    const trackLayout = (track?.layout || {}) as { position?: 'top' | 'bottom' }

    return getClipPosition(selectedClipId, trackType, trackLayout)
  }, [selectedClipId, selectedTrackId, data.tracks, getClipPosition])

  // 获取当前时间点可见的所有素材（用于交互层渲染）
  const visibleClips = useMemo(() => {
    const clips: Array<{ clip: Clip; track: Track; position: ClipPosition }> = []

    data.tracks.forEach(track => {
      // 预览区可交互/可拖拽对象：overlay 类型（不包含 audio；video 由底层 Canvas 渲染）
      if (track.type === 'pip' || track.type === 'text' || track.type === 'subtitle') {
        const trackLayout = (track.layout || {}) as { position?: 'top' | 'bottom' }
        track.clips.forEach(clip => {
          if (playback.currentTime >= clip.time.start && playback.currentTime <= clip.time.end) {
            clips.push({
              clip,
              track,
              position: getClipPosition(clip.id, track.type, trackLayout),
            })
          }
        })
      }
    })

    // 按 track.layer 排序，layer 越大越靠上
    clips.sort((a, b) => (a.track.layer || 0) - (b.track.layer || 0))

    return clips
  }, [data.tracks, playback.currentTime, getClipPosition])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 开始拖拽（PR/AE：按下即选中；移动超过阈值才进入 dragging）
  const beginDrag = useCallback((e: React.PointerEvent, clipId: string, trackId: string, track: Track) => {
    // 仅左键/主指针触发拖拽（桌面剪辑体验）
    if (typeof e.button === 'number' && e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    // 立即选中（即使不移动也会选中）
    onSelectClip?.(clipId, trackId)
    if (isLocked) return

    // 关键修复：使用 getClipPosition 获取锚点位置作为拖拽起点
    // 这确保拖拽起点与元素的实际锚点一致（字幕用底部锚点，文本/PIP用中心锚点）
    const trackLayout = (track.layout || {}) as { position?: 'top' | 'bottom' }
    const pos = getClipPosition(clipId, track.type, trackLayout)
    
    dragSessionRef.current = {
      phase: 'pending',
      clipId,
      trackId,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      lastX: pos.x,
      lastY: pos.y,
      moved: false,
    }
    setDragUI({ phase: 'pending', clipId })

    // 捕获指针：拖出边界仍持续接收 move/up（更像 PR/AE）
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }, [isLocked, getClipPosition, onSelectClip])

  // PR/AE：方向键微调位置（仅当鼠标悬停在预览区域时生效）
  useEffect(() => {
    if (!isPreviewHot) return
    if (!selectedClipId) return

    const isTypingTarget = (el: EventTarget | null) => {
      const node = el as HTMLElement | null
      if (!node) return false
      const tag = node.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
      if ((node as unknown as { isContentEditable?: boolean }).isContentEditable) return true
      return false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return
      if (isTypingTarget(e.target)) return
      if (e.metaKey || e.ctrlKey) return

      const isArrow =
        e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown'
      if (!isArrow) return
      e.preventDefault()

      const base = e.altKey ? 0.2 : e.shiftKey ? 2 : 0.5 // percent
      const dx = e.key === 'ArrowLeft' ? -base : e.key === 'ArrowRight' ? base : 0
      const dy = e.key === 'ArrowUp' ? -base : e.key === 'ArrowDown' ? base : 0

      const nextX = Math.max(0, Math.min(100, currentPosition.x + dx))
      const nextY = Math.max(0, Math.min(100, currentPosition.y + dy))
      setSnapGuides({ v: null, h: null })
      
      // 直接写入 VEIR（让 Canvas 重新渲染）
      onClipTransformChange?.(selectedClipId, { xPercent: nextX, yPercent: nextY })
      onClipPositionChange?.(selectedClipId, nextX, nextY)
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPreviewHot, selectedClipId, isLocked, currentPosition.x, currentPosition.y, onClipTransformChange, onClipPositionChange])

  const computeSnapped = useCallback((raw: { x: number; y: number }, opts: { altKey?: boolean; showGrid?: boolean }) => {
    // alt/option：临时禁用吸附（对标 PR）
    if (opts.altKey) return { ...raw, guides: { v: null, h: null } }

    const threshold = 0.8 // percent
    const snaps: number[] = [50]
    if (opts.showGrid) {
      snaps.push(33.3333, 66.6667)
    }

    let x = raw.x
    let y = raw.y
    let v: number | null = null
    let h: number | null = null

    for (const s of snaps) {
      if (Math.abs(x - s) <= threshold) {
        x = s
        v = s
        break
      }
    }
    for (const s of snaps) {
      if (Math.abs(y - s) <= threshold) {
        y = s
        h = s
        break
      }
    }

    return { x, y, guides: { v, h } }
  }, [])

  const updateDrag = useCallback((e: React.PointerEvent) => {
    const s = dragSessionRef.current
    if (s.phase === 'idle' || s.pointerId == null) return
    if (e.pointerId !== s.pointerId) return
    if (!s.clipId) return

    const deltaX = e.clientX - s.startClientX
    const deltaY = e.clientY - s.startClientY

    // 拖拽启动阈值：2px（避免点击选中时抖动）
    const dist2 = deltaX * deltaX + deltaY * deltaY
    if (s.phase === 'pending' && dist2 < 4) return

    if (s.phase !== 'dragging') {
      s.phase = 'dragging'
      s.moved = true
      setDragUI({ phase: 'dragging', clipId: s.clipId })
      // 拖拽开始：自动暂停播放（对标 PR/AE，拖拽期间不允许播放）
      if (playback.isPlaying) {
        resumeAfterDragRef.current = true
        pause()
      } else {
        resumeAfterDragRef.current = false
      }
    }

    // 使用 UniversalPreview 坐标系统换算位移，兼容 zoom/fit/居中偏移
    const deltaNormalized = universalPreviewRef.current?.viewDeltaToContentDelta({ x: deltaX, y: deltaY })
    if (!deltaNormalized) return
    const deltaXPercent = deltaNormalized.x * 100
    const deltaYPercent = deltaNormalized.y * 100

    const rawX = Math.max(0, Math.min(100, s.startPosX + deltaXPercent))
    const rawY = Math.max(0, Math.min(100, s.startPosY + deltaYPercent))

    const snapped = computeSnapped({ x: rawX, y: rawY }, { altKey: e.altKey, showGrid })
    setSnapGuides(snapped.guides)

    s.lastX = snapped.x
    s.lastY = snapped.y

    // 拖拽时：设置临时覆盖位置（用于交互层实时跟随）
    setDragOverride({ clipId: s.clipId, x: snapped.x, y: snapped.y })
    
    // 同时实时更新 VEIR（让 Canvas 也跟着动）
    onClipTransformChange?.(s.clipId, { xPercent: snapped.x, yPercent: snapped.y })
  }, [computeSnapped, showGrid, pause, playback.isPlaying, onClipTransformChange])

  const endDrag = useCallback((e: React.PointerEvent) => {
    const s = dragSessionRef.current
    if (s.phase === 'idle' || s.pointerId == null) return
    if (e.pointerId !== s.pointerId) return
    if (!s.clipId) return

    // 最终落点写回 VEIR
    onClipTransformChange?.(s.clipId, { xPercent: s.lastX, yPercent: s.lastY })
    onClipPositionChange?.(s.clipId, s.lastX, s.lastY)

    // 清除临时覆盖（让交互层从 Canvas bounds 获取位置）
    setDragOverride(null)

    dragSessionRef.current = {
      phase: 'idle',
      clipId: null,
      trackId: null,
      pointerId: null,
      startClientX: 0,
      startClientY: 0,
      startPosX: 0,
      startPosY: 0,
      lastX: 0,
      lastY: 0,
      moved: false,
    }
    setDragUI({ phase: 'idle', clipId: null })
    setSnapGuides({ v: null, h: null })

    // 拖拽结束：按需恢复播放
    if (resumeAfterDragRef.current) {
      resumeAfterDragRef.current = false
      play()
    }

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }, [onClipPositionChange, onClipTransformChange, play])

  // 调整缩放
  const handleScaleChange = (delta: number) => {
    if (!selectedClipId) return
    const nextScale = Math.max(10, Math.min(300, currentPosition.scale + delta))
    setClipPositions(prev => ({ ...prev, [selectedClipId]: { ...currentPosition, scale: nextScale } }))
    // scale 传 UI 百分比（100=100%），由上层写回 VEIR 时再换算为 ratio
    onClipTransformChange?.(selectedClipId, { scale: nextScale })
  }

  // 重置位置
  const handleResetPosition = () => {
    if (!selectedClipId) return
    setClipPositions(prev => ({
      ...prev,
      [selectedClipId]: DEFAULT_POSITION,
    }))
    onClipTransformChange?.(selectedClipId, {
      xPercent: DEFAULT_POSITION.x,
      yPercent: DEFAULT_POSITION.y,
      scale: DEFAULT_POSITION.scale,
      rotation: DEFAULT_POSITION.rotation,
    })
    onClipPositionChange?.(selectedClipId, DEFAULT_POSITION.x, DEFAULT_POSITION.y)
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
          {/* 目标设备提示：优先显示 VEIR 项目分辨率（确保预览 = 导出） */}
          <div className="hidden sm:flex items-center gap-2 mr-2 px-2 py-1 rounded bg-black/30 border border-white/10">
            <span className="text-[10px] text-[#9aa]">
              {veirProject ? '项目分辨率' : deviceConfig.name}
            </span>
            <span className="text-[10px] text-[#666] font-mono">
              {veirProject
                ? `${veirProject.meta.resolution[0]}×${veirProject.meta.resolution[1]}`
                : `${deviceConfig.width}×${deviceConfig.height}`
              }
            </span>
          </div>
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

      {/* 预览区域 - 使用 UniversalPreview 组件 */}
      <div
        className={`flex-1 relative overflow-hidden ${dragUI.phase === 'dragging' ? 'cursor-grabbing' : 'cursor-default'}`}
        onPointerEnter={() => setIsPreviewHot(true)}
        onPointerLeave={() => setIsPreviewHot(false)}
      >
        <UniversalPreview
          ref={universalPreviewRef}
          contentResolution={contentResolution}
          showGrid={showGrid}
          showCenterLines={showGrid}
          showSafeArea={true}
          showControls={false}
          className="absolute inset-0"
        >
          {/* 主视频区域 - 使用 w-full h-full 填充渲染区域 */}
          {veirProject ? (
            <VEIRCanvasPreview
              project={veirProject}
              time={playback.currentTime}
              isPlaying={playback.isPlaying}
              isMuted={isMuted}
              onOverlayBoundsChange={(bounds) => setBoundsByClipId(bounds)}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-[#252528] flex items-center justify-center">
                  <Play className="w-8 h-8 text-[#444]" />
                </div>
                <p className="text-xs text-[#555]">{formatTime(playback.currentTime)} / {formatTime(playback.duration)}</p>
              </div>
            </div>
          )}

          {/* 交互层：PR/AE 风格——命中区域与选中框一致，“所见即所拖” */}
          <div className="absolute inset-0 z-40 pointer-events-none">
            {/* 吸附参考线（拖拽中才出现） */}
            {(snapGuides.v != null || snapGuides.h != null) && (
              <div className="absolute inset-0 pointer-events-none">
                {snapGuides.v != null && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-violet-400/60"
                    style={{ left: `${snapGuides.v}%` }}
                  />
                )}
                {snapGuides.h != null && (
                  <div
                    className="absolute left-0 right-0 h-px bg-violet-400/60"
                    style={{ top: `${snapGuides.h}%` }}
                  />
                )}
              </div>
            )}

            {visibleClips.map(({ clip, track, position }) => (
              <OverlayRectInteractiveBox
                key={clip.id}
                clip={clip}
                track={track}
                position={position}
                isSelected={clip.id === selectedClipId || clip.id === dragUI.clipId}
                isDragging={clip.id === dragUI.clipId && dragUI.phase === 'dragging'}
                isLocked={isLocked}
                label={getAssetDisplayName(veirProject, clip.asset)}
                bounds={boundsByClipId[clip.id]}
                contentResolution={contentResolution}
                onPointerDown={(e) => beginDrag(e, clip.id, track.id, track)}
                onPointerMove={updateDrag}
                onPointerUp={endDrag}
              />
            ))}
          </div>
        </UniversalPreview>
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
            onClick={() => {
              if (dragUI.phase === 'dragging') return
              togglePlay()
            }}
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

/**
 * 交互层素材框组件 - 专业剪辑软件风格
 * 
 * 设计理念（对标 PR/AE/Figma）：
 * - 选中时：明亮的边框 + 8 个控制点 + 发光效果
 * - 悬停时：微弱的边框提示
 * - 拖拽时：投影效果 + 位置跟随
 */
function OverlayRectInteractiveBox({
  clip,
  track,
  position,
  isSelected,
  isDragging,
  isLocked,
  label,
  bounds,
  contentResolution,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  clip: Clip
  track: Track
  position: ClipPosition
  isSelected: boolean
  isDragging: boolean
  isLocked: boolean
  label: string
  bounds?: ElementBounds
  contentResolution: [number, number]
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
}) {
  const isPip = track.type === 'pip'
  const isSubtitle = track.type === 'subtitle'
  const isText = track.type === 'text'

  // Z-index 策略：选中/拖拽的元素置顶
  const interactionZIndex =
    100 +
    (track.layer || 0) +
    (isSelected ? 10_000 : 0) +
    (isDragging ? 20_000 : 0)

  // 从 bounds 计算位置和尺寸
  const rect = bounds ? boundsToPercentRect(bounds, contentResolution) : null
  
  // 计算位置：优先使用 bounds，否则使用 position（拖拽时）
  const boxStyle = useMemo(() => {
    if (rect) {
      return {
        left: `${rect.left}%`,
        top: `${rect.top}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
      }
    }
    // 回退：使用 position 定位（居中）
    return {
      left: `${position.x}%`,
      top: `${position.y}%`,
      width: '120px',
      height: '40px',
      transform: 'translate(-50%, -50%)',
    }
  }, [rect, position.x, position.y])

  // 选中时的颜色主题
  const themeColor = isSubtitle ? 'cyan' : isText ? 'amber' : 'pink'
  const ringColor = isSubtitle ? 'ring-cyan-400' : isText ? 'ring-amber-400' : 'ring-pink-400'
  const bgColor = isSubtitle ? 'bg-cyan-400' : isText ? 'bg-amber-400' : 'bg-pink-400'
  const glowColor = isSubtitle ? 'shadow-cyan-400/40' : isText ? 'shadow-amber-400/40' : 'shadow-pink-400/40'

  return (
    <motion.div
      className="absolute pointer-events-auto select-none"
      style={{
        ...boxStyle,
        touchAction: 'none',
        zIndex: interactionZIndex,
      }}
      initial={false}
      animate={{
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* 主交互区域 */}
      <div
        className={[
          'relative w-full h-full group rounded-lg',
          isLocked ? 'cursor-not-allowed' : isDragging ? 'cursor-grabbing' : 'cursor-move',
        ].join(' ')}
        title={label}
      >
        {/* 透明命中区域 */}
        <div className="absolute inset-0 rounded-lg" />

        {/* 悬停时的边框提示 */}
        <div
          className={[
            'absolute inset-0 rounded-lg transition-all duration-150',
            !isSelected && !isLocked ? 'opacity-0 group-hover:opacity-100 ring-1 ring-white/30' : 'opacity-0',
          ].join(' ')}
        />

        {/* 选中时的发光边框 */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={[
                'absolute -inset-0.5 rounded-lg',
                'ring-2',
                ringColor,
                isDragging ? `shadow-lg ${glowColor}` : '',
              ].join(' ')}
            />
          )}
        </AnimatePresence>

        {/* 控制点（选中且未锁定时显示） */}
        <AnimatePresence>
          {isSelected && !isLocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* 8 个控制点 */}
              {[
                { className: '-left-1.5 -top-1.5' },
                { className: 'left-1/2 -top-1.5 -translate-x-1/2' },
                { className: '-right-1.5 -top-1.5' },
                { className: '-right-1.5 top-1/2 -translate-y-1/2' },
                { className: '-right-1.5 -bottom-1.5' },
                { className: 'left-1/2 -bottom-1.5 -translate-x-1/2' },
                { className: '-left-1.5 -bottom-1.5' },
                { className: '-left-1.5 top-1/2 -translate-y-1/2' },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className={[
                    'absolute w-3 h-3 rounded-sm border-2 border-white shadow-md',
                    bgColor,
                    p.className,
                  ].join(' ')}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 选中标签 */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ top: 'calc(100% + 8px)' }}
            >
              <div
                className={[
                  'px-2.5 py-1 rounded-md text-[11px] font-medium',
                  'shadow-lg backdrop-blur-sm',
                  'flex items-center gap-1.5',
                  isSubtitle
                    ? 'bg-cyan-500/90 text-white'
                    : isText
                    ? 'bg-amber-400 text-black'
                    : 'bg-pink-400 text-white',
                ].join(' ')}
              >
                {isPip && <span>🖼️</span>}
                {isSubtitle && <span>💬</span>}
                {isText && <span>✨</span>}
                <span className="line-clamp-1 max-w-[200px]">{label}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 拖拽时的位置指示器 */}
        {isDragging && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono whitespace-nowrap">
              {Math.round(position.x)}%, {Math.round(position.y)}%
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function boundsToPercentRect(bounds: ElementBounds, contentResolution: [number, number]) {
  const [cw, ch] = contentResolution
  if (cw <= 0 || ch <= 0) return null
  const left = (bounds.left / cw) * 100
  const top = (bounds.top / ch) * 100
  const width = (bounds.width / cw) * 100
  const height = (bounds.height / ch) * 100
  if (![left, top, width, height].every(Number.isFinite)) return null
  return {
    left: Math.max(-50, Math.min(150, left)),
    top: Math.max(-50, Math.min(150, top)),
    width: Math.max(0, Math.min(200, width)),
    height: Math.max(0, Math.min(200, height)),
  }
}

