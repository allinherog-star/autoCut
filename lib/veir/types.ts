/**
 * VEIR v1.0 TypeScript 类型定义
 * Video Editing Intermediate Representation
 * 与 JSON Schema 保持同步
 */

// ============================================================================
// Meta - 项目环境配置
// ============================================================================

/**
 * 色彩空间
 */
export type ColorSpace = 'sRGB' | 'Display-P3' | 'Rec.709' | 'Rec.2020';

/**
 * 项目元数据
 */
export interface VEIRMeta {
    /** 画布分辨率 [width, height] */
    resolution: [number, number];
    /** 帧率 */
    fps: number;
    /** 视频总时长（秒） */
    duration: number;
    /** 色彩空间 */
    colorSpace: ColorSpace;
}

// ============================================================================
// Assets - 多模态素材池
// ============================================================================

/**
 * 素材类型
 */
export type AssetType = 'video' | 'audio' | 'text' | 'image';

/**
 * 单个素材定义
 */
export interface Asset {
    /** 素材类型 */
    type: AssetType;
    /** 媒体文件路径 */
    src?: string;
    /** 文本内容（仅 text 类型） */
    content?: string;
    /** 是否为可选素材 */
    optional?: boolean;
    /** 用户是否可以修改内容 */
    editable?: boolean;
    /** 语义角色 */
    semanticRole?: string;
    /** 是否允许 AI 自动替换 */
    autoReplace?: boolean;
}

/**
 * 素材池
 */
export interface VEIRAssets {
    /** key 为 assetId */
    assets: Record<string, Asset>;
}

// ============================================================================
// Vocabulary - 表达词汇表
// ============================================================================

/**
 * 行为类别
 */
export type ExpressionCategory = 'entrance' | 'exit' | 'emphasis';

/**
 * 行为表达定义
 */
export interface Expression {
    /** 行为类别 */
    category?: ExpressionCategory;
    /** 语义描述 */
    semantic?: string;
    /** 允许的强度范围 [min, max] */
    intensityRange?: [number, number];
}

/**
 * 预设类型
 */
export type PresetType = 'textStyle' | 'pipLayout' | 'transition';

/**
 * 锚点位置
 */
export type AnchorPosition =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center'
    | 'top'
    | 'bottom';

/**
 * 样式预设
 */
export interface Preset {
    /** 预设类型 */
    type?: PresetType;
    /** 风格分类 */
    category?: string;
    /** 锚点位置 */
    anchor?: AnchorPosition;
    /** 相对尺寸 [width, height] */
    size?: [number, number];
    /** 其他扩展属性 */
    [key: string]: unknown;
}

/**
 * 滤镜定义
 */
export interface Filter {
    /** 滤镜语义描述 */
    semantic?: string;
    /** 是否支持强度调节 */
    supportsIntensity?: boolean;
}

/**
 * 表达词汇表
 */
export interface VEIRVocabulary {
    /** 行为词汇 */
    expressions: Record<string, Expression>;
    /** 样式词汇 */
    presets: Record<string, Preset>;
    /** 滤镜词汇 */
    filters: Record<string, Filter>;
}

// ============================================================================
// Timeline - 时间轴核心 IR
// ============================================================================

/**
 * 轨道类型
 */
export type TrackType = 'video' | 'audio' | 'text' | 'subtitle' | 'pip';

/**
 * 字幕专用布局约束（用于保证字幕位置/对齐一致）
 * - 所有比率均以画布宽/高为基准（0-1）
 */
export interface SubtitleLayout {
    /** 字幕区域位置 */
    position?: 'top' | 'bottom';
    /** 水平对齐 */
    alignment?: 'left' | 'center' | 'right';
    /**
     * 安全区（避免贴边/刘海/遮挡）
     * - left/right: 以宽度为基准
     * - top/bottom: 以高度为基准
     */
    safeArea?: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    };
    /** 字幕最大宽度（占安全区宽度比率，0-1） */
    maxWidth?: number;
    /** 行高倍数（相对 fontSize，例如 1.2） */
    lineHeight?: number;
}

/**
 * 时间范围
 */
export interface TimeRange {
    /** 开始时间（秒） */
    start: number;
    /** 结束时间（秒） */
    end: number;
}

/**
 * 视觉风格引用
 */
export interface ExpressionRef {
    /** 引用的预设 ID */
    preset?: string;
    /** 表现强度 (0-1) */
    intensity?: number;
}

/**
 * 行为引用
 */
export interface Behavior {
    /** 入场行为 ID */
    enter?: string;
    /** 出场行为 ID */
    exit?: string;
}

/**
 * 转场类型（与产品侧 `lib/types.ts` 对齐）
 */
export type TransitionType = 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'blur';

/**
 * 剪辑转场配置（outgoing）
 * - 表示从当前 clip 过渡到同轨道的下一个 clip
 */
export interface ClipTransition {
    type: TransitionType;
    /** 转场时长（秒） */
    duration: number;
    /** 缓动函数（可选，语义级） */
    easing?: string;
}

/**
 * 剪辑片段
 */
