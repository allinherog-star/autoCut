'use client'

/**
 * 剪辑微调页面 - VEIR 只读时间轴查看
 * Edit Page with Read-Only Timeline Viewer
 * 
 * 注意：此页面不使用 layout 的底部操作栏，而是将时间轴直接置于底部
 */

import { useEffect, useCallback, useRef } from 'react'
import { Video } from 'lucide-react'
import { useEditor } from '../layout'

// 时间轴组件导入
import { TimelineViewer } from '@/components/editor/timeline'
import { useTimelineStore } from '@/lib/timeline/store'
import type { TimelineData } from '@/lib/timeline/types'

// ============================================
// 测试数据 - 模拟真实的视频编辑场景
// ============================================
const TEST_TIMELINE_DATA: TimelineData = {
  duration: 60,
  tracks: [
    // 视频轨道 1 - 主视频
    {
      id: 'track_video_1',
      type: 'video',
      layer: 0,
      clips: [
        {
          id: 'clip_video_1',
          asset: '开场片头.mp4',
          time: { start: 0, end: 5 },
        },
        {
          id: 'clip_video_2',
          asset: '主视频内容.mp4',
          time: { start: 5, end: 35 },
        },
        {
          id: 'clip_video_3',
          asset: '精彩片段.mp4',
          time: { start: 35, end: 50 },
        },
        {
          id: 'clip_video_4',
          asset: '结尾画面.mp4',
          time: { start: 50, end: 58 },
        },
      ],
    },
    // 视频轨道 2 - 画中画/叠加素材
    {
      id: 'track_video_2',
      type: 'video',
      layer: 1,
      clips: [
        {
          id: 'clip_video_pip_1',
          asset: '反应镜头.mp4',
          time: { start: 12, end: 18 },
        },
        {
          id: 'clip_video_pip_2',
          asset: 'B-Roll素材.mp4',
          time: { start: 28, end: 34 },
        },
      ],
    },
    // 文字轨道 - 字幕和标题
    {
      id: 'track_text_1',
      type: 'text',
      layer: 2,
      clips: [
        {
          id: 'clip_text_1',
          asset: '片头标题',
          time: { start: 1, end: 4 },
        },
        {
          id: 'clip_text_2',
          asset: '第一部分字幕',
          time: { start: 8, end: 15 },
        },
        {
          id: 'clip_text_3',
          asset: '重点提示文字',
          time: { start: 20, end: 25 },
        },
        {
          id: 'clip_text_4',
          asset: '精彩时刻',
          time: { start: 36, end: 42 },
        },
        {
          id: 'clip_text_5',
          asset: '订阅关注',
          time: { start: 52, end: 57 },
        },
      ],
    },
    // 贴纸/图片轨道
    {
      id: 'track_pip_1',
      type: 'pip',
      layer: 3,
      clips: [
        {
          id: 'clip_sticker_1',
          asset: '表情包.gif',
          time: { start: 10, end: 14 },
        },
        {
          id: 'clip_sticker_2',
          asset: 'Logo水印.png',
          time: { start: 0, end: 58 },
        },
        {
          id: 'clip_sticker_3',
          asset: '动态贴纸.webm',
          time: { start: 38, end: 45 },
        },
      ],
    },
    // 音频轨道 1 - 背景音乐
    {
      id: 'track_audio_1',
      type: 'audio',
      layer: 4,
      clips: [
        {
          id: 'clip_audio_bgm',
          asset: '背景音乐.mp3',
          time: { start: 0, end: 58 },
        },
      ],
    },
    // 音频轨道 2 - 音效
    {
      id: 'track_audio_2',
      type: 'audio',
      layer: 5,
      clips: [
        {
          id: 'clip_audio_sfx_1',
          asset: '转场音效.wav',
          time: { start: 4.5, end: 5.5 },
        },
        {
          id: 'clip_audio_sfx_2',
          asset: '强调音效.wav',
          time: { start: 19, end: 20 },
        },
        {
          id: 'clip_audio_sfx_3',
          asset: '笑声音效.wav',
          time: { start: 36, end: 38 },
        },
        {
          id: 'clip_audio_sfx_4',
          asset: '订阅提示音.wav',
          time: { start: 52, end: 53 },
        },
      ],
    },
  ],
}

// ============================================
// 剪辑微调页面
// ============================================

export default function EditPage() {
  const { goToNextStep, markStepCompleted, currentStep, hideBottomBar } = useEditor()

  // 时间轴 store
  const { data, playback, loadData, _tick } = useTimelineStore()
  
  // 播放动画引用
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // 加载测试数据
  useEffect(() => {
    loadData(TEST_TIMELINE_DATA)
  }, [loadData])

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

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0f0f12]">
      {/* 预览区域 - 填满上方空间 */}
      <div className="flex-1 bg-black flex items-center justify-center min-h-0">
        <div className="relative w-[640px] h-[360px] bg-[#1a1a1e] rounded-lg overflow-hidden shadow-2xl">
          {/* 模拟视频预览 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e22] to-[#141418] flex items-center justify-center">
            <div className="text-center">
              <Video className="w-20 h-20 text-[#333] mx-auto mb-3" />
              <p className="text-[#666] text-sm">视频预览</p>
              <p className="text-[#444] text-xs mt-2 font-mono">
                {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
              </p>
            </div>
          </div>
          
          {/* 播放进度条 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#222]">
            <div 
              className="h-full bg-indigo-500 transition-all duration-100"
              style={{ width: `${(playback.currentTime / playback.duration) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 只读时间轴查看器 - 固定在底部 */}
      <TimelineViewer className="h-[280px] flex-shrink-0" />

      {/* 底部操作栏 */}
      <div className="h-16 px-6 flex items-center justify-between bg-[#1a1a1e] border-t border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <span className="text-amber-400">✨</span>
          </div>
          <div>
            <p className="font-medium text-[#eee]">剪辑就绪</p>
            <p className="text-sm text-[#888]">
              总时长 {formatTime(playback.duration)} · {trackCount} 轨道 · {clipCount} 片段
            </p>
          </div>
        </div>
        <button
          onClick={handleFinishEdit}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-[#111] font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-amber-400/20"
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
