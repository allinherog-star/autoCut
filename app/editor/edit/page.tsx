'use client'

/**
 * 剪辑微调页面 - 集成新时间轴编辑器
 * Edit Page with Integrated Timeline Editor
 */

import { useEffect, useCallback, useState } from 'react'
import { Sparkles, FolderOpen, Video, Music, Image as ImageIcon } from 'lucide-react'
import { Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import NextImage from 'next/image'
import { useEditor } from '../layout'

// 新组件导入
import { AssetUploader } from '@/components/editor/asset-uploader'
import { AssetList } from '@/components/editor/asset-list'
import { TimelineEditor } from '@/components/editor/timeline'
import { useTimelineStore } from '@/lib/timeline/store'
import type { Asset, VideoAsset, AudioAsset, ImageAsset } from '@/lib/assets'
import { createClipFromAsset } from '@/lib/timeline/veir-converter'
import type { TrackType } from '@/lib/veir/types'

// ============================================
// 剪辑微调页面
// ============================================

export default function EditPage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar } = useEditor()
  const [assetFilter, setAssetFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // 时间轴 store
  const { data, playback, addTrack, addClip } = useTimelineStore()

  // 统计信息
  const trackCount = data.tracks.length
  const clipCount = data.tracks.reduce((acc, t) => acc + t.clips.length, 0)

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 完成编辑并进入下一步
  const handleFinishEdit = useCallback(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  }, [markStepCompleted, currentStep, goToNextStep])

  // 更新底部操作栏
  useEffect(() => {
    setBottomBar({
      show: true,
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: '剪辑就绪',
      description: `总时长 ${formatTime(playback.duration)} · ${trackCount} 轨道 · ${clipCount} 片段`,
      primaryButton: {
        text: '完成编辑，导出视频',
        onClick: handleFinishEdit,
      },
    })
  }, [playback.duration, trackCount, clipCount, setBottomBar, handleFinishEdit])

  // 处理素材上传完成
  const handleAssetsUploaded = useCallback((assets: Asset[]) => {
    // 可选：自动添加到时间轴
    console.log('Uploaded assets:', assets)
  }, [])

  // 处理素材双击（添加到时间轴）
  const handleAssetDoubleClick = useCallback((asset: Asset) => {
    // 确定目标轨道类型
    let trackType: TrackType
    switch (asset.type) {
      case 'video':
        trackType = 'video'
        break
      case 'audio':
        trackType = 'audio'
        break
      case 'image':
        trackType = 'pip'
        break
      default:
        return
    }

    // 查找匹配类型的轨道，如果没有则创建
    let targetTrack = data.tracks.find(t => t.type === trackType)
    if (!targetTrack) {
      targetTrack = addTrack(trackType)
    }

    // 计算素材时长
    let duration = 5 // 默认 5 秒（图片）
    if (asset.type === 'video') {
      duration = (asset as VideoAsset).metadata?.duration || 10
    } else if (asset.type === 'audio') {
      duration = (asset as AudioAsset).metadata?.duration || 10
    }

    // 计算放置位置（追加到轨道末尾）
    const lastClip = targetTrack.clips[targetTrack.clips.length - 1]
    const startTime = lastClip ? lastClip.time.end : 0

    // 创建并添加 clip
    const clip = createClipFromAsset(asset.id, startTime, duration)
    addClip(targetTrack.id, clip)
  }, [data.tracks, addTrack, addClip])

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden bg-surface-950">
      {/* 左侧素材库面板 */}
      <aside className="w-72 border-r border-surface-800 bg-surface-900/50 flex flex-col">
        {/* 面板标题 */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-surface-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-surface-100">素材库</span>
          </div>
          <Badge variant="outline" size="sm">本地</Badge>
        </div>

        {/* 上传区域 */}
        <div className="p-3 border-b border-surface-800">
          <AssetUploader
            onUpload={handleAssetsUploaded}
            multiple={true}
            className="min-h-[80px]"
          />
        </div>

        {/* 过滤标签 */}
        <Tabs value={assetFilter} onValueChange={(v) => setAssetFilter(v as 'all' | 'video' | 'audio' | 'image')} className="flex-1 flex flex-col">
          <TabsList className="px-3 pt-2 justify-start gap-1 bg-transparent">
            <TabsTrigger value="all" className="text-xs px-2 py-1">
              全部
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs px-2 py-1">
              <Video className="w-3 h-3 mr-1" />
              视频
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs px-2 py-1">
              <Music className="w-3 h-3 mr-1" />
              音频
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs px-2 py-1">
              <ImageIcon className="w-3 h-3 mr-1" />
              图片
            </TabsTrigger>
          </TabsList>

          {/* 素材列表 */}
          <TabsContent value={assetFilter} className="flex-1 overflow-y-auto mt-0">
            <AssetList
              filter={assetFilter === 'all' ? undefined : assetFilter}
              selectedId={selectedAsset?.id}
              onSelect={setSelectedAsset}
              onDoubleClick={handleAssetDoubleClick}
              className="min-h-full"
            />
          </TabsContent>
        </Tabs>

        {/* 选中素材信息 */}
        {selectedAsset && (
          <div className="p-3 border-t border-surface-800 bg-surface-800/50">
            <p className="text-sm font-medium text-surface-100 truncate">
              {selectedAsset.name}
            </p>
            <p className="text-xs text-surface-400 mt-1">
              双击添加到时间轴
            </p>
          </div>
        )}
      </aside>

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
                <p className="text-surface-600 text-xs mt-1">
                  {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 时间轴编辑器 */}
        <TimelineEditor className="flex-1" />
      </div>

      {/* 右侧属性面板（可选） */}
      {selectedAsset && (
        <aside className="w-64 border-l border-surface-800 bg-surface-900/50 flex flex-col">
          <div className="h-12 px-4 flex items-center border-b border-surface-800">
            <span className="font-medium text-surface-100">属性</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* 缩略图 */}
              {selectedAsset.thumbnailUrl && (
                <div className="aspect-video bg-surface-800 rounded-lg overflow-hidden relative">
                  <NextImage
                    src={selectedAsset.thumbnailUrl}
                    alt={selectedAsset.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* 基础信息 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">名称</span>
                  <span className="text-surface-100 truncate ml-2 max-w-[120px]">
                    {selectedAsset.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">类型</span>
                  <Badge variant="secondary" size="sm">
                    {selectedAsset.type}
                  </Badge>
                </div>
                {(selectedAsset.type === 'video' || selectedAsset.type === 'audio') && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">时长</span>
                    <span className="text-surface-100">
                      {formatTime(
                        selectedAsset.type === 'video'
                          ? (selectedAsset as VideoAsset).metadata?.duration || 0
                          : (selectedAsset as AudioAsset).metadata?.duration || 0
                      )}
                    </span>
                  </div>
                )}
                {(selectedAsset.type === 'video' || selectedAsset.type === 'image') && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">分辨率</span>
                    <span className="text-surface-100">
                      {selectedAsset.type === 'video'
                        ? `${(selectedAsset as VideoAsset).metadata?.width}×${(selectedAsset as VideoAsset).metadata?.height}`
                        : `${(selectedAsset as ImageAsset).metadata?.width}×${(selectedAsset as ImageAsset).metadata?.height}`}
                    </span>
                  </div>
                )}
              </div>

              {/* 添加到时间轴按钮 */}
              <Button
                className="w-full"
                onClick={() => handleAssetDoubleClick(selectedAsset)}
              >
                添加到时间轴
              </Button>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
