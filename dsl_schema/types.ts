/**
 * 多模态智能剪辑 DSL TypeScript 类型定义
 * 与 JSON Schema 保持同步
 */

// ============================================================================
// Meta 模块 - 项目元信息
// ============================================================================

/**
 * 安全区域配置
 */
export interface SafeArea {
    /** 顶部安全区比例 (0-1) */
    top?: number;
    /** 底部安全区比例 (0-1) */
    bottom?: number;
}

/**
 * 项目元数据
 */
export interface Meta {
    /** 项目唯一 ID */
    projectId: string;
    /** DSL 或项目版本号（建议 semver） */
    version: string;
    /** 帧率（如 25 / 30） */
    fps: number;
    /** 画布分辨率 [width, height] */
    resolution: [number, number];
    /** 视频总时长（秒） */
    duration: number;
    /** 色彩空间，如 sRGB / Display-P3 */
    colorSpace?: string;
    /** 安全区比例配置 */
    safeArea?: SafeArea;
}

// ============================================================================
// Assets 模块 - 多模态素材池
// ============================================================================

/**
 * 素材类型
 */
export type AssetType = 'video' | 'audio' | 'image' | 'text';

/**
 * 单个素材定义
 */
export interface Asset {
    /** 素材类型 */
    type: AssetType;
    /** 媒体文件路径（video/audio/image） */
    src?: string;
    /** 文本内容（仅 text 类型） */
    content?: string;
    /** 用户是否可以修改内容 */
    editable?: boolean;
    /** 是否为可选素材 */
    optional?: boolean;
    /** 默认是否启用 */
    defaultEnabled?: boolean;
    /** 语义角色（如 background / speaker） */
    semanticRole?: string;
    /** 是否允许 AI 自动替换该素材 */
    autoReplace?: boolean;
    /** 音频是否循环 */
    loop?: boolean;
}

/**
 * 素材池
 */
export interface Assets {
    /** key 为 assetId，value 为素材描述 */
    assets: Record<string, Asset>;
}

// ============================================================================
// Expressions 模块 - 行为语义库
// ============================================================================

/**
 * 单个行为表达定义
 */
export interface Expression {
    /** 该行为的语义描述（供 AI 理解） */
    semantic?: string;
    /** 允许的强度范围 [min, max] */
    intensityRange?: [number, number];
}

/**
 * 行为表达映射
 */
export type ExpressionMap = Record<string, Expression>;

/**
 * 行为语义库
 */
export interface Expressions {
    /** 入场行为（出现方式） */
    entrances?: ExpressionMap;
    /** 出场行为（消失方式） */
    exits?: ExpressionMap;
    /** 强调行为（抖动、闪烁等） */
    emphasis?: ExpressionMap;
}

// ============================================================================
// Presets 模块 - 视觉风格模板
// ============================================================================

/**
 * 文本风格定义
 */
export interface TextStyle {
    /** 风格分类（综艺 / 信息 / 情绪） */
    category?: string;
    /** 渲染层次结构 */
    layers?: string[];
    /** 默认表现强度 (0-1) */
    defaultIntensity?: number;
}

/**
 * 画中画锚点位置
 */
export type PipAnchor =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center';

/**
 * 画中画布局定义
 */
export interface PipLayout {
    /** 锚点位置 */
    anchor?: PipAnchor;
    /** 相对尺寸比例 [width, height] */
    size?: [number, number];
    /** 圆角半径 */
    radius?: number;
}

/**
 * 视觉模板库
 */
export interface Presets {
    /** 文本 / 花字风格 */
    textStyles?: Record<string, TextStyle>;
    /** 画中画布局模板 */
    pipLayouts?: Record<string, PipLayout>;
}

// ============================================================================
// Timeline 模块 - 时间轴剪辑语言
// ============================================================================

/**
 * 轨道类型
 */
export type TrackType = 'video' | 'audio' | 'text' | 'pip' | 'image';

/**
 * 时间范围（秒）
 */
export interface TimeRange {
    /** 开始时间 */
    start: number;
    /** 结束时间 */
    end: number;
}

/**
 * 视觉风格引用
 */
export interface ExpressionRef {
    /** 引用 presets 中的风格 */
    preset?: string;
    /** 表现强度 (0-1) */
    intensity?: number;
}

/**
 * 行为引用
 */
export interface Behavior {
    /** 入场行为 */
    enter?: string;
    /** 出场行为 */
    exit?: string;
    /** 强调行为列表 */
    emphasis?: string[];
}

/**
 * 布局控制
 */
export interface Layout {
    /** 布局区域 */
    zone?: string;
    /** 是否使用安全区 */
    safeArea?: boolean;
    /** 引用的布局预设 */
    preset?: string;
}

/**
 * 剪辑片段
 */
export interface Clip {
    /** 片段 ID */
    id: string;
    /** 引用的 assetId */
    asset: string;
    /** 是否启用该片段 */
    enabled?: boolean;
    /** 时间范围 */
    time: TimeRange;
    /** 来源语义（如 hook / explain） */
    sourceSemantic?: string;
    /** 视觉风格引用 */
    expression?: ExpressionRef;
    /** 行为引用 */
    behavior?: Behavior;
    /** 布局控制 */
    layout?: Layout;
}

/**
 * 时间轴轨道
 */
export interface Track {
    /** 轨道 ID */
    id: string;
    /** 轨道类型 */
    type: TrackType;
    /** 渲染层级（越大越靠上） */
    layer: number;
    /** 该轨道上的剪辑片段 */
    clips: Clip[];
}

/**
 * 时间轴
 */
export interface Timeline {
    /** 轨道列表 */
    tracks: Track[];
}

// ============================================================================
// 完整 DSL 项目
// ============================================================================

/**
 * 完整的多模态智能剪辑 DSL 项目
 */
export interface DSLProject {
    /** 项目级元信息 */
    meta: Meta;
    /** 多模态素材池 */
    assets: Assets;
    /** 抽象行为语义库（可选） */
    expressions?: Expressions;
    /** 视觉风格与布局模板库（可选） */
    presets?: Presets;
    /** 时间轴剪辑语言 */
    timeline: Timeline;
}