export interface Clip {
    /** 片段唯一 ID */
    id: string;
    /** 引用的 assetId */
    asset: string;
    /** 时间范围 */
    time: TimeRange;
    /** 视觉风格引用 */
    expression?: ExpressionRef;
    /** 行为引用 */
    behavior?: Behavior;
    /**
     * 转场（从当前 clip 过渡到下一个 clip）
     * - 作用对象是“镜头间的缝”，但为简化序列化将其放在 outgoing clip 上
     */
    transitionOut?: ClipTransition;
}

/**
 * 时间轴轨道
 */
export interface Track {
    /** 轨道唯一 ID */
    id: string;
    /** 轨道类型 */
    type: TrackType;
    /** 渲染层级 */
    layer: number;
    /**
     * 轨道布局（仅字幕轨道使用）
     * - 当 type === 'subtitle' 时，用于统一字幕对齐与换行宽度
     */
    layout?: SubtitleLayout;
    /** 剪辑片段列表 */
    clips: Clip[];
}

/**
 * 时间轴
 */
export interface VEIRTimeline {
    /** 轨道列表 */
    tracks: Track[];
}

// ============================================================================
// Annotations - 可编辑锚点
// ============================================================================

/**
 * 可编辑锚点
 */
export interface Anchor {
    /** 锚点唯一 ID */
    id: string;
    /** 显示标签 */
    label?: string;
    /** 锚点帧位置 */
    frame: number;
    /** 可编辑能力列表 */
    editable: string[];
}

/**
 * 单个 clip 的锚点配置
 */
export interface ClipAnnotation {
    /** 锚点列表 */
    anchors?: Anchor[];
}

/**
 * 可编辑锚点配置
 */
export interface VEIRAnnotations {
    /** key 为 clipId */
    clips?: Record<string, ClipAnnotation>;
}

// ============================================================================
// Adjustments - 微调层
// ============================================================================

/**
 * 缓动函数
 */
export type EasingFunction =
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'spring';

/**
 * 变换调整
 */
export interface Transform {
    /** 缩放比例 */
    scale?: number;
    /** 位置偏移 [x, y] */
    offset?: [number, number];
    /** 旋转角度（度） */
    rotation?: number;
}

/**
 * 滤镜引用
 */
export interface FilterRef {
    /** 滤镜 ID */
    id?: string;
    /** 滤镜强度 (0-1) */
    intensity?: number;
}

/**
 * 关键帧运动状态
 */
export interface MotionState {
    [key: string]: unknown;
}

/**
 * 关键帧运动片段
 */
export interface MotionSegment {
    /** 运动时间区间 */
    when: TimeRange;
    /** 起始状态 */
    from: MotionState;
    /** 结束状态 */
    to: MotionState;
    /** 缓动函数 */
    easing?: EasingFunction;
}

/**
 * 视频时间重映射模式
 */
export type VideoTimeWarpMode = 'constant' | 'ramp';

/**
 * 视频时间重映射分段定义
 * - when：相对于 clip 起点的时间区间（秒）
 * - speed：播放速度倍率（1=正常，0.5=慢放，2=快放）
 * - easing：速度变化曲线（语义级，如 linear / easeOut）
 */
export interface VideoTimeWarpSegment {
    when: TimeRange;
    speed: number;
    easing?: string;
}

/**
 * 视频时间重映射（曲线变速 / 音乐卡点）
 */
export interface VideoTimeWarp {
    mode?: VideoTimeWarpMode;
    segments?: VideoTimeWarpSegment[];
}

/**
 * 时间微调
 */
export interface TimeAdjustment {
    /** 时间偏移量（秒） */
    offset?: number;
}

/**
 * 视频画面调整
 */
export interface VideoAdjustment {
    /** 裁剪区域 [top, right, bottom, left] */
    crop?: [number, number, number, number];
    /** 变换调整 */
    transform?: Transform;
    /** 滤镜引用 */
    filter?: FilterRef;
    /** 关键帧运动 */
    motion?: MotionSegment[];
    /** 视频时间重映射（曲线变速 / 音乐卡点） */
    timeWarp?: VideoTimeWarp;
}

/**
 * 单个 clip 的微调配置
 */
export interface ClipAdjustment {
    /** 时间微调 */
    time?: TimeAdjustment;
    /** 视频画面调整 */
    video?: VideoAdjustment;
}

/**
 * 微调层
 */
export interface VEIRAdjustments {
    /** key 为 clipId */
    clipOverrides?: Record<string, ClipAdjustment>;
}

// ============================================================================
// VEIR Project - 完整项目
// ============================================================================

/**
 * VEIR 完整项目
 */
export interface VEIRProject {
    /** 项目环境配置 */
    meta: VEIRMeta;
    /** 多模态素材池 */
    assets: VEIRAssets;
    /** 表达词汇表 */
    vocabulary: VEIRVocabulary;
    /** 时间轴核心 IR */
    timeline: VEIRTimeline;
    /** 可编辑锚点（可选） */
    annotations?: VEIRAnnotations;
    /** 微调层（可选） */
    adjustments?: VEIRAdjustments;
}
