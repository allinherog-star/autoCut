'use client'

/**
 * 素材列表组件 - 按类型分类显示时间轴上的素材
 * Material List Component - Displays timeline clips by type
 */

import React, { useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Video, 
  Music, 
  Type, 
  Image, 
  ChevronDown,
  Clock,
} from 'lucide-react'
import { useTimelineStore } from '@/lib/timeline/store'
import type { Track, Clip, TrackType, VEIRProject } from '@/lib/veir/types'
import { getAssetDisplayName } from './clip-display'

interface MaterialListProps {
  /** 当前选中的素材 ID */
  selectedClipId: string | null
  /** 选中素材回调 */
  onSelectClip: (clipId: string, trackId: string) => void
  /** 可选：VEIR 项目（用于把 assetId 映射成更贴近预览的显示名） */
  veirProject?: VEIRProject | null
  /** 自定义类名 */
  className?: string
}

// 轨道类型配置
const TRACK_TYPE_CONFIG: Record<TrackType, { 
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
}> = {
  video: { 
    label: '视频', 
    icon: Video, 
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20'
  },
  audio: { 
    label: '音频', 
    icon: Music, 
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20'
  },
  text: { 
    label: '文字', 
    icon: Type, 
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20'
  },
  subtitle: {
    label: '字幕',
    icon: Type,
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/15',
  },
  pip: { 
    label: '贴纸/图片', 
    icon: Image, 
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20'
  },
}

// 格式化时间
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins > 0) {
    return `${mins}:${String(secs).padStart(2, '0')}`
  }
  return `${secs}s`
}

export function MaterialList({ 
  selectedClipId,
  onSelectClip,
  veirProject,
  className = ''
}: MaterialListProps) {
  const { data, playback, seek } = useTimelineStore()
  
  // 展开/折叠状态
  const [expandedTypes, setExpandedTypes] = React.useState<Set<TrackType>>(
    new Set(['video', 'audio', 'text', 'subtitle', 'pip'])
  )

  // 按类型分组素材
  const materialsByType = useMemo(() => {
    const grouped: Record<TrackType, Array<{ clip: Clip; track: Track }>> = {
      video: [],
      audio: [],
      text: [],
      subtitle: [],
      pip: [],
    }
    
    data.tracks.forEach(track => {
      track.clips.forEach(clip => {
        grouped[track.type].push({ clip, track })
      })
    })
    
    // 按开始时间排序
    Object.values(grouped).forEach(items => {
      items.sort((a, b) => a.clip.time.start - b.clip.time.start)
    })
    
    return grouped
  }, [data.tracks])

  const getClipLabel = useCallback(
    (clip: Clip) => getAssetDisplayName(veirProject, clip.asset),
    [veirProject]
  )

  // 切换类型展开状态
  const toggleType = (type: TrackType) => {
    setExpandedTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // 点击素材
  const handleClipClick = (clip: Clip, track: Track) => {
    onSelectClip(clip.id, track.id)
    // 同时定位播放头到素材开始位置
    seek(clip.time.start)
  }

  // 检查素材是否在当前播放位置
  const isClipAtCurrentTime = (clip: Clip) => {
    return playback.currentTime >= clip.time.start && playback.currentTime < clip.time.end
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* 标题 */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#2a2a2e]">
        <h3 className="text-sm font-medium text-[#eee]">素材列表</h3>
        <p className="text-xs text-[#666] mt-0.5">点击素材定位到时间轴</p>
      </div>

      {/* 素材分类列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        {(Object.keys(TRACK_TYPE_CONFIG) as TrackType[]).map(type => {
          const config = TRACK_TYPE_CONFIG[type]
          const materials = materialsByType[type]
          const isExpanded = expandedTypes.has(type)
          const Icon = config.icon
          
          return (
            <div key={type} className="border-b border-[#252528]">
              {/* 类型标题 */}
              <button
                onClick={() => toggleType(type)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#1e1e22] transition-colors"
              >
                <div className={`w-7 h-7 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm text-[#ddd]">{config.label}</span>
                  <span className="ml-2 text-xs text-[#666]">{materials.length}</span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-[#555] transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                />
              </button>
              
              {/* 素材列表 */}
              <AnimatePresence>
                {isExpanded && materials.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-2">
                      {materials.map(({ clip, track }) => {
                        const isSelected = selectedClipId === clip.id
                        const isActive = isClipAtCurrentTime(clip)
                        const duration = clip.time.end - clip.time.start
                        
                        return (
                          <button
                            key={clip.id}
                            onClick={() => handleClipClick(clip, track)}
                            className={`
                              w-full px-4 py-2 flex items-center gap-3 transition-all
                              ${isSelected 
                                ? 'bg-amber-400/10 border-r-2 border-amber-400' 
                                : 'hover:bg-[#1e1e22]'
                              }
                              ${isActive && !isSelected ? 'bg-[#1a1a1e]' : ''}
                            `}
                          >
                            {/* 播放指示器 */}
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0">
                              {isActive && (
                                <div className="w-full h-full rounded-full bg-green-400 animate-pulse" />
                              )}
                            </div>
                            
                            {/* 素材信息 */}
                            <div className="flex-1 min-w-0 text-left">
                              <p className={`text-sm truncate ${isSelected ? 'text-amber-400' : 'text-[#ccc]'}`}>
                                {getClipLabel(clip)}
                              </p>
                              {/* 当展示名与 assetId 不一致时，补充显示 assetId 便于定位 */}
                              {veirProject && getClipLabel(clip) !== clip.asset && (
                                <p className="text-[11px] text-[#555] truncate mt-0.5 font-mono">
                                  {clip.asset}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-0.5">
                                <Clock className="w-3 h-3 text-[#555]" />
                                <span className="text-xs text-[#666] font-mono">
                                  {formatDuration(clip.time.start)} - {formatDuration(clip.time.end)}
                                </span>
                                <span className="text-xs text-[#555]">
                                  ({formatDuration(duration)})
                                </span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 空状态 */}
              {isExpanded && materials.length === 0 && (
                <div className="px-4 py-3 text-xs text-[#555]">
                  暂无{config.label}素材
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

