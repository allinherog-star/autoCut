'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Search,
  Heart,
  ChevronRight,
  Waves,
  Clock,
  Zap,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
} from 'lucide-react'
import { Button, Card, Badge, Input, Slider } from '@/components/ui'
import { useEditor } from '../layout'

// ============================================
// 类型定义
// ============================================

interface MusicTrack {
  id: string
  name: string
  artist: string
  duration: number
  bpm: number
  mood: string[]
  genre: string
  coverUrl: string
  isLiked: boolean
  matchScore: number
}

// ============================================
// 模拟数据
// ============================================

const mockTracks: MusicTrack[] = [
  {
    id: '1',
    name: 'Energy Rise',
    artist: 'Studio Pro',
    duration: 142,
    bpm: 128,
    mood: ['激励', '积极', '活力'],
    genre: '电子',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
    isLiked: false,
    matchScore: 95,
  },
  {
    id: '2',
    name: 'Upbeat Journey',
    artist: 'Beat Factory',
    duration: 186,
    bpm: 120,
    mood: ['欢快', '轻松', '明朗'],
    genre: '流行',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    isLiked: true,
    matchScore: 92,
  },
  {
    id: '3',
    name: 'Cinematic Dream',
    artist: 'Film Score',
    duration: 210,
    bpm: 90,
    mood: ['史诗', '大气', '震撼'],
    genre: '影视',
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop',
    isLiked: false,
    matchScore: 88,
  },
  {
    id: '4',
    name: 'Chill Vibes',
    artist: 'LoFi Lab',
    duration: 165,
    bpm: 85,
    mood: ['放松', '舒适', '温馨'],
    genre: 'LoFi',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop',
    isLiked: false,
    matchScore: 85,
  },
  {
    id: '5',
    name: 'Power Drive',
    artist: 'Action Music',
    duration: 178,
    bpm: 140,
    mood: ['紧张', '刺激', '动感'],
    genre: '摇滚',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop',
    isLiked: false,
    matchScore: 82,
  },
]

const moodCategories = ['全部', '激励', '欢快', '放松', '史诗', '紧张', '温馨']
const genreCategories = ['全部', '电子', '流行', '影视', 'LoFi', '摇滚', '古典']

// ============================================
// 音乐卡点页面
// ============================================

