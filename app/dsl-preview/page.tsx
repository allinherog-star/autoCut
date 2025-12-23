'use client';

/**
 * DSL 视频预览页面
 * 基于 example-project.json 渲染多轨道时间轴预览
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    SkipBack,
    SkipForward,
    Settings,
    Layers,
    Type,
    Image as ImageIcon,
    Video,
    Music,
} from 'lucide-react';

// DSL 类型导入
import type { DSLProject, Track, Clip, TimeRange } from '@/dsl_schema/types';

// 示例项目数据
import exampleProject from '@/dsl_schema/example-project.json';

// ============================================
// 工具函数
// ============================================

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// 轨道图标组件
// ============================================

function TrackIcon({ type }: { type: string }) {
    const iconClass = 'w-4 h-4';
    switch (type) {
        case 'video':
            return <Video className={iconClass} />;
        case 'audio':
            return <Music className={iconClass} />;
        case 'text':
            return <Type className={iconClass} />;
        case 'image':
            return <ImageIcon className={iconClass} />;
        case 'pip':
            return <Layers className={iconClass} />;
        default:
            return <Settings className={iconClass} />;
    }
}

// ============================================
// 文字叠加渲染组件
// ============================================

interface TextOverlayProps {
    clip: Clip;
    project: DSLProject;
    isActive: boolean;
    progress: number; // 0-1 片段内进度
}

function TextOverlay({ clip, project, isActive, progress }: TextOverlayProps) {
    const asset = project.assets.assets[clip.asset];
    if (!asset || asset.type !== 'text') return null;

    const text = asset.content || '';
    const expression = clip.expression;
    const behavior = clip.behavior;
    const layout = clip.layout;

    // 获取预设样式
    const preset = expression?.preset
        ? project.presets?.textStyles?.[expression.preset]
        : null;

    // 计算入场/出场动画
    const enterDuration = 0.15; // 入场动画占比
    const exitDuration = 0.15; // 出场动画占比
    const isEntering = progress < enterDuration;
    const isExiting = progress > 1 - exitDuration;

    // 动画变体
    const getEnterAnimation = (type?: string) => {
        switch (type) {
            case 'bounce':
                return { scale: [0, 1.2, 1], y: [50, -10, 0] };
            case 'slide-up':
                return { y: [100, 0], opacity: [0, 1] };
            case 'zoom-in':
                return { scale: [0.5, 1], opacity: [0, 1] };
            case 'fade-in':
            default:
                return { opacity: [0, 1] };
        }
    };

    const getExitAnimation = (type?: string) => {
        switch (type) {
            case 'slide-down':
                return { y: [0, 100], opacity: [1, 0] };
            case 'zoom-out':
                return { scale: [1, 0.5], opacity: [1, 0] };
            case 'fade-out':
            default:
                return { opacity: [1, 0] };
        }
    };

    // 位置计算
    const getPosition = (zone?: string) => {
        switch (zone) {
            case 'top':
            case 'top-left':
            case 'top-right':
                return { top: '10%' };
            case 'bottom':
            case 'bottom-left':
            case 'bottom-right':
                return { bottom: '15%' };
            case 'center':
            default:
                return { top: '50%', transform: 'translateY(-50%)' };
        }
    };

    // 样式变量
    const intensity = expression?.intensity ?? preset?.defaultIntensity ?? 0.8;
    const category = preset?.category;

    // 基础样式
    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        ...getPosition(layout?.zone),
        zIndex: 100,
        textAlign: 'center',
        maxWidth: '90%',
    };

    // 根据分类应用不同风格
    const getCategoryStyle = (): React.CSSProperties => {
        switch (category) {
            case '综艺':
                return {
                    fontSize: `${2 + intensity}rem`,
                    fontWeight: 900,
                    color: '#FFD700',
                    textShadow: `
            0 0 10px rgba(255,215,0,0.8),
            2px 2px 0 #FF6B6B,
            4px 4px 0 #4ECDC4,
            6px 6px 10px rgba(0,0,0,0.5)
          `,
                    letterSpacing: '0.1em',
                };
            case '信息':
                return {
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '8px 16px',
                    borderRadius: '4px',
                };
            case '情绪':
                return {
                    fontSize: `${1.5 + intensity}rem`,
                    fontWeight: 700,
                    color: '#FF1493',
                    textShadow: '0 0 20px rgba(255,20,147,0.8)',
                };
            default:
                return {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                };
        }
    };

    if (!isActive) return null;

    return (
        <motion.div
            initial={getEnterAnimation(behavior?.enter)}
            animate={
                isExiting
                    ? getExitAnimation(behavior?.exit)
                    : { opacity: 1, scale: 1, y: 0 }
            }
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ ...baseStyle, ...getCategoryStyle() }}
        >
            {text}
            {/* 强调动画 */}
            {behavior?.emphasis?.includes('pulse') && (
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ position: 'absolute', inset: 0 }}
                />
            )}
        </motion.div>
    );
}

