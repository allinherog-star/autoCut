'use client'

/**
 * VEIR 音频播放器
 * 基于 VEIR 项目的音频轨道 + 视频素材原声，实现同步播放
 * 
 * 功能：
 * - 预加载项目中所有音频/视频素材
 * - 根据时间轴同步播放各 clip 的音频
 * - 支持 play/pause/seek 控制
 */

import type { VEIRProject, Clip, Track } from '@/lib/veir/types'

export interface VEIRAudioPlayerOptions {
    /** 素材 URL 解析器 */
    resolver?: {
        resolveVideo: (src: string) => Promise<string>
        resolveAudio: (src: string) => Promise<string>
    }
}

interface AudioClipState {
    clipId: string
    assetId: string
    element: HTMLAudioElement | HTMLVideoElement
    timeStart: number
    timeEnd: number
    sourceStart: number
    muted: boolean
}

/**
 * VEIR 音频播放器类
 */
export class VEIRAudioPlayer {
    private project: VEIRProject
    private resolver: VEIRAudioPlayerOptions['resolver']
    private audioClips: AudioClipState[] = []
    private currentTime: number = 0
    private isPlaying: boolean = false
    private isMuted: boolean = false
    private masterVolume: number = 1
    private preloaded: boolean = false

    constructor(project: VEIRProject, options?: VEIRAudioPlayerOptions) {
        this.project = project
        this.resolver = options?.resolver || {
            resolveVideo: async (src) => src,
            resolveAudio: async (src) => src,
        }
    }

    /**
     * 更新项目（用于 VEIR 项目变化时）
     */
    setProject(project: VEIRProject): void {
        this.project = project
        // 项目变化时需要重新预加载
        this.preloaded = false
    }

    /**
     * 预加载所有音频资源
     */
    async preload(): Promise<void> {
        if (this.preloaded) return

        // 清理旧的音频元素
        this.cleanup()

        const { timeline, assets } = this.project

        for (const track of timeline.tracks) {
            for (const clip of track.clips) {
                const asset = assets.assets[clip.asset]
                if (!asset) continue

                // 视频素材也有音频轨道
                if (asset.type === 'video' && asset.src) {
                    try {
                        const resolvedSrc = await this.resolver!.resolveVideo(asset.src)
                        const video = document.createElement('video')
                        video.src = resolvedSrc
                        video.preload = 'auto'
                        video.muted = true // 初始静音，由 seek 时控制
                        video.crossOrigin = 'anonymous'

                        // 等待加载元数据
                        await new Promise<void>((resolve, reject) => {
                            video.onloadedmetadata = () => resolve()
                            video.onerror = () => reject(new Error(`Failed to load video audio: ${asset.src}`))
                            setTimeout(resolve, 5000) // 5秒超时
                        })

                        this.audioClips.push({
                            clipId: clip.id,
                            assetId: clip.asset,
                            element: video,
                            timeStart: clip.time.start,
                            timeEnd: clip.time.end,
                            sourceStart: clip.sourceRange?.start ?? 0,
                            muted: false,
                        })
                    } catch (error) {
                        console.warn('[VEIRAudioPlayer] Failed to preload video audio:', clip.asset, error)
                    }
                }

                // 纯音频素材
                if (asset.type === 'audio' && asset.src) {
                    try {
                        const resolvedSrc = await this.resolver!.resolveAudio(asset.src)
                        const audio = document.createElement('audio')
                        audio.src = resolvedSrc
                        audio.preload = 'auto'
                        audio.crossOrigin = 'anonymous'

                        await new Promise<void>((resolve, reject) => {
                            audio.onloadedmetadata = () => resolve()
                            audio.onerror = () => reject(new Error(`Failed to load audio: ${asset.src}`))
                            setTimeout(resolve, 5000)
                        })

                        this.audioClips.push({
                            clipId: clip.id,
                            assetId: clip.asset,
                            element: audio,
                            timeStart: clip.time.start,
                            timeEnd: clip.time.end,
                            sourceStart: clip.sourceRange?.start ?? 0,
                            muted: false,
                        })
                    } catch (error) {
                        console.warn('[VEIRAudioPlayer] Failed to preload audio:', clip.asset, error)
                    }
                }
            }
        }

        this.preloaded = true
        console.log('[VEIRAudioPlayer] Preloaded', this.audioClips.length, 'audio clips')
    }

    /**
     * 播放
     */
    play(): void {
        if (this.isPlaying) return
        this.isPlaying = true
        this.syncAudio()
    }

    /**
     * 暂停
     */
    pause(): void {
        this.isPlaying = false
        for (const clip of this.audioClips) {
            clip.element.pause()
        }
    }

    /**
     * 跳转到指定时间
     */
    seek(time: number): void {
        this.currentTime = Math.max(0, Math.min(time, this.project.meta.duration))
        this.syncAudio()
    }

    /**
     * 设置静音
     */
    setMuted(muted: boolean): void {
        this.isMuted = muted
        for (const clip of this.audioClips) {
            clip.element.muted = muted
        }
    }

    /**
     * 设置音量 (0-1)
     */
    setVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume))
        for (const clip of this.audioClips) {
            clip.element.volume = this.masterVolume
        }
    }

    /**
     * 获取当前播放状态
     */
    getState(): { isPlaying: boolean; currentTime: number; isMuted: boolean } {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            isMuted: this.isMuted,
        }
    }

    /**
     * 同步所有音频到当前时间
     */
    private syncAudio(): void {
        const time = this.currentTime

        for (const clip of this.audioClips) {
            const isActive = time >= clip.timeStart && time < clip.timeEnd

            if (isActive) {
                // 计算素材内的时间位置
                const localTime = time - clip.timeStart
                const sourceTime = clip.sourceStart + localTime

                // 设置音频时间（只在差异较大时 seek，避免音频卡顿）
                const currentAudioTime = clip.element.currentTime
                if (Math.abs(currentAudioTime - sourceTime) > 0.1) {
                    clip.element.currentTime = sourceTime
                }

                // 取消静音并播放
                clip.element.muted = this.isMuted
                clip.element.volume = this.masterVolume

                if (this.isPlaying && clip.element.paused) {
                    clip.element.play().catch(() => {
                        // 忽略自动播放失败（浏览器限制）
                    })
                }
            } else {
                // 不在活跃时间范围内，暂停并静音
                clip.element.pause()
                clip.element.muted = true
            }
        }
    }

    /**
     * 清理资源
     */
    private cleanup(): void {
        for (const clip of this.audioClips) {
            clip.element.pause()
            clip.element.src = ''
        }
        this.audioClips = []
    }

    /**
     * 销毁播放器
     */
    destroy(): void {
        this.pause()
        this.cleanup()
        this.preloaded = false
    }
}

/**
 * React Hook：使用 VEIR 音频播放器
 */
export function useVEIRAudioPlayer(
    project: VEIRProject | null | undefined,
    options?: VEIRAudioPlayerOptions
): {
    player: VEIRAudioPlayer | null
    isReady: boolean
    preload: () => Promise<void>
} {
    // 注意：这是一个占位实现，实际 hook 需要在组件中使用 useRef/useEffect
    // 这里仅导出类型和类本身
    return {
        player: null,
        isReady: false,
        preload: async () => { },
    }
}
