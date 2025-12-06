'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Scissors,
  Copy,
  Trash2,
  Split,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Video,
  Music,
  Type,
  Layers,
  ChevronRight,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Sparkles,
} from 'lucide-react'
import { Button, Card, Badge, Slider, Tooltip, TooltipProvider } from '@/components/ui'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface TimelineClip {
  id: string
  type: 'video' | 'audio' | 'subtitle' | 'effect'
  name: string
  start: number
  duration: number
  color: string
  isSelected: boolean
}

interface Track {
  id: string
  name: string
  type: 'video' | 'audio' | 'subtitle' | 'effect'
  icon: React.ElementType
  clips: TimelineClip[]
  isMuted: boolean
  isLocked: boolean
  isVisible: boolean
}

// ============================================
// 模拟数据
// ============================================

const initialTracks: Track[] = [
  {
    id: 'video-1',
    name: '视频轨道',
    type: 'video',
    icon: Video,
    isMuted: false,
    isLocked: false,
    isVisible: true,
    clips: [
      { id: 'v1', type: 'video', name: '片段 1', start: 0, duration: 12, color: '#fbbf24', isSelected: false },
      { id: 'v2', type: 'video', name: '片段 2', start: 12, duration: 16, color: '#fbbf24', isSelected: false },
      { id: 'v3', type: 'video', name: '片段 3', start: 28, duration: 17, color: '#fbbf24', isSelected: true },
      { id: 'v4', type: 'video', name: '片段 4', start: 45, duration: 10, color: '#fbbf24', isSelected: false },
    ],
  },
  {
    id: 'audio-1',
    name: '原声',
    type: 'audio',
    icon: Volume2,
    isMuted: false,
    isLocked: false,
    isVisible: true,
    clips: [
      { id: 'a1', type: 'audio', name: '原声', start: 0, duration: 55, color: '#22c55e', isSelected: false },
    ],
  },
  {
    id: 'music-1',
    name: '背景音乐',
    type: 'audio',
    icon: Music,
    isMuted: false,
    isLocked: false,
    isVisible: true,
    clips: [
      { id: 'm1', type: 'audio', name: 'Energy Rise', start: 0, duration: 55, color: '#3b82f6', isSelected: false },
    ],
  },
  {
    id: 'subtitle-1',
    name: '字幕',
    type: 'subtitle',
    icon: Type,
    isMuted: false,
    isLocked: false,
    isVisible: true,
    clips: [
      { id: 's1', type: 'subtitle', name: '欢迎', start: 0, duration: 3, color: '#a855f7', isSelected: false },
      { id: 's2', type: 'subtitle', name: '话题', start: 3, duration: 3, color: '#a855f7', isSelected: false },
      { id: 's3', type: 'subtitle', name: '效率', start: 6, duration: 3, color: '#a855f7', isSelected: false },
      { id: 's4', type: 'subtitle', name: '太绝了', start: 9, duration: 2, color: '#a855f7', isSelected: false },
    ],
  },
  {
    id: 'effect-1',
    name: '特效',
    type: 'effect',
    icon: Layers,
    isMuted: false,
    isLocked: false,
    isVisible: true,
    clips: [
      { id: 'e1', type: 'effect', name: '标题动画', start: 0, duration: 2, color: '#f97316', isSelected: false },
      { id: 'e2', type: 'effect', name: '转场', start: 12, duration: 1, color: '#f97316', isSelected: false },
      { id: 'e3', type: 'effect', name: '转场', start: 28, duration: 1, color: '#f97316', isSelected: false },
    ],
  },
]

// ============================================
// 剪辑微调页面
// ============================================

