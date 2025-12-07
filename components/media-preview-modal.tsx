'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { Button, Slider } from '@/components/ui'

// ============================================
// 类型定义
// ============================================

export interface MediaPreviewProps {
  isOpen: boolean
  onClose: () => void
  type: 'video' | 'image'
  src: string
  title?: string
  startTime?: number
  endTime?: number
}

// ============================================
// 媒体预览模态框
// ============================================

export function MediaPreviewModal({
  isOpen,
  onClose,
  type,
  src,
  title,
  startTime = 0,
  endTime,
}: MediaPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 视频加载完成
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(endTime || videoRef.current.duration)
      videoRef.current.currentTime = startTime
      setCurrentTime(startTime)
    }
  }

  // 时间更新
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      
      // 如果有结束时间限制，到达后暂停
      if (endTime && time >= endTime) {
        videoRef.current.pause()
        videoRef.current.currentTime = startTime
        setIsPlaying(false)
      }
    }
  }

  // 播放/暂停
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false))
        }
      }
    }
  }

  // 跳转
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const seekTime = startTime + (value[0] / 100) * ((endTime || duration) - startTime)
      videoRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
    }
  }

  // 音量控制
  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const vol = value[0] / 100
      videoRef.current.volume = vol
      setVolume(value[0])
      setIsMuted(vol === 0)
    }
  }

  // 静音切换
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // 快进/快退
  const skip = (seconds: number) => {
    if (videoRef.current) {
      let newTime = videoRef.current.currentTime + seconds
      newTime = Math.max(startTime, Math.min(newTime, endTime || duration))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // 全屏
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen?.()
      } else {
        document.exitFullscreen?.()
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // 计算进度百分比
  const progressPercent = endTime
    ? ((currentTime - startTime) / (endTime - startTime)) * 100
    : duration > 0
    ? (currentTime / duration) * 100
    : 0

  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ' && type === 'video') {
        e.preventDefault()
        togglePlay()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, type])

  // 关闭时暂停视频
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 内容 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-5xl mx-4"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-100">
                {title || '媒体预览'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onClick={onClose}
                className="text-surface-400 hover:text-surface-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 媒体内容 */}
            <div className="relative bg-black rounded-xl overflow-hidden">
              {type === 'video' ? (
                <>
                  <video
                    ref={videoRef}
                    src={src}
                    className="w-full max-h-[70vh] object-contain"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('[MediaPreview] 视频加载错误:', e)
                    }}
                    onClick={togglePlay}
                  />

                  {/* 播放按钮覆盖层 */}
                  {!isPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={togglePlay}
                    >
                      <div className="w-20 h-20 rounded-full bg-amber-400/90 flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors">
                        <Play className="w-10 h-10 text-surface-950 ml-1" />
                      </div>
                    </div>
                  )}

                  {/* 视频控制栏 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* 进度条 */}
                    <div className="mb-3">
                      <Slider
                        value={[progressPercent]}
                        onValueChange={handleSeek}
                        max={100}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* 控制按钮 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          onClick={() => skip(-5)}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isIconOnly
                          onClick={togglePlay}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          onClick={() => skip(5)}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-mono text-surface-200 ml-2">
                          {formatTime(currentTime)} / {formatTime(endTime || duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          onClick={toggleMute}
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          onValueChange={handleVolumeChange}
                          max={100}
                          className="w-20"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          onClick={toggleFullscreen}
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // 图片预览
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={title || '图片预览'}
                  className="w-full max-h-[80vh] object-contain"
                />
              )}
            </div>

            {/* 提示 */}
            <p className="text-center text-sm text-surface-500 mt-4">
              按 ESC 关闭 {type === 'video' && '· 按空格键播放/暂停'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MediaPreviewModal




