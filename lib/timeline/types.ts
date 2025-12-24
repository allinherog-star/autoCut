/**
 * 时间轴编辑器 - 类型定义
 * Timeline Editor Types
 * 与 VEIR Timeline 保持兼容
 */

import type { Track, Clip, TimeRange, TrackType } from '@/lib/veir/types';

// ============================================
// UI 状态类型
// ============================================

/**
 * 时间轴显示配置
 */
export interface TimelineViewConfig {
    /** 每秒像素数 */
    pixelsPerSecond: number;
    /** 轨道高度 */
    trackHeight: number;
    /** 最小缩放 */
    minZoom: number;
    /** 最大缩放 */
    maxZoom: number;
    /** 时间标尺高度 */
    rulerHeight: number;
    /** 左侧面板宽度 */
    sidebarWidth: number;
}

/**
 * 播放状态
 */
export interface PlaybackState {
    /** 是否正在播放 */
    isPlaying: boolean;
    /** 当前播放时间（秒） */
    currentTime: number;
    /** 总时长（秒） */
    duration: number;
    /** 播放速率 */
    playbackRate: number;
    /** 循环播放 */
    loop: boolean;
}

/**
 * 选择状态
 */
export interface SelectionState {
    /** 选中的轨道 ID 列表 */
    selectedTrackIds: string[];
    /** 选中的片段 ID 列表 */
    selectedClipIds: string[];
    /** 时间选区 */
    timeSelection?: TimeRange;
}

/**
 * 拖拽状态
 */
export interface DragState {
    /** 是否正在拖拽 */
    isDragging: boolean;
    /** 拖拽类型 */
    dragType?: 'clip' | 'clip-edge-left' | 'clip-edge-right' | 'playhead' | 'selection';
    /** 拖拽的片段 ID */
    dragClipId?: string;
    /** 拖拽起始位置 */
    dragStartX?: number;
    /** 拖拽起始时间 */
    dragStartTime?: number;
}

/**
 * 历史记录项
 */
export interface HistoryEntry {
    /** 操作描述 */
    description: string;
    /** 时间戳 */
    timestamp: Date;
    /** 操作前状态快照 */
    beforeState: TimelineData;
    /** 操作后状态快照 */
    afterState: TimelineData;
}

// ============================================
// 核心数据类型
// ============================================

/**
 * 时间轴数据（与 VEIR Timeline 兼容）
 */
export interface TimelineData {
    /** 轨道列表 */
    tracks: Track[];
    /** 总时长 */
    duration: number;
}

/**
 * UI 扩展的轨道信息
 */
export interface TimelineTrack extends Track {
    /** 是否折叠 */
    collapsed?: boolean;
    /** 是否锁定 */
    locked?: boolean;
    /** 是否静音 */
    muted?: boolean;
    /** 是否隐藏 */
    hidden?: boolean;
    /** 显示名称 */
    displayName?: string;
    /** 轨道颜色 */
    color?: string;
}

/**
 * UI 扩展的片段信息
 */
export interface TimelineClip extends Clip {
    /** 是否被选中 */
    selected?: boolean;
    /** 原始素材时长 */
    sourceDuration?: number;
    /** 素材裁剪范围 */
    sourceRange?: TimeRange;
    /** 播放速度 */
    speed?: number;
    /** 音量 */
    volume?: number;
}

// ============================================
// 时间轴状态
// ============================================

/**
 * 完整的时间轴状态
 */
export interface TimelineState {
    /** 时间轴数据 */
    data: TimelineData;
    /** 显示配置 */
    view: TimelineViewConfig;
    /** 播放状态 */
    playback: PlaybackState;
    /** 选择状态 */
    selection: SelectionState;
    /** 拖拽状态 */
    drag: DragState;
    /** 历史记录 */
    history: HistoryEntry[];
    /** 当前历史索引 */
    historyIndex: number;
    /** 是否有未保存的更改 */
    isDirty: boolean;
}