export default function EditPage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar, hideBottomBar } = useEditor()
  const [tracks, setTracks] = useState<Track[]>(initialTracks)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(28)
  const [totalDuration] = useState(55)
  const [zoom, setZoom] = useState(100)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedTool, setSelectedTool] = useState<'select' | 'cut' | 'move'>('select')
  const timelineRef = useRef<HTMLDivElement>(null)

  const totalClips = tracks.reduce((acc, t) => acc + t.clips.length, 0)

  // 完成编辑并进入下一步
  const handleFinishEdit = useCallback(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  }, [markStepCompleted, currentStep, goToNextStep])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
  }

  // 更新底部操作栏
  useEffect(() => {
    setBottomBar({
      show: true,
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: '剪辑就绪',
      description: `总时长 ${formatTime(totalDuration)} · ${tracks.length} 轨道 · ${totalClips} 片段`,
      primaryButton: {
        text: '完成编辑，导出视频',
        onClick: handleFinishEdit,
      },
    })
  }, [totalDuration, tracks.length, totalClips, setBottomBar, handleFinishEdit])

  // 计算时间标尺
  const getTimeMarkers = () => {
    const markers = []
    const step = zoom > 150 ? 1 : zoom > 80 ? 5 : 10
    for (let i = 0; i <= totalDuration; i += step) {
      markers.push(i)
    }
    return markers
  }

  // 切换轨道属性
  const toggleTrackProperty = (trackId: string, property: 'isMuted' | 'isLocked' | 'isVisible') => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, [property]: !t[property] } : t
      )
    )
  }

  // 选择片段
  const selectClip = (trackId: string, clipId: string) => {
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        clips: track.clips.map((clip) => ({
          ...clip,
          isSelected: track.id === trackId && clip.id === clipId,
        })),
      }))
    )
  }

  const pixelsPerSecond = (zoom / 100) * 10

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-surface-950">
        {/* 顶部工具栏 */}
        <div className="h-12 border-b border-surface-800 flex items-center justify-between px-4 bg-surface-900">
          {/* 左侧工具 */}
          <div className="flex items-center gap-1">
            <Tooltip content="撤销 (Ctrl+Z)">
              <Button variant="ghost" size="sm" isIconOnly>
                <Undo2 className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="重做 (Ctrl+Y)">
              <Button variant="ghost" size="sm" isIconOnly>
                <Redo2 className="w-4 h-4" />
              </Button>
            </Tooltip>
            <div className="w-px h-6 bg-surface-700 mx-2" />
            <Tooltip content="剪切 (C)">
              <Button
                variant={selectedTool === 'cut' ? 'primary' : 'ghost'}
                size="sm"
                isIconOnly
                onClick={() => setSelectedTool('cut')}
              >
                <Scissors className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="分割 (S)">
              <Button variant="ghost" size="sm" isIconOnly>
                <Split className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="复制">
              <Button variant="ghost" size="sm" isIconOnly>
                <Copy className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="删除">
              <Button variant="ghost" size="sm" isIconOnly>
                <Trash2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>

          {/* 播放控制 */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" isIconOnly>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="primary"
              size="sm"
              isIconOnly
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <Button variant="ghost" size="sm" isIconOnly>
              <SkipForward className="w-4 h-4" />
            </Button>
            <span className="text-sm font-mono text-surface-200 ml-2 w-28">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* 右侧工具 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={(v) => {
                  setVolume(v[0])
                  setIsMuted(false)
                }}
                max={100}
                className="w-20"
              />
            </div>
            <div className="w-px h-6 bg-surface-700 mx-2" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={() => setZoom(Math.max(50, zoom - 25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-surface-400 w-10 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={() => setZoom(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" isIconOnly>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 主内容区 - 预览 + 时间轴 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 预览区域 */}
          <div className="h-64 bg-black flex items-center justify-center border-b border-surface-800">
            <div className="relative w-[480px] h-[270px] bg-surface-900 rounded-lg overflow-hidden">
              {/* 模拟视频预览 */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-16 h-16 text-surface-600 mx-auto mb-2" />
                  <p className="text-surface-500 text-sm">视频预览</p>
                </div>
              </div>
              {/* 字幕预览 */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="px-4 py-2 bg-black/60 text-white rounded-lg">
                  今天我们要聊一个非常<span className="text-amber-400">火爆</span>的话题
                </span>
              </div>
              {/* 时间显示 */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs font-mono text-white">
                {formatTime(currentTime)}
              </div>
            </div>
          </div>

          {/* 时间轴 */}
          <div className="flex-1 flex overflow-hidden bg-surface-900">
            {/* 轨道标签 */}
            <div className="w-48 flex-shrink-0 border-r border-surface-700">
              {/* 时间标尺头 */}
              <div className="h-8 border-b border-surface-700 flex items-center px-2">
                <Badge variant="primary" size="sm">
                  <Sparkles className="w-3 h-3" />
                  {tracks.reduce((acc, t) => acc + t.clips.length, 0)} 个片段
                </Badge>
              </div>
              {/* 轨道列表 */}
              {tracks.map((track) => {
                const Icon = track.icon
                return (
                  <div
                    key={track.id}
                    className="h-14 border-b border-surface-700 flex items-center px-2 gap-2"
                  >
                    <Icon className="w-4 h-4 text-surface-400 flex-shrink-0" />
                    <span className="text-sm text-surface-200 flex-1 truncate">
                      {track.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        className={`p-1 rounded hover:bg-surface-700 ${track.isMuted ? 'text-error' : 'text-surface-500'}`}
                        onClick={() => toggleTrackProperty(track.id, 'isMuted')}
                      >
                        {track.isMuted ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        className={`p-1 rounded hover:bg-surface-700 ${track.isLocked ? 'text-amber-400' : 'text-surface-500'}`}
                        onClick={() => toggleTrackProperty(track.id, 'isLocked')}
                      >
                        {track.isLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        className={`p-1 rounded hover:bg-surface-700 ${!track.isVisible ? 'text-surface-600' : 'text-surface-500'}`}
                        onClick={() => toggleTrackProperty(track.id, 'isVisible')}
                      >
                        {track.isVisible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
              {/* 添加轨道 */}
              <button className="h-10 w-full flex items-center justify-center gap-2 text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">添加轨道</span>
              </button>
            </div>

            {/* 时间轴内容 */}
            <div className="flex-1 overflow-x-auto" ref={timelineRef}>
              <div
                style={{ width: `${totalDuration * pixelsPerSecond + 100}px` }}
                className="min-h-full"
              >
                {/* 时间标尺 */}
                <div className="h-8 border-b border-surface-700 relative bg-surface-800/50">
                  {getTimeMarkers().map((time) => (
                    <div
                      key={time}
                      className="absolute top-0 h-full flex flex-col items-center"
                      style={{ left: `${time * pixelsPerSecond}px` }}
                    >
                      <span className="text-[10px] text-surface-500 font-mono">
                        {formatTime(time).slice(0, 5)}
                      </span>
                      <div className="flex-1 w-px bg-surface-600" />
                    </div>
                  ))}
                  {/* 播放头 */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                    style={{ left: `${currentTime * pixelsPerSecond}px` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 rotate-45 rounded-sm" />
                  </div>
                </div>

                {/* 轨道内容 */}
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`h-14 border-b border-surface-700 relative ${!track.isVisible ? 'opacity-40' : ''}`}
                  >
                    {track.clips.map((clip) => (
                      <motion.div
                        key={clip.id}
                        className={`
                          absolute top-1 bottom-1 rounded-md cursor-pointer transition-all
                          ${clip.isSelected ? 'ring-2 ring-white shadow-lg z-10' : 'hover:brightness-110'}
                          ${track.isLocked ? 'cursor-not-allowed opacity-70' : ''}
                        `}
                        style={{
                          left: `${clip.start * pixelsPerSecond}px`,
                          width: `${clip.duration * pixelsPerSecond}px`,
                          backgroundColor: clip.color,
                        }}
                        onClick={() => !track.isLocked && selectClip(track.id, clip.id)}
                        whileHover={{ scale: track.isLocked ? 1 : 1.01 }}
                      >
                        <div className="h-full px-2 flex items-center">
                          <span className="text-xs text-surface-950 font-medium truncate">
                            {clip.name}
                          </span>
                        </div>
                        {/* 片段边缘调整手柄 */}
                        {clip.isSelected && !track.isLocked && (
                          <>
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize" />
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize" />
                          </>
                        )}
                      </motion.div>
                    ))}
                    {/* 播放头延伸线 */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400/30"
                      style={{ left: `${currentTime * pixelsPerSecond}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