// ============================================
// 画中画渲染组件
// ============================================

interface PipOverlayProps {
    clip: Clip;
    project: DSLProject;
    isActive: boolean;
    progress: number;
}

function PipOverlay({ clip, project, isActive, progress }: PipOverlayProps) {
    const layout = clip.layout;
    const pipPreset = layout?.preset
        ? project.presets?.pipLayouts?.[layout.preset]
        : null;

    if (!isActive) return null;

    // 获取锚点位置
    const getAnchorStyle = (): React.CSSProperties => {
        const anchor = pipPreset?.anchor || 'bottom-right';
        const size = pipPreset?.size || [0.25, 0.25];
        const radius = pipPreset?.radius || 8;

        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            width: `${size[0] * 100}%`,
            height: `${size[1] * 100}%`,
            borderRadius: `${radius}px`,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '2px solid rgba(255,255,255,0.3)',
        };

        switch (anchor) {
            case 'top-left':
                return { ...baseStyle, top: '5%', left: '5%' };
            case 'top-right':
                return { ...baseStyle, top: '5%', right: '5%' };
            case 'bottom-left':
                return { ...baseStyle, bottom: '5%', left: '5%' };
            case 'bottom-right':
                return { ...baseStyle, bottom: '5%', right: '5%' };
            case 'center':
                return {
                    ...baseStyle,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                };
            default:
                return { ...baseStyle, bottom: '5%', right: '5%' };
        }
    };

    // 模拟画中画内容
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={getAnchorStyle()}
        >
            <div
                className="w-full h-full flex items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <div className="text-white text-center">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-80" />
                    <span className="text-sm opacity-80">画中画</span>
                </div>
            </div>
        </motion.div>
    );
}

// ============================================
// 图片叠加组件
// ============================================

interface ImageOverlayProps {
    clip: Clip;
    project: DSLProject;
    isActive: boolean;
}

