'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Play,
  Pause,
  Settings,
  Copy,
  Share2,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Youtube,
  Film,
  Zap,
  CheckCircle2,
  Loader2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { Button, Card, Badge, Progress, Switch, Slider } from '@/components/ui'
import { useEditor } from '../layout'
import exampleProject from '@/lib/veir/example-project.json'
import type { VEIRProject } from '@/lib/veir/types'

// ============================================
// 类型定义
// ============================================

interface ExportPreset {
  id: string
  name: string
  icon: React.ElementType
  resolution: string
  fps: number
  bitrate: string
  estimatedSize: string
  platform?: string
}

type CompositionStage = 'idle' | 'parsing' | 'loading' | 'rendering' | 'encoding' | 'complete' | 'error'

interface CompositionResult {
  blob: Blob
  duration: number
  format: string
  size: number
  downloadUrl: string
}

// ============================================
// 预设数据
// ============================================

const exportPresets: ExportPreset[] = [
  {
    id: '4k',
    name: '4K 超清',
    icon: Monitor,
    resolution: '3840 × 2160',
    fps: 60,
    bitrate: '50 Mbps',
    estimatedSize: '~850 MB',
  },
  {
    id: '1080p',
    name: '1080P 高清',
    icon: Monitor,
    resolution: '1920 × 1080',
    fps: 60,
    bitrate: '20 Mbps',
    estimatedSize: '~320 MB',
  },
  {
    id: '720p',
    name: '720P 标清',
    icon: Tablet,
    resolution: '1280 × 720',
    fps: 30,
    bitrate: '8 Mbps',
    estimatedSize: '~130 MB',
  },
  {
    id: 'douyin',
    name: '抖音/快手',
    icon: Smartphone,
    resolution: '1080 × 1920',
    fps: 30,
    bitrate: '15 Mbps',
    estimatedSize: '~240 MB',
    platform: '竖屏短视频',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    resolution: '1920 × 1080',
    fps: 60,
    bitrate: '25 Mbps',
    estimatedSize: '~400 MB',
    platform: 'YouTube 推荐',
  },
  {
    id: 'bilibili',
    name: 'B站',
    icon: Film,
    resolution: '1920 × 1080',
    fps: 60,
    bitrate: '16 Mbps',
    estimatedSize: '~260 MB',
    platform: 'B站推荐',
  },
]

// ============================================
// 工具函数
// ============================================

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getStageLabel(stage: CompositionStage): string {
  switch (stage) {
    case 'parsing': return '解析项目'
    case 'loading': return '加载资源'
    case 'rendering': return '渲染帧'
    case 'encoding': return '编码视频'
    case 'complete': return '完成'
    case 'error': return '出错'
    default: return '就绪'
  }
}

// ============================================
// 导出页面
// ============================================

