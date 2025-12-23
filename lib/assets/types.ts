/**
 * 素材管理系统 - 类型定义
 * Asset Management System Types
 */

// ============================================
// 基础类型
// ============================================

/**
 * 素材类型
 */
export type AssetType = 'video' | 'audio' | 'image';

/**
 * 素材状态
 */
export type AssetStatus =
    | 'pending'     // 待处理
    | 'parsing'     // 解析中
    | 'ready'       // 就绪
    | 'error';      // 错误

/**
 * 视频元数据
 */
export interface VideoMetadata {
    width: number;
    height: number;
    duration: number;        // 秒
    frameRate: number;
    codec?: string;
    bitrate?: number;
}

/**
 * 音频元数据
 */
export interface AudioMetadata {
    duration: number;        // 秒
    sampleRate: number;
    channels: number;
    codec?: string;
    bitrate?: number;
}

/**
 * 图片元数据
 */
export interface ImageMetadata {
    width: number;
    height: number;
    format?: string;
}

/**
 * 素材元数据联合类型
 */
export type AssetMetadata = VideoMetadata | AudioMetadata | ImageMetadata;

// ============================================
// 核心素材类型
// ============================================

/**
 * 素材基础接口
 */
export interface BaseAsset {
    /** 唯一 ID */
    id: string;
    /** 素材类型 */
    type: AssetType;
    /** 显示名称 */
    name: string;
    /** 原始文件名 */
    filename: string;
    /** 文件大小（字节） */
    size: number;
    /** MIME 类型 */
    mimeType: string;
    /** 素材状态 */
    status: AssetStatus;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
    /** 缩略图 URL (Blob URL) */
    thumbnailUrl?: string;
    /** 错误信息 */
    error?: string;
    /** 用户标签 */
    tags?: string[];
    /** AI 自动标签 */
    aiTags?: string[];
}

/**
 * 视频素材
 */
export interface VideoAsset extends BaseAsset {
    type: 'video';
    /** Blob URL */
    url: string;
    /** 视频元数据 */
    metadata: VideoMetadata;
    /** 关键帧预览列表 */
    keyframeThumbnails?: string[];
    /** 波形数据（音频轨道） */
    waveformData?: number[];
}

/**
 * 音频素材
 */
export interface AudioAsset extends BaseAsset {
    type: 'audio';
    /** Blob URL */
    url: string;
    /** 音频元数据 */
    metadata: AudioMetadata;
    /** 波形数据 */
    waveformData?: number[];
    /** 节拍点 */
    beatMarkers?: number[];
}

/**
 * 图片素材
 */
export interface ImageAsset extends BaseAsset {
    type: 'image';
    /** Blob URL */
    url: string;
    /** 图片元数据 */
    metadata: ImageMetadata;
}

/**
 * 素材联合类型
 */
export type Asset = VideoAsset | AudioAsset | ImageAsset;

// ============================================
// 素材管理接口
// ============================================

/**
 * 素材上传选项
 */
export interface UploadOptions {
    /** 自定义名称 */
    name?: string;
    /** 初始标签 */
    tags?: string[];
    /** 是否生成缩略图 */
    generateThumbnail?: boolean;
    /** 是否生成波形 */
    generateWaveform?: boolean;
}

/**
 * 素材查询选项
 */
export interface QueryOptions {
    /** 素材类型过滤 */
    type?: AssetType | AssetType[];
    /** 状态过滤 */
    status?: AssetStatus | AssetStatus[];
    /** 标签过滤 */
    tags?: string[];
    /** 搜索关键词 */
    search?: string;
    /** 排序字段 */
    sortBy?: 'name' | 'createdAt' | 'size' | 'duration';
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc';
    /** 分页 */
    limit?: number;
    offset?: number;
}

/**
 * 素材解析结果
 */
export interface ParseResult<T extends Asset = Asset> {
    success: boolean;
    asset?: T;
    error?: string;
}

/**
 * 素材存储接口
 */
export interface AssetStore {
    /** 添加素材 */
    add(asset: Asset): Promise<void>;
    /** 获取素材 */
    get(id: string): Promise<Asset | undefined>;
    /** 更新素材 */
    update(id: string, updates: Partial<Asset>): Promise<void>;
    /** 删除素材 */
    delete(id: string): Promise<void>;
    /** 查询素材 */
    query(options?: QueryOptions): Promise<Asset[]>;
    /** 获取所有素材 */
    getAll(): Promise<Asset[]>;
    /** 清空所有素材 */
    clear(): Promise<void>;
}

// ============================================
// 事件类型
// ============================================

/**
 * 素材事件类型
 */
export type AssetEventType =
    | 'asset:added'
    | 'asset:updated'
    | 'asset:deleted'
    | 'asset:parsing'
    | 'asset:ready'
    | 'asset:error';

/**
 * 素材事件
 */
export interface AssetEvent {
    type: AssetEventType;
    asset: Asset;
    timestamp: Date;
}

/**
 * 上传进度事件
 */
export interface UploadProgressEvent {
    assetId: string;
    stage: 'uploading' | 'parsing' | 'generating-thumbnail' | 'complete';
    progress: number;  // 0-100
    message?: string;
}