function ImageOverlay({ clip, project, isActive }: ImageOverlayProps) {
    const layout = clip.layout;

    if (!isActive) return null;

    // 获取位置
    const getPosition = (): React.CSSProperties => {
        const zone = layout?.zone || 'top-right';
        const base: React.CSSProperties = {
            position: 'absolute',
            width: '80px',
            height: '80px',
        };

        switch (zone) {
            case 'top-left':
                return { ...base, top: '3%', left: '3%' };
            case 'top-right':
                return { ...base, top: '3%', right: '3%' };
            case 'bottom-left':
                return { ...base, bottom: '3%', left: '3%' };
            case 'bottom-right':
                return { ...base, bottom: '3%', right: '3%' };
            default:
                return { ...base, top: '3%', right: '3%' };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            style={getPosition()}
        >
            <div
                className="w-full h-full rounded-lg flex items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                }}
            >
                <ImageIcon className="w-8 h-8 text-white opacity-80" />
            </div>
        </motion.div>
    );
}

// ============================================
// 时间轴可视化组件
// ============================================

interface TimelineVisualizerProps {
    project: DSLProject;
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
}

function TimelineVisualizer({
    project,
    currentTime,
    duration,
    onSeek,
}: TimelineVisualizerProps) {
    const tracks = project.timeline.tracks;
    const timelineRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        onSeek(percent * duration);
    };

    return (
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">时间轴</h3>
                <span className="text-gray-400 text-xs">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>
            </div>

            {/* 时间轴轨道 */}
            <div
                ref={timelineRef}
                className="space-y-2 cursor-pointer"
                onClick={handleClick}
            >
                {tracks.map((track) => (
                    <div key={track.id} className="flex items-center gap-2">
                        {/* 轨道标签 */}
                        <div className="w-20 flex items-center gap-1 text-gray-400 text-xs">
                            <TrackIcon type={track.type} />
                            <span className="truncate">{track.type}</span>
                        </div>

                        {/* 轨道内容 */}
                        <div className="flex-1 h-6 bg-gray-800 rounded relative overflow-hidden">
                            {track.clips.map((clip) => {
                                const left = (clip.time.start / duration) * 100;
                                const width =
                                    ((clip.time.end - clip.time.start) / duration) * 100;
                                const isActive =
                                    currentTime >= clip.time.start &&
                                    currentTime <= clip.time.end;

                                // 轨道颜色
                                const getTrackColor = () => {
                                    switch (track.type) {
                                        case 'video':
                                            return 'bg-blue-500';
                                        case 'audio':
                                            return 'bg-green-500';
                                        case 'text':
                                            return 'bg-yellow-500';
                                        case 'pip':
                                            return 'bg-purple-500';
                                        case 'image':
                                            return 'bg-pink-500';
                                        default:
                                            return 'bg-gray-500';
                                    }
                                };

                                return (
                                    <div
                                        key={clip.id}
                                        className={`absolute top-0.5 bottom-0.5 rounded ${getTrackColor()} ${isActive ? 'ring-2 ring-white ring-opacity-50' : ''
                                            }`}
                                        style={{ left: `${left}%`, width: `${width}%` }}
                                        title={`${clip.asset}: ${formatTime(clip.time.start)} - ${formatTime(clip.time.end)}`}
                                    />
                                );
                            })}

                            {/* 播放头 */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                                style={{ left: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* 时间刻度 */}
            <div className="flex justify-between mt-2 text-gray-500 text-xs">
                {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                    <span key={p}>{formatTime(p * duration)}</span>
                ))}
            </div>
        </div>
    );
}

// ============================================
// 主预览组件
// ============================================

export default function DSLPreviewPage() {
    const project = exampleProject as unknown as DSLProject;
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [showTimeline, setShowTimeline] = useState(true);
    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);

    const duration = project.meta.duration;
    const resolution = project.meta.resolution;
    const fps = project.meta.fps;

    // 播放循环
    useEffect(() => {
        if (!isPlaying) return;

        lastTimeRef.current = performance.now();

        const animate = (now: number) => {
            const delta = (now - lastTimeRef.current) / 1000;
            lastTimeRef.current = now;

            setCurrentTime((prev) => {
                const next = prev + delta;
                if (next >= duration) {
                    setIsPlaying(false);
                    return 0;
                }
                return next;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, duration]);

    // 获取当前活跃的片段
    const getActiveClips = useCallback(() => {
        const activeClips: { track: Track; clip: Clip; progress: number }[] = [];

        project.timeline.tracks.forEach((track) => {
            track.clips.forEach((clip) => {
                if (
                    clip.enabled !== false &&
                    currentTime >= clip.time.start &&
                    currentTime <= clip.time.end
                ) {
                    const clipDuration = clip.time.end - clip.time.start;
                    const progress = (currentTime - clip.time.start) / clipDuration;
                    activeClips.push({ track, clip, progress });
                }
            });
        });

        return activeClips.sort((a, b) => a.track.layer - b.track.layer);
    }, [project, currentTime]);

    const activeClips = getActiveClips();

    // 控制函数
    const togglePlay = () => setIsPlaying(!isPlaying);
    const reset = () => {
        setCurrentTime(0);
        setIsPlaying(false);
    };
    const seek = (time: number) => setCurrentTime(Math.max(0, Math.min(time, duration)));
    const skipBack = () => seek(currentTime - 5);
    const skipForward = () => seek(currentTime + 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* 标题 */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        🎬 DSL 视频预览
                    </h1>
                    <p className="text-gray-400">
                        基于 <code className="bg-gray-700 px-2 py-0.5 rounded">example-project.json</code> 的多轨道时间轴渲染
                    </p>
                </div>

                {/* 项目信息 */}
                <div className="flex justify-center gap-4 mb-6">
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg text-sm">
                        <span className="text-gray-400">分辨率：</span>
                        <span className="text-white">{resolution[0]}x{resolution[1]}</span>
                    </div>
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg text-sm">
                        <span className="text-gray-400">帧率：</span>
                        <span className="text-white">{fps} fps</span>
                    </div>
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg text-sm">
                        <span className="text-gray-400">时长：</span>
                        <span className="text-white">{duration} 秒</span>
                    </div>
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg text-sm">
                        <span className="text-gray-400">轨道数：</span>
                        <span className="text-white">{project.timeline.tracks.length}</span>
                    </div>
                </div>

                {/* 预览区域 */}
                <div className="flex justify-center">
                    <div
                        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            width: '540px',
                            height: '960px',
                            aspectRatio: `${resolution[0]}/${resolution[1]}`,
                        }}
                    >
                        {/* 背景层 - 模拟主视频 */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `
                  linear-gradient(
                    ${(currentTime * 10) % 360}deg,
                    #1a1a2e 0%,
                    #16213e 50%,
                    #0f3460 100%
                  )
                `,
                            }}
                        >
                            {/* 动态网格背景 */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                                    backgroundSize: '50px 50px',
                                    transform: `translateY(${(currentTime * 20) % 50}px)`,
                                }}
                            />
                        </div>

                        {/* 安全区指示 */}
                        {project.meta.safeArea && (
                            <>
                                <div
                                    className="absolute left-0 right-0 border-b border-dashed border-yellow-500/30"
                                    style={{ top: `${(project.meta.safeArea.top || 0) * 100}%` }}
                                />
                                <div
                                    className="absolute left-0 right-0 border-t border-dashed border-yellow-500/30"
                                    style={{ bottom: `${(project.meta.safeArea.bottom || 0) * 100}%` }}
                                />
                            </>
                        )}

                        {/* 渲染活跃片段 */}
                        <AnimatePresence>
                            {activeClips.map(({ track, clip, progress }) => {
                                switch (track.type) {
                                    case 'text':
                                        return (
                                            <TextOverlay
                                                key={clip.id}
                                                clip={clip}
                                                project={project}
                                                isActive={true}
                                                progress={progress}
                                            />
                                        );
                                    case 'pip':
                                        return (
                                            <PipOverlay
                                                key={clip.id}
                                                clip={clip}
                                                project={project}
                                                isActive={true}
                                                progress={progress}
                                            />
                                        );
                                    case 'image':
                                        return (
                                            <ImageOverlay
                                                key={clip.id}
                                                clip={clip}
                                                project={project}
                                                isActive={true}
                                            />
                                        );
                                    default:
                                        return null;
                                }
                            })}
                        </AnimatePresence>

                        {/* 播放器控制条 */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            {/* 进度条 */}
                            <div
                                className="h-1 bg-gray-600 rounded-full mb-3 cursor-pointer"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    seek(percent * duration);
                                }}
                            >
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                                </div>
                            </div>

                            {/* 控制按钮 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={skipBack}
                                        className="p-2 text-white/80 hover:text-white transition-colors"
                                    >
                                        <SkipBack className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-6 h-6" />
                                        ) : (
                                            <Play className="w-6 h-6 ml-0.5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={skipForward}
                                        className="p-2 text-white/80 hover:text-white transition-colors"
                                    >
                                        <SkipForward className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={reset}
                                        className="p-2 text-white/80 hover:text-white transition-colors"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </button>
                                </div>

                                <span className="text-white/80 text-sm font-mono">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="p-2 text-white/80 hover:text-white transition-colors"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5" />
                                        ) : (
                                            <Volume2 className="w-5 h-5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowTimeline(!showTimeline)}
                                        className="p-2 text-white/80 hover:text-white transition-colors"
                                    >
                                        <Layers className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 时间轴可视化 */}
                {showTimeline && (
                    <div className="max-w-3xl mx-auto">
                        <TimelineVisualizer
                            project={project}
                            currentTime={currentTime}
                            duration={duration}
                            onSeek={seek}
                        />
                    </div>
                )}

                {/* 当前活跃片段信息 */}
                <div className="mt-6 max-w-3xl mx-auto">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3">当前活跃片段</h3>
                        {activeClips.length === 0 ? (
                            <p className="text-gray-500 text-sm">无活跃片段</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {activeClips.map(({ track, clip }) => (
                                    <div
                                        key={clip.id}
                                        className="bg-gray-700/50 rounded px-3 py-2 text-sm"
                                    >
                                        <div className="flex items-center gap-2 text-white">
                                            <TrackIcon type={track.type} />
                                            <span className="truncate">{clip.asset}</span>
                                        </div>
                                        <div className="text-gray-400 text-xs mt-1">
                                            {formatTime(clip.time.start)} - {formatTime(clip.time.end)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