export default function MusicPage() {
  const { goToNextStep, markStepCompleted, currentStep, setBottomBar, hideBottomBar } = useEditor()
  const [tracks, setTracks] = useState<MusicTrack[]>(mockTracks)
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMood, setActiveMood] = useState('全部')
  const [activeGenre, setActiveGenre] = useState('全部')
  const [autoSync, setAutoSync] = useState(true)

  // 确认音乐并进入下一步
  const handleConfirmMusic = useCallback(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  }, [markStepCompleted, currentStep, goToNextStep])

  // 更新底部操作栏
  useEffect(() => {
    if (selectedTrack) {
      setBottomBar({
        show: true,
        icon: <Music className="w-5 h-5 text-amber-400" />,
        title: `已选择: ${selectedTrack.name}`,
        description: autoSync 
          ? `AI 将自动根据 ${selectedTrack.bpm} BPM 节奏进行音乐卡点`
          : `${selectedTrack.artist} · ${formatTime(selectedTrack.duration)}`,
        primaryButton: {
          text: '确认音乐，继续下一步',
          onClick: handleConfirmMusic,
        },
      })
    } else {
      setBottomBar({
        show: true,
        icon: <Music className="w-5 h-5 text-amber-400" />,
        title: '请选择背景音乐',
        description: 'AI 将根据音乐节奏自动进行卡点',
        primaryButton: {
          text: '确认音乐',
          onClick: handleConfirmMusic,
          disabled: true,
        },
      })
    }
  }, [selectedTrack, autoSync, setBottomBar, handleConfirmMusic])

  // 播放进度模拟
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && selectedTrack) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= selectedTrack.duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, selectedTrack])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // 筛选音乐
  const filteredTracks = tracks.filter((track) => {
    const matchSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchMood = activeMood === '全部' || track.mood.includes(activeMood)
    const matchGenre = activeGenre === '全部' || track.genre === activeGenre
    return matchSearch && matchMood && matchGenre
  })

  // 切换喜欢
  const toggleLike = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isLiked: !t.isLiked } : t))
    )
  }

  // 选择音乐
  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedTrack(track)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 顶部搜索和筛选 */}
      <div className="p-6 border-b border-surface-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索音乐..."
              className="pl-10"
            />
          </div>
          <Badge variant="primary" size="lg">
            <Sparkles className="w-3.5 h-3.5" />
            AI 推荐 {filteredTracks.length} 首
          </Badge>
        </div>

        {/* 情绪筛选 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-surface-500 w-12">情绪:</span>
          <div className="flex gap-2 flex-wrap">
            {moodCategories.map((mood) => (
              <Button
                key={mood}
                variant={activeMood === mood ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setActiveMood(mood)}
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>

        {/* 风格筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-500 w-12">风格:</span>
          <div className="flex gap-2 flex-wrap">
            {genreCategories.map((genre) => (
              <Button
                key={genre}
                variant={activeGenre === genre ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setActiveGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 音乐列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-3">
          {filteredTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                isInteractive
                isSelected={selectedTrack?.id === track.id}
                className="p-4"
                onClick={() => handleSelectTrack(track)}
              >
                <div className="flex items-center gap-4">
                  {/* 封面 */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={track.coverUrl}
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-surface-100 truncate">
                        {track.name}
                      </p>
                      {track.matchScore >= 90 && (
                        <Badge variant="success" size="sm">
                          <Zap className="w-3 h-3" />
                          最佳匹配
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-surface-500 truncate">{track.artist}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(track.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Waves className="w-3 h-3" />
                        {track.bpm} BPM
                      </span>
                      <span>{track.genre}</span>
                    </div>
                  </div>

                  {/* 情绪标签 */}
                  <div className="flex gap-1.5">
                    {track.mood.slice(0, 2).map((m) => (
                      <Badge key={m} variant="outline" size="sm">
                        {m}
                      </Badge>
                    ))}
                  </div>

                  {/* 匹配度 */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex flex-col items-center justify-center
                      ${track.matchScore >= 90 ? 'bg-success/20 text-success' : 'bg-amber-400/20 text-amber-400'}
                    `}
                  >
                    <span className="text-sm font-bold">{track.matchScore}</span>
                    <span className="text-[10px]">匹配</span>
                  </div>

                  {/* 喜欢按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLike(track.id)
                    }}
                    className={track.isLiked ? 'text-error' : ''}
                  >
                    <Heart
                      className={`w-5 h-5 ${track.isLiked ? 'fill-current' : ''}`}
                    />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部播放器 */}
      <div className="border-t border-surface-800 bg-surface-900/80 backdrop-blur-lg p-4">
        <div className="flex items-center gap-6">
          {/* 当前播放 */}
          <div className="flex items-center gap-3 w-64">
            {selectedTrack ? (
              <>
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedTrack.coverUrl}
                    alt={selectedTrack.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-100 truncate">
                    {selectedTrack.name}
                  </p>
                  <p className="text-xs text-surface-500 truncate">
                    {selectedTrack.artist}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-surface-500">选择一首音乐</p>
            )}
          </div>

          {/* 播放控制 */}
          <div className="flex-1">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Button variant="ghost" size="sm" isIconOnly>
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" isIconOnly>
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="primary"
                size="md"
                isIconOnly
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!selectedTrack}
                className="w-10 h-10"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              <Button variant="ghost" size="sm" isIconOnly>
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" isIconOnly>
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            {/* 进度条 */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-surface-500 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[selectedTrack ? (currentTime / selectedTrack.duration) * 100 : 0]}
                onValueChange={(v) => {
                  if (selectedTrack) {
                    setCurrentTime((v[0] / 100) * selectedTrack.duration)
                  }
                }}
                max={100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs font-mono text-surface-500 w-10">
                {selectedTrack ? formatTime(selectedTrack.duration) : '--:--'}
              </span>
            </div>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-4 w-48 justify-end">
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
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

