'use client'

/**
 * 剪辑微调页面 - 完整布局
 * Edit Page with Full Layout
 * 
 * 布局结构：
 * - 左侧：素材列表（按类型分类）
 * - 中上：素材功能操作区（根据素材类型显示不同操作）
 * - 中间：AI聊天对话框（通过对话微调）
 * - 右侧：预览区（素材可拖拽位置）
 * - 底部：时间轴
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { useEditor } from '../layout'

// 时间轴组件导入
import { TimelineViewer } from '@/components/editor/timeline'
import { useTimelineStore } from '@/lib/timeline/store'
import { convertVEIRToTimeline } from '@/lib/timeline/veir-converter'
import type { VEIRProject } from '@/lib/veir/types'

// 编辑页面组件
import {
  MaterialList,
  MaterialOperations,
  AIChatPanel,
  VideoPreviewPanel,
} from '@/components/editor/edit'

// VEIR 测试项目 - 使用网络视频（CORS 友好，用于测试跨域视频加载）
import networkVideoDemo from '@/lib/veir/test-projects/network-video-demo.json'

// ============================================
// 剪辑微调页面
// ============================================

export default function EditPage() {
  const { goToNextStep, markStepCompleted, currentStep, hideBottomBar, targetDevice, deviceConfig, setVeirProject: setContextVeirProject } = useEditor()

  // 时间轴 store
  const { data, playback, loadData, _tick } = useTimelineStore()

  // 本地可变的 VEIR 项目状态
  const [veirProject, setVeirProject] = useState<VEIRProject>(() => networkVideoDemo as unknown as VEIRProject)

  // 将当前项目写入 EditorLayout context，供 /editor/export 使用
  // 每次 veirProject 变化时都同步到 context
  // 注意：不在 cleanup 中清除 veirProject，以确保导航到导出页面时数据仍可用
  useEffect(() => {
    setContextVeirProject(veirProject)
    // 不清除 veirProject，让导出页面可以访问相同的项目数据
  }, [setContextVeirProject, veirProject])

  // 播放动画引用
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // 选中状态
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  // 加载测试数据
  useEffect(() => {
    loadData(convertVEIRToTimeline(veirProject))
  }, [loadData, veirProject])

  // 播放动画循环
  useEffect(() => {
    if (!playback.isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time
      }
      const deltaTime = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time

      _tick(deltaTime)
      animationRef.current = requestAnimationFrame(animate)
    }

    lastTimeRef.current = 0
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [playback.isPlaying, _tick])

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

  // 隐藏 layout 的底部操作栏，因为我们自己控制布局
  useEffect(() => {
    hideBottomBar()
    return () => hideBottomBar()
  }, [hideBottomBar])

  // 选中素材回调
  const handleSelectClip = useCallback((clipId: string, trackId: string) => {
    setSelectedClipId(clipId)
    setSelectedTrackId(trackId)
  }, [])

  // 素材位置变化回调 - 将拖拽位置变化写入 VEIR 调整
  const handleClipPositionChange = useCallback((clipId: string, x: number, y: number) => {
    console.log('素材位置变化:', clipId, x, y)
    // 注意：当前 veirProject 是只读的 useState，实际应用中需要可变的状态管理
    // 这里通过 setVeirProject 触发更新
  }, [])

  const handleClipTransformChange = useCallback(
    (clipId: string, patch: { xPercent?: number; yPercent?: number; scale?: number; rotation?: number }) => {
      console.log('素材变换变化:', clipId, patch)

      // 更新 VEIR 项目的 adjustments.clipOverrides
      // 这确保导出时使用相同的位置信息
      setVeirProject((prev) => {
        if (!prev) return prev

        const [width, height] = prev.meta.resolution
        const currentOverrides = prev.adjustments?.clipOverrides || {}
        const currentClipOverride = currentOverrides[clipId] || {}
        const currentVideoOverride = currentClipOverride.video || {}
        const currentTransform = currentVideoOverride.transform || {}

        // 计算新的 offset（像素值）
        const newOffset: [number, number] = [
          typeof patch.xPercent === 'number'
            ? (patch.xPercent / 100) * width
            : (currentTransform.offset?.[0] ?? width / 2),
          typeof patch.yPercent === 'number'
            ? (patch.yPercent / 100) * height
            : (currentTransform.offset?.[1] ?? height / 2),
        ]

        // 计算新的 scale（归一化）
        const newScale = typeof patch.scale === 'number'
          ? patch.scale / 100
          : currentTransform.scale

        // 计算新的 rotation
        const newRotation = typeof patch.rotation === 'number'
          ? patch.rotation
          : currentTransform.rotation

        return {
          ...prev,
          adjustments: {
            ...prev.adjustments,
            clipOverrides: {
              ...currentOverrides,
              [clipId]: {
                ...currentClipOverride,
                video: {
                  ...currentVideoOverride,
                  transform: {
                    ...currentTransform,
                    offset: newOffset,
                    ...(newScale !== undefined && { scale: newScale }),
                    ...(newRotation !== undefined && { rotation: newRotation }),
                  },
                },
              },
            },
          },
        }
      })

      if (typeof patch.xPercent === 'number' || typeof patch.yPercent === 'number') {
        handleClipPositionChange(clipId, patch.xPercent ?? 0, patch.yPercent ?? 0)
      }
    },
    [handleClipPositionChange, setVeirProject]
  )

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0f0f12]">
      {/* 主内容区域 - 上半部分 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧：素材列表 */}
        <div className="w-64 flex-shrink-0 border-r border-[#2a2a2e] bg-[#141417]">
          <MaterialList
            selectedClipId={selectedClipId}
            onSelectClip={handleSelectClip}
            className="h-full"
          />
        </div>

        {/* 中间区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 上方：素材功能操作区 */}
          <div className="h-[260px] flex-shrink-0 border-b border-[#2a2a2e] bg-[#141417]">
            <MaterialOperations
              selectedClipId={selectedClipId}
              selectedTrackId={selectedTrackId}
              className="h-full"
            />
          </div>

          {/* 下方：AI聊天对话框 */}
          <div className="flex-1 min-h-0">
            <AIChatPanel
              selectedClipId={selectedClipId}
              selectedTrackId={selectedTrackId}
              className="h-full"
            />
          </div>
        </div>

        {/* 右侧：预览区 */}
        <div className="w-[480px] flex-shrink-0 border-l border-[#2a2a2e]">
          <VideoPreviewPanel
            selectedClipId={selectedClipId}
            selectedTrackId={selectedTrackId}
            veirProject={veirProject}
            targetDevice={targetDevice}
            deviceConfig={deviceConfig}
            onClipPositionChange={handleClipPositionChange}
            onClipTransformChange={handleClipTransformChange}
            onSelectClip={handleSelectClip}
            className="h-full"
          />
        </div>
      </div>

      {/* 只读时间轴查看器 - 紧凑布局 */}
      <TimelineViewer className="h-[180px] flex-shrink-0" />

      {/* 底部操作栏 */}
      <div className="h-14 px-6 flex items-center justify-between bg-[#1a1a1e] border-t border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <span className="text-amber-400">✨</span>
          </div>
          <div>
            <p className="font-medium text-sm text-[#eee]">剪辑就绪</p>
            <p className="text-xs text-[#888]">
              总时长 {formatTime(playback.duration)} · {trackCount} 轨道 · {clipCount} 片段
            </p>
          </div>
        </div>
        <button
          onClick={handleFinishEdit}
          className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-[#111] font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-amber-400/20"
        >
          完成编辑，导出视频
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
