'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Settings,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Copy,
  Check,
} from 'lucide-react'
import { Button, Slider } from '@/components/ui'

/**
 * 重影层配置
 */
interface GhostLayer {
  id: number
  /** 时间偏移（帧数，负数表示显示过去的帧） */
  frameOffset: number
  /** 不透明度 (0-1) */
  opacity: number
  /** 是否启用 */
  enabled: boolean
}

/**
 * 预设配置
 */
interface GhostPreset {
  name: string
  description: string
  layers: Omit<GhostLayer, 'id'>[]
}

const GHOST_PRESETS: Record<string, GhostPreset> = {
  standard: {
    name: '标准重影',
    description: '剪映经典4层重影效果',
    layers: [
      { frameOffset: -2, opacity: 0.6, enabled: true },
      { frameOffset: -4, opacity: 0.4, enabled: true },
      { frameOffset: -6, opacity: 0.25, enabled: true },
      { frameOffset: -8, opacity: 0.12, enabled: true },
    ],
  },
  light: {
    name: '轻微残影',
    description: '2层轻微的残影效果',
    layers: [
      { frameOffset: -3, opacity: 0.4, enabled: true },
      { frameOffset: -6, opacity: 0.2, enabled: true },
    ],
  },
  intense: {
    name: '强烈拖尾',
    description: '6层强烈的拖尾效果',
    layers: [
      { frameOffset: -1, opacity: 0.7, enabled: true },
      { frameOffset: -2, opacity: 0.55, enabled: true },
      { frameOffset: -3, opacity: 0.4, enabled: true },
      { frameOffset: -4, opacity: 0.28, enabled: true },
      { frameOffset: -5, opacity: 0.16, enabled: true },
      { frameOffset: -6, opacity: 0.08, enabled: true },
    ],
  },
  echo: {
    name: '回声效果',
    description: '间隔较大的回声残影',
    layers: [
      { frameOffset: -5, opacity: 0.5, enabled: true },
      { frameOffset: -10, opacity: 0.3, enabled: true },
      { frameOffset: -15, opacity: 0.15, enabled: true },
    ],
  },
  fast: {
    name: '快速动作',
    description: '适合快速动作的密集残影',
    layers: [
      { frameOffset: -1, opacity: 0.5, enabled: true },
      { frameOffset: -2, opacity: 0.35, enabled: true },
      { frameOffset: -3, opacity: 0.2, enabled: true },
    ],
  },
}

// 帧缓存大小
const MAX_FRAME_BUFFER = 30

