'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Play,
  Settings,
  Check,
  Copy,
  Share2,
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Youtube,
  Film,
  Clock,
  HardDrive,
  Zap,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Button, Card, Badge, Progress, Switch, Tabs, TabsList, TabsTrigger, Slider } from '@/components/ui'

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
// 导出页面
// ============================================

export default function ExportPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>('1080p')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExportComplete, setIsExportComplete] = useState(false)
  const [includeSubtitles, setIncludeSubtitles] = useState(true)
  const [includeWatermark, setIncludeWatermark] = useState(false)
  const [quality, setQuality] = useState(80)

  const preset = exportPresets.find((p) => p.id === selectedPreset)!

  // 模拟导出过程
  useEffect(() => {
    if (isExporting) {
      const interval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsExporting(false)
            setIsExportComplete(true)
            return 100
          }
          return prev + Math.random() * 3
        })
      }, 150)
      return () => clearInterval(interval)
    }
  }, [isExporting])

  // 开始导出
  const startExport = () => {
    setIsExporting(true)
    setExportProgress(0)
    setIsExportComplete(false)
  }

  // 重新导出
  const resetExport = () => {
    setIsExportComplete(false)
    setExportProgress(0)
  }

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
            选择导出参数，生成高质量视频
          </p>
        </div>

        {/* 视频预览 */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="relative w-full max-w-2xl aspect-video bg-surface-900 rounded-xl overflow-hidden">
            {/* 模拟视频封面 */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center">
              <div className="text-center">
                <Film className="w-20 h-20 text-surface-600 mx-auto mb-4" />
                <p className="text-surface-400">视频预览</p>
                <p className="text-sm text-surface-500 mt-1">
                  时长: 00:55 | {preset.resolution}
                </p>
              </div>
            </div>
            {/* 播放按钮 */}
            <button className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center">
                <Play className="w-8 h-8 text-surface-950 ml-1" />
              </div>
            </button>
            {/* 标题预览 */}
            <div className="absolute top-4 left-4 right-4">
              <p className="text-white font-semibold text-lg drop-shadow-lg">
                99%的人都不知道的视频剪辑神器，效率提升10倍！
              </p>
            </div>
          </div>
        </div>

        {/* 导出进度 / 完成状态 */}
        <AnimatePresence mode="wait">
          {isExporting && (
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
                      {preset.name} · {preset.resolution}
                    </p>
                  </div>
                  <span className="text-2xl font-mono font-bold text-amber-400">
                    {Math.round(exportProgress)}%
                  </span>
                </div>
                <Progress value={exportProgress} variant="primary" size="md" />
                <div className="mt-4 flex items-center justify-between text-sm text-surface-500">
                  <span>预计剩余时间: {Math.ceil((100 - exportProgress) / 10)} 秒</span>
                  <span>预计文件大小: {preset.estimatedSize}</span>
                </div>
              </Card>
            </motion.div>
          )}

          {isExportComplete && (
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
                      视频已保存，可以直接下载或分享到社交平台
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Card className="p-3">
                    <p className="text-sm text-surface-500 mb-1">文件大小</p>
                    <p className="text-lg font-semibold text-surface-100">
                      {preset.estimatedSize.replace('~', '')}
                    </p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-sm text-surface-500 mb-1">分辨率</p>
                    <p className="text-lg font-semibold text-surface-100">
                      {preset.resolution}
                    </p>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Download className="w-5 h-5" />}
                    className="flex-1"
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

          {!isExporting && !isExportComplete && (
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
                建议选择 1080P 60fps 以获得最佳画质和文件大小平衡。
                如需发布到短视频平台，推荐使用对应的预设。
              </p>
            </div>
          </div>
        </Card>

        {/* 导出历史 */}
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

