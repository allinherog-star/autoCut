/**
 * 素材管理器
 * Asset Manager - 统一管理素材的生命周期
 */

import type {
    Asset,
    AssetStore,
    AssetEvent,
    AssetEventType,
    UploadOptions,
    QueryOptions,
    UploadProgressEvent,
} from './types';
import { createAssetStore } from './store/indexed-db-store';
import { parseAsset } from './parser/asset-parser';

type EventListener = (event: AssetEvent) => void;
type ProgressListener = (event: UploadProgressEvent) => void;

/**
 * 素材管理器
 * 单例模式，统一管理所有素材操作
 */
export class AssetManager {
    private store: AssetStore;
    private listeners: Map<AssetEventType, Set<EventListener>> = new Map();
    private progressListeners: Set<ProgressListener> = new Set();
    private memoryAssets: Map<string, Asset> = new Map(); // 内存缓存

    constructor(store?: AssetStore) {
        this.store = store || createAssetStore();
    }

    // ============================================
    // 素材操作
    // ============================================

    /**
     * 上传并解析素材
     */
    async upload(file: File, options?: UploadOptions): Promise<Asset> {
        // 发送进度事件
        const tempId = `temp_${Date.now()}`;
        this.emitProgress({
            assetId: tempId,
            stage: 'uploading',
            progress: 0,
            message: '准备上传...',
        });

        // 解析文件
        this.emitProgress({
            assetId: tempId,
            stage: 'parsing',
            progress: 30,
            message: '解析素材...',
        });

        const result = await parseAsset(file, options);

        if (!result.success || !result.asset) {
            throw new Error(result.error || '素材解析失败');
        }

        const asset = result.asset;

        // 应用自定义名称
        if (options?.name) {
            asset.name = options.name;
        }

        // 应用标签
        if (options?.tags) {
            asset.tags = options.tags;
        }

        this.emitProgress({
            assetId: asset.id,
            stage: 'generating-thumbnail',
            progress: 70,
            message: '生成预览...',
        });

        // 保存到存储
        await this.store.add(asset);
        this.memoryAssets.set(asset.id, asset);

        this.emitProgress({
            assetId: asset.id,
            stage: 'complete',
            progress: 100,
            message: '上传完成',
        });

        // 发送事件
        this.emit({
            type: 'asset:added',
            asset,
            timestamp: new Date(),
        });

        return asset;
    }

    /**
     * 批量上传素材
     */
    async uploadMultiple(
        files: File[],
        options?: UploadOptions & {
            onProgress?: (current: number, total: number) => void;
        }
    ): Promise<Asset[]> {
        const assets: Asset[] = [];

        for (let i = 0; i < files.length; i++) {
            try {
                const asset = await this.upload(files[i], options);
                assets.push(asset);
            } catch (error) {
                console.error(`上传失败: ${files[i].name}`, error);
            }
            options?.onProgress?.(i + 1, files.length);
        }

        return assets;
    }

    /**
     * 获取素材
     */
    async get(id: string): Promise<Asset | undefined> {
        // 优先从内存缓存获取
        if (this.memoryAssets.has(id)) {
            return this.memoryAssets.get(id);
        }

        const asset = await this.store.get(id);
        if (asset) {
            this.memoryAssets.set(id, asset);
        }
        return asset;
    }

    /**
     * 更新素材
     */
    async update(id: string, updates: Partial<Asset>): Promise<Asset> {
        await this.store.update(id, updates);

        const asset = await this.store.get(id);
        if (!asset) {
            throw new Error(`素材不存在: ${id}`);
        }

        this.memoryAssets.set(id, asset);

        this.emit({
            type: 'asset:updated',
            asset,
            timestamp: new Date(),
        });

        return asset;
    }

    /**
     * 删除素材
     */
    async delete(id: string): Promise<void> {
        const asset = await this.get(id);
        if (!asset) {
            return;
        }

        // 释放 Blob URL
        if (asset.url) {
            URL.revokeObjectURL(asset.url);
        }
        if (asset.thumbnailUrl && asset.thumbnailUrl.startsWith('blob:')) {
            URL.revokeObjectURL(asset.thumbnailUrl);
        }

        await this.store.delete(id);
        this.memoryAssets.delete(id);

        this.emit({
            type: 'asset:deleted',
            asset,
            timestamp: new Date(),
        });
    }

    /**
     * 查询素材
     */
    async query(options?: QueryOptions): Promise<Asset[]> {
        return this.store.query(options);
    }

    /**
     * 获取所有素材
     */
    async getAll(): Promise<Asset[]> {
        return this.store.getAll();
    }

    /**
     * 清空所有素材
     */
    async clear(): Promise<void> {
        const assets = await this.getAll();

        // 释放所有 Blob URL
        for (const asset of assets) {
            if (asset.url) {
                URL.revokeObjectURL(asset.url);
            }
            if (asset.thumbnailUrl && asset.thumbnailUrl.startsWith('blob:')) {
                URL.revokeObjectURL(asset.thumbnailUrl);
            }
        }

        await this.store.clear();
        this.memoryAssets.clear();
    }

    // ============================================
    // 事件系统
    // ============================================

    /**
     * 监听素材事件
     */
    on(type: AssetEventType, listener: EventListener): () => void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)!.add(listener);

        // 返回取消订阅函数
        return () => {
            this.listeners.get(type)?.delete(listener);
        };
    }

    /**
     * 监听上传进度
     */
    onProgress(listener: ProgressListener): () => void {
        this.progressListeners.add(listener);
        return () => {
            this.progressListeners.delete(listener);
        };
    }

    /**
     * 发送事件
     */
    private emit(event: AssetEvent): void {
        this.listeners.get(event.type)?.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Event listener error:', error);
            }
        });
    }

    /**
     * 发送进度事件
     */
    private emitProgress(event: UploadProgressEvent): void {
        this.progressListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Progress listener error:', error);
            }
        });
    }
}

// ============================================
// 单例
// ============================================

let instance: AssetManager | null = null;

/**
 * 获取素材管理器单例
 */
export function getAssetManager(): AssetManager {
    if (!instance) {
        instance = new AssetManager();
    }
    return instance;
}