// ============================================
// 操作类型
// ============================================

/**
 * 时间轴操作类型
 */
export type TimelineAction =
    // 轨道操作
    | { type: 'ADD_TRACK'; trackType: TrackType; index?: number }
    | { type: 'REMOVE_TRACK'; trackId: string }
    | { type: 'UPDATE_TRACK'; trackId: string; updates: Partial<TimelineTrack> }
    | { type: 'REORDER_TRACKS'; fromIndex: number; toIndex: number }
    // 片段操作
    | { type: 'ADD_CLIP'; trackId: string; clip: Clip }
    | { type: 'REMOVE_CLIP'; trackId: string; clipId: string }
    | { type: 'UPDATE_CLIP'; trackId: string; clipId: string; updates: Partial<TimelineClip> }
    | { type: 'MOVE_CLIP'; clipId: string; targetTrackId: string; newStart: number }
    | { type: 'SPLIT_CLIP'; trackId: string; clipId: string; splitTime: number }
    | { type: 'TRIM_CLIP'; trackId: string; clipId: string; edge: 'left' | 'right'; newTime: number }
    // 播放控制
    | { type: 'PLAY' }
    | { type: 'PAUSE' }
    | { type: 'SEEK'; time: number }
    | { type: 'SET_DURATION'; duration: number }
    | { type: 'SET_PLAYBACK_RATE'; rate: number }
    // 选择操作
    | { type: 'SELECT_TRACK'; trackId: string; additive?: boolean }
    | { type: 'SELECT_CLIP'; clipId: string; additive?: boolean }
    | { type: 'SELECT_TIME_RANGE'; range: TimeRange }
    | { type: 'CLEAR_SELECTION' }
    // 视图操作
    | { type: 'ZOOM_IN' }
    | { type: 'ZOOM_OUT' }
    | { type: 'SET_ZOOM'; pixelsPerSecond: number }
    | { type: 'FIT_TO_VIEW'; containerWidth: number }
    // 历史操作
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'SAVE_HISTORY'; description: string }
    // 数据操作
    | { type: 'LOAD_DATA'; data: TimelineData }
    | { type: 'RESET' };

// ============================================
// 事件类型
// ============================================

/**
 * 时间轴事件
 */
export type TimelineEvent =
    | { type: 'clip:added'; trackId: string; clip: Clip }
    | { type: 'clip:removed'; trackId: string; clipId: string }
    | { type: 'clip:updated'; trackId: string; clipId: string; updates: Partial<Clip> }
    | { type: 'clip:moved'; clipId: string; fromTrackId: string; toTrackId: string }
    | { type: 'track:added'; track: Track }
    | { type: 'track:removed'; trackId: string }
    | { type: 'playback:started' }
    | { type: 'playback:paused' }
    | { type: 'playback:seeked'; time: number }
    | { type: 'selection:changed'; selection: SelectionState }
    | { type: 'data:loaded' }
    | { type: 'data:changed' };

// ============================================
// 默认配置
// ============================================

export const DEFAULT_VIEW_CONFIG: TimelineViewConfig = {
    pixelsPerSecond: 50,
    trackHeight: 60,
    minZoom: 5,
    maxZoom: 200,
    rulerHeight: 32,
    sidebarWidth: 180,
};

export const DEFAULT_PLAYBACK_STATE: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: 60,
    playbackRate: 1,
    loop: false,
};

export const DEFAULT_SELECTION_STATE: SelectionState = {
    selectedTrackIds: [],
    selectedClipIds: [],
};

export const DEFAULT_DRAG_STATE: DragState = {
    isDragging: false,
};

/**
 * 轨道类型对应的颜色
 */
export const TRACK_TYPE_COLORS: Record<TrackType, string> = {
    video: '#6366f1',   // 靛蓝
    audio: '#22c55e',   // 绿色
    text: '#f59e0b',    // 橙色
    subtitle: '#eab308', // 黄
    pip: '#ec4899',     // 粉色
};