export default function MotionGhostTestPage() {
  // 视频相关状态
  const [videoSrc, setVideoSrc] = useState<string>('/test-video.mp4')
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [effectEnabled, setEffectEnabled] = useState(true)
  const [bufferCount, setBufferCount] = useState(0)
  
  // 重影层配置
  const [layers, setLayers] = useState<GhostLayer[]>(
    GHOST_PRESETS.standard.layers.map((l, i) => ({ ...l, id: i }))
  )
  const [activePreset, setActivePreset] = useState<string>('standard')
  
  // UI 状态
  const [showLayerEditor, setShowLayerEditor] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameBufferRef = useRef<HTMLCanvasElement[]>([])
  const animationFrameRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 渲染循环 - 使用 Canvas 缓存帧
  const renderLoop = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    if (video.paused || video.ended) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 确保画布尺寸正确
    const vw = video.videoWidth || 640
    const vh = video.videoHeight || 360
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw
      canvas.height = vh
    }

    // 创建当前帧的 Canvas 缓存
    const frameCanvas = document.createElement('canvas')
    frameCanvas.width = vw
    frameCanvas.height = vh
    const frameCtx = frameCanvas.getContext('2d')
    if (frameCtx) {
      frameCtx.drawImage(video, 0, 0, vw, vh)
    }

    // 添加到帧缓存
    frameBufferRef.current.push(frameCanvas)
    if (frameBufferRef.current.length > MAX_FRAME_BUFFER) {
      frameBufferRef.current.shift()
    }
    setBufferCount(frameBufferRef.current.length)

    // 清空主画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (effectEnabled && frameBufferRef.current.length > 2) {
      const enabledLayers = layers.filter(l => l.enabled)
      
      // 1. 先绘制当前帧作为基底
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.drawImage(frameCanvas, 0, 0)

      // 2. 叠加过去的帧（使用 lighter 混合模式实现残影效果）
      for (const layer of enabledLayers) {
        const frameIndex = frameBufferRef.current.length - 1 + layer.frameOffset
        
        if (frameIndex >= 0 && frameIndex < frameBufferRef.current.length - 1) {
          const ghostCanvas = frameBufferRef.current[frameIndex]
          
          // 使用 lighter (additive) 混合模式让残影叠加更明显
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = layer.opacity
          ctx.drawImage(ghostCanvas, 0, 0)
        }
      }

      // 3. 重置混合模式
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    } else {
      // 不启用效果时直接显示当前帧
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.drawImage(frameCanvas, 0, 0)
    }

    setCurrentTime(video.currentTime)
    animationFrameRef.current = requestAnimationFrame(renderLoop)
  }, [layers, effectEnabled])

  // 播放/暂停
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
      animationFrameRef.current = requestAnimationFrame(renderLoop)
    } else {
      video.pause()
      setIsPlaying(false)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [renderLoop])

  // 重置
  const resetPlayback = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0
    frameBufferRef.current = []
    
    setIsPlaying(false)
    setCurrentTime(0)
    setBufferCount(0)
    cancelAnimationFrame(animationFrameRef.current)

    // 清空画布并绘制第一帧
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // 等视频就绪后绘制第一帧
        setTimeout(() => {
          if (video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          }
        }, 100)
      }
    }
  }, [])

  // 视频加载完成
  const handleVideoLoaded = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas) {
      setVideoDuration(video.duration)
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 360
      
      // 绘制第一帧
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
    }
  }, [])

  // 视频播放结束
  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false)
    cancelAnimationFrame(animationFrameRef.current)
  }, [])

  // 应用预设
  const applyPreset = useCallback((presetId: string) => {
    const preset = GHOST_PRESETS[presetId]
    if (preset) {
      setLayers(preset.layers.map((l, i) => ({ ...l, id: i })))
      setActivePreset(presetId)
    }
  }, [])

  // 添加层
  const addLayer = useCallback(() => {
    setLayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        frameOffset: -(prev.length + 1) * 2,
        opacity: Math.max(0.1, 0.7 - prev.length * 0.12),
        enabled: true,
      },
    ])
  }, [])

  // 删除层
  const removeLayer = useCallback((id: number) => {
    setLayers((prev) => prev.filter((l) => l.id !== id))
  }, [])

  // 更新层配置
  const updateLayer = useCallback((id: number, updates: Partial<GhostLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    )
  }, [])

  // 上传视频
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
      frameBufferRef.current = []
      setBufferCount(0)
    }
  }, [])

  // 生成剪映操作说明
  const generateJYGuide = useCallback(() => {
    const enabledLayers = layers.filter((l) => l.enabled)
    const frameTimeMs = (1000 / 30).toFixed(0) // 假设30fps
    const steps = [
      '📱 剪映操作步骤：',
      '',
      '1. 导入视频素材到主轨道',
      `2. 复制视频 ${enabledLayers.length} 次（画中画方式叠加）`,
      '',
      '3. 设置每层参数：',
      '   • 主轨道：保持不变',
      ...enabledLayers.map((layer, index) => {
        const offsetMs = Math.abs(layer.frameOffset) * parseInt(frameTimeMs)
        return `   • 画中画${index + 1}：不透明度 ${Math.round(layer.opacity * 100)}%，向后移动 ${offsetMs}ms`
      }),
      '',
      '4. 选中所有画中画轨道，混合模式设为「滤色」或「变亮」',
      '',
      '提示：偏移时间 = 帧数 × 33ms（30fps）',
    ]
    return steps.join('\n')
  }, [layers])

  // 复制操作说明
  const copyGuide = useCallback(() => {
    const guide = generateJYGuide()
    navigator.clipboard.writeText(guide)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }, [generateJYGuide])

  // 清理
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  // 视频源变化时重置
  useEffect(() => {
    resetPlayback()
  }, [videoSrc, resetPlayback])

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 glass-strong border-b border-surface-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">动作重影效果</h1>
              <p className="text-xs text-surface-400">剪映同款 · 画中画叠加原理</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              上传视频
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 原理说明 */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20">
          <h2 className="text-sm font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            剪映动作重影原理
          </h2>
          <p className="text-xs text-surface-300 leading-relaxed">
            <span className="text-cyan-400">①</span> 缓存最近30帧画面 → 
            <span className="text-purple-400"> ②</span> 取出过去N帧 → 
            <span className="text-pink-400"> ③</span> 以递减透明度叠加到当前帧 → 
            <span className="text-amber-400"> ④</span> 形成动作残影拖尾效果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：视频预览 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 预览区域 */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              {/* 隐藏的视频元素（作为帧源） */}
              <video
                ref={videoRef}
                src={videoSrc}
                className="hidden"
                onLoadedMetadata={handleVideoLoaded}
                onEnded={handleVideoEnded}
                muted
                playsInline
              />

              {/* Canvas 输出 */}
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain bg-black"
              />

              {/* 状态标签 */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span className={`
                  px-2 py-1 text-xs rounded-full backdrop-blur-sm font-medium
                  ${effectEnabled ? 'bg-green-500/70 text-white' : 'bg-surface-500/50 text-surface-300'}
                `}>
                  {effectEnabled ? '✓ 重影已启用' : '重影已关闭'}
                </span>
              </div>

              {/* 帧缓存状态 */}
              <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-black/60 backdrop-blur-sm text-surface-300">
                  缓存: {bufferCount}/{MAX_FRAME_BUFFER} 帧
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-black/60 backdrop-blur-sm text-surface-300">
                  {layers.filter(l => l.enabled).length} 层叠加
                </span>
              </div>

              {/* 播放控制覆盖层 */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-20"
                  onClick={togglePlay}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </motion.div>
                </div>
              )}
            </div>

            {/* 播放控制 */}
            <div className="flex items-center justify-between p-4 bg-surface-800/50 rounded-xl border border-surface-700">
              <div className="flex items-center gap-3">
                <Button
                  variant={isPlaying ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={togglePlay}
                  leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {isPlaying ? '暂停' : '播放'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPlayback}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  重置
                </Button>
                
                <div className="h-6 w-px bg-surface-600 mx-2" />
                
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={effectEnabled}
                    onChange={(e) => setEffectEnabled(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                  <span className="text-sm text-surface-300">启用重影效果</span>
                </label>
              </div>

              <div className="text-sm text-surface-400 font-mono">
                {currentTime.toFixed(2)}s / {videoDuration.toFixed(2)}s
              </div>
            </div>

            {/* 图层可视化 */}
            <div className="p-4 bg-surface-800/50 rounded-xl border border-surface-700">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                图层叠加示意
              </h3>
              <div className="space-y-2">
                {/* 当前帧 */}
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs text-surface-400 shrink-0">当前帧</span>
                  <div className="flex-1 h-8 bg-cyan-500/60 rounded flex items-center justify-center">
                    <span className="text-xs text-white font-medium">100% 不透明</span>
                  </div>
                </div>
                
                {/* 重影层 */}
                {layers.filter((l) => l.enabled).map((layer, index) => (
                  <div key={layer.id} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-surface-400 shrink-0">
                      {Math.abs(layer.frameOffset)} 帧前
                    </span>
                    <div 
                      className="flex-1 h-8 rounded flex items-center justify-center"
                      style={{ 
                        backgroundColor: `rgba(168, 85, 247, ${layer.opacity * 0.8})`,
                      }}
                    >
                      <span className="text-xs text-white/90">{Math.round(layer.opacity * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-surface-500 mt-3">
                💡 越早的帧越透明，叠加后形成动作的拖尾轨迹
              </p>
            </div>

            {/* 剪映操作指南 */}
            <div className="p-4 bg-surface-900 rounded-xl border border-surface-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  在剪映中复现此效果
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyGuide}
                  leftIcon={copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                >
                  {copiedCode ? '已复制' : '复制步骤'}
                </Button>
              </div>
              <pre className="text-xs text-amber-400/80 font-mono whitespace-pre-wrap leading-relaxed">
                {generateJYGuide()}
              </pre>
            </div>
          </div>

          {/* 右侧：参数控制 */}
          <div className="space-y-4">
            {/* 预设选择 */}
            <div className="p-4 bg-surface-800/50 rounded-xl border border-surface-700">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                效果预设
              </h3>
              <div className="space-y-2">
                {Object.entries(GHOST_PRESETS).map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => applyPreset(id)}
                    className={`
                      w-full p-3 rounded-lg border text-left transition-all
                      ${activePreset === id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{preset.name}</span>
                      <span className="text-xs text-surface-400">{preset.layers.length} 层</span>
                    </div>
                    <p className="text-xs text-surface-400">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 图层编辑器 */}
            <div className="p-4 bg-surface-800/50 rounded-xl border border-surface-700">
              <button
                onClick={() => setShowLayerEditor(!showLayerEditor)}
                className="w-full flex items-center justify-between text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  自定义图层
                  <span className="text-xs text-surface-400">({layers.length} 层)</span>
                </span>
                {showLayerEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {showLayerEditor && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-3 max-h-96 overflow-y-auto">
                      {layers.map((layer, index) => (
                        <div
                          key={layer.id}
                          className={`p-3 rounded-lg border transition-all ${
                            layer.enabled 
                              ? 'border-surface-600 bg-surface-800/50' 
                              : 'border-surface-700 bg-surface-900/50 opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={layer.enabled}
                                onChange={(e) => updateLayer(layer.id, { enabled: e.target.checked })}
                                className="w-4 h-4 accent-cyan-500 rounded"
                              />
                              <span className="text-xs font-medium">重影层 {index + 1}</span>
                            </label>
                            {layers.length > 1 && (
                              <button
                                onClick={() => removeLayer(layer.id)}
                                className="text-surface-400 hover:text-red-400 transition-colors p-1"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            {/* 帧偏移 */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-surface-400">帧偏移</span>
                                <span className="text-cyan-400 font-mono">
                                  {layer.frameOffset} 帧 ({Math.abs(layer.frameOffset) * 33}ms)
                                </span>
                              </div>
                              <Slider
                                value={[layer.frameOffset]}
                                onValueChange={([v]) => updateLayer(layer.id, { frameOffset: v })}
                                min={-20}
                                max={-1}
                                step={1}
                                disabled={!layer.enabled}
                              />
                            </div>

                            {/* 不透明度 */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-surface-400">不透明度</span>
                                <span className="text-purple-400 font-mono">{Math.round(layer.opacity * 100)}%</span>
                              </div>
                              <Slider
                                value={[layer.opacity * 100]}
                                onValueChange={([v]) => updateLayer(layer.id, { opacity: v / 100 })}
                                min={5}
                                max={80}
                                step={5}
                                disabled={!layer.enabled}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={addLayer}
                        leftIcon={<Plus className="w-4 h-4" />}
                        className="w-full"
                      >
                        添加重影层
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 使用说明 */}
            <div className="p-4 bg-surface-900 rounded-xl border border-surface-700">
              <h3 className="text-xs text-surface-400 mb-2">使用说明</h3>
              <ul className="text-xs text-surface-500 space-y-1 list-disc list-inside">
                <li>上传武打/运动视频效果最佳</li>
                <li>动作越快，残影效果越明显</li>
                <li>帧偏移越大，拖尾越长</li>
                <li>透明度控制残影的可见程度</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