export default function ExportPage() {
  const { veirProject, deviceConfig } = useEditor()

  const [selectedPreset, setSelectedPreset] = useState<string>('1080p')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStage, setExportStage] = useState<CompositionStage>('idle')
  const [exportMessage, setExportMessage] = useState('')
  const [isExportComplete, setIsExportComplete] = useState(false)
  const [includeSubtitles, setIncludeSubtitles] = useState(true)
  const [includeWatermark, setIncludeWatermark] = useState(false)
  const [quality, setQuality] = useState(80)
  const [compositionResult, setCompositionResult] = useState<CompositionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const preset = exportPresets.find((p) => p.id === selectedPreset)!

  // 开始导出 - 使用真实的 VEIRComposer
  const startExport = useCallback(async () => {
    let projectToExport = veirProject

    if (!projectToExport) {
      console.log('No project loaded, using example project for demo')
      projectToExport = exampleProject as unknown as VEIRProject
      setExportMessage('使用示例项目进行演示...')
    }

    setIsExporting(true)
    setExportProgress(0)
    setExportStage('idle')
    setIsExportComplete(false)
    setCompositionResult(null)
    setError(null)

    try {
      // 动态导入合成器（仅客户端）
      const { VEIRComposer } = await import('@/lib/veir/composer')

      const composer = new VEIRComposer(projectToExport)

      const result = await composer.compose(
        {
          format: 'mp4',
          quality: quality >= 80 ? 'high' : quality >= 50 ? 'medium' : 'low',
        },
        (stage, progress, message) => {
          setExportStage(stage)
          setExportProgress(progress)
          setExportMessage(message)
        }
      )

      setCompositionResult(result)
      setExportStage('complete')
      setIsExportComplete(true)
      composer.destroy()
    } catch (err) {
      console.error('Composition error:', err)
      setError((err as Error).message)
      setExportStage('error')
    } finally {
      setIsExporting(false)
    }
  }, [veirProject, quality])

  // 下载视频
  const handleDownload = useCallback(() => {
    if (!compositionResult) return
    const link = document.createElement('a')
    link.href = compositionResult.downloadUrl
    link.download = `video-${Date.now()}.${compositionResult.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [compositionResult])

  // 重新导出
  const resetExport = useCallback(() => {
    setIsExportComplete(false)
    setExportProgress(0)
    setExportStage('idle')
    setExportMessage('')
    setCompositionResult(null)
    setError(null)
  }, [])

  // 清理资源
  useEffect(() => {
    return () => {
      if (compositionResult?.downloadUrl) {
        URL.revokeObjectURL(compositionResult.downloadUrl)
      }
    }
  }, [compositionResult])

  // 获取项目时长和分辨率
  const projectDuration = veirProject?.meta?.duration || 0
  const projectResolution = veirProject?.meta?.resolution || [1920, 1080]

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* 左侧预览 */}
      <div className="flex-1 flex flex-col p-6 border-r border-surface-800">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
            导出成片
          </h1>
          <p className="text-surface-400">
            {veirProject ? '选择导出参数，生成高质量视频' : '请先在剪辑页面完成编辑'}
          </p>
        </div>

        {/* 视频预览 */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div
            className="relative w-full max-w-2xl bg-surface-900 rounded-xl overflow-hidden"
            style={{ aspectRatio: `${projectResolution[0]}/${projectResolution[1]}` }}
          >
            {compositionResult ? (
              <video
                ref={videoRef}
                src={compositionResult.downloadUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center">
                <div className="text-center">
                  {isExporting ? (
                    <>
                      <Loader2 className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-spin" />
                      <p className="text-surface-200 font-medium">{getStageLabel(exportStage)}</p>
                      <p className="text-sm text-surface-500 mt-1">{exportMessage}</p>
                    </>
                  ) : (
                    <>
                      <Film className="w-20 h-20 text-surface-600 mx-auto mb-4" />
                      <p className="text-surface-400">视频预览</p>
                      <p className="text-sm text-surface-500 mt-1">
                        时长: {formatDuration(projectDuration)} | {projectResolution[0]}×{projectResolution[1]}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 导出进度 / 完成状态 / 错误状态 */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="glass" className="p-6 border-red-500/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-400">导出失败</p>
                    <p className="text-sm text-surface-400">{error}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={resetExport}>
                  重试
                </Button>
              </Card>
            </motion.div>
          )}

          {isExporting && !error && (
            <motion.div
              key="exporting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="glass" className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-surface-100">正在导出视频...</p>
                    <p className="text-sm text-surface-400">
                      {getStageLabel(exportStage)} · {exportMessage}
                    </p>
                  </div>
                  <span className="text-2xl font-mono font-bold text-amber-400">
                    {Math.round(exportProgress)}%
                  </span>
                </div>
                <Progress value={exportProgress} variant="primary" size="md" />
              </Card>
            </motion.div>
          )}

          {isExportComplete && compositionResult && !error && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card variant="glass" className="p-6 border-success/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-surface-100 mb-1">
                      🎉 导出成功！
                    </h3>
                    <p className="text-surface-400">
                      视频已生成，可以直接下载或分享
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <Card className="p-3">
                    <p className="text-sm text-surface-500 mb-1">时长</p>
                    <p className="text-lg font-semibold text-surface-100">
                      {formatDuration(compositionResult.duration)}
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-sm text-surface-500 mb-1">文件大小</p>
                    <p className="text-lg font-semibold text-surface-100">
                      {formatBytes(compositionResult.size)}
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-sm text-surface-500 mb-1">格式</p>
                    <p className="text-lg font-semibold text-surface-100 uppercase">
                      {compositionResult.format}
                    </p>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Download className="w-5 h-5" />}
                    className="flex-1"
                    onClick={handleDownload}
                  >
                    下载视频
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Share2 className="w-5 h-5" />}
                  >
                    分享
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    leftIcon={<Copy className="w-5 h-5" />}
                  >
                    复制链接
                  </Button>
                </div>

                {/* 平台分享 */}
                <div className="mt-6 pt-6 border-t border-surface-700">
                  <p className="text-sm text-surface-400 mb-3">一键发布到平台:</p>
                  <div className="flex gap-2">
                    {['抖音', '快手', 'B站', '小红书', '微信视频号'].map((platform) => (
                      <Button key={platform} variant="secondary" size="sm">
                        {platform}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {!isExporting && !isExportComplete && !error && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                size="xl"
                fullWidth
                leftIcon={<Sparkles className="w-5 h-5" />}
                onClick={startExport}
                className="glow-primary-hover"
              >
                开始导出
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 右侧设置 */}
      <div className="w-96 p-6 bg-surface-900/50 overflow-y-auto">
        <h2 className="text-lg font-semibold text-surface-100 mb-4">
          导出设置
        </h2>

        {/* 预设选择 */}
        <div className="mb-6">
          <p className="text-sm text-surface-400 mb-3">选择导出预设</p>
          <div className="grid grid-cols-2 gap-2">
            {exportPresets.map((p) => {
              const Icon = p.icon
              const isSelected = selectedPreset === p.id

              return (
                <button
                  key={p.id}
                  onClick={() => !isExporting && setSelectedPreset(p.id)}
                  disabled={isExporting}
                  className={`
                    p-3 rounded-lg text-left transition-all
                    ${isSelected
                      ? 'bg-amber-400/20 border border-amber-400/50'
                      : 'bg-surface-800 border border-surface-700 hover:border-surface-600'
                    }
                    ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-surface-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-amber-400' : 'text-surface-200'}`}>
                      {p.name}
                    </span>
                  </div>
                  <p className="text-xs text-surface-500">{p.resolution}</p>
                  {p.platform && (
                    <Badge variant="outline" size="sm" className="mt-1">
                      {p.platform}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 详细参数 */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-medium text-surface-200 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            导出参数
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-surface-400">分辨率</span>
              <span className="text-surface-200">{preset.resolution}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-400">帧率</span>
              <span className="text-surface-200">{preset.fps} fps</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-400">码率</span>
              <span className="text-surface-200">{preset.bitrate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-400">预计大小</span>
              <span className="text-surface-200">{preset.estimatedSize}</span>
            </div>
          </div>
        </Card>

        {/* 质量设置 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-surface-400">输出质量</span>
            <span className="text-amber-400">{quality}%</span>
          </div>
          <Slider
            value={[quality]}
            onValueChange={(v) => setQuality(v[0])}
            max={100}
            min={50}
            disabled={isExporting}
          />
          <div className="flex justify-between text-xs text-surface-500 mt-1">
            <span>较小文件</span>
            <span>最佳质量</span>
          </div>
        </div>

        {/* 其他选项 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-200">包含字幕</p>
              <p className="text-xs text-surface-500">将字幕嵌入视频</p>
            </div>
            <Switch
              checked={includeSubtitles}
              onCheckedChange={setIncludeSubtitles}
              disabled={isExporting}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-200">添加水印</p>
              <p className="text-xs text-surface-500">在视频角落添加 Logo</p>
            </div>
            <Switch
              checked={includeWatermark}
              onCheckedChange={setIncludeWatermark}
              disabled={isExporting}
            />
          </div>
        </div>

        {/* 提示信息 */}
        <Card className="p-4 mt-6 bg-amber-400/5 border-amber-400/20">
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-surface-200 mb-1">优化提示</p>
              <p className="text-xs text-surface-400">
                视频将使用项目原始分辨率 ({projectResolution[0]}×{projectResolution[1]}) 导出。
                首次合成可能需要较长时间加载资源。
              </p>
            </div>
          </div>
        </Card>

        {/* 重新选择参数 */}
        {isExportComplete && (
          <div className="mt-6">
            <Button
              variant="ghost"
              fullWidth
              onClick={resetExport}
            >
              重新选择参数导出
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
