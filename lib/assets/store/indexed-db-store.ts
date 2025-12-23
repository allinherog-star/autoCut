/**
 * 素材存储层 - IndexedDB 实现
 * Persists assets to browser IndexedDB
 */

import type {
    Asset,
    AssetStore,
    QueryOptions,
    AssetType,
    AssetStatus,
} from '../types';

const DB_NAME = 'dongjian-assets';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

/**
 * IndexedDB 素材存储实现
 */
export class AssetIndexedDBStore implements AssetStore {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    constructor() {
        this.initPromise = this.init();
    }

    /**
     * 初始化数据库
     */
    private async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // 创建素材存储
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

                    // 创建索引
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    store.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    /**
     * 确保数据库已初始化
     */
    private async ensureDB(): Promise<IDBDatabase> {
        await this.initPromise;
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }

    /**
     * 添加素材
     */
    async add(asset: Asset): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            // 序列化 Date 对象
            const serialized = {
                ...asset,
                createdAt: asset.createdAt.toISOString(),
                updatedAt: asset.updatedAt.toISOString(),
            };

            const request = store.add(serialized);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to add asset'));
        });
    }

    /**
     * 获取素材
     */
    async get(id: string): Promise<Asset | undefined> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    resolve(this.deserialize(result));
                } else {
                    resolve(undefined);
                }
            };
            request.onerror = () => reject(new Error('Failed to get asset'));
        });
    }

    /**
     * 更新素材
     */
    async update(id: string, updates: Partial<Asset>): Promise<void> {
        const db = await this.ensureDB();
        const existing = await this.get(id);
        if (!existing) {
            throw new Error(`Asset not found: ${id}`);
        }

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            const updated = {
                ...existing,
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            const request = store.put(updated);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to update asset'));
        });
    }

    /**
     * 删除素材
     */
    async delete(id: string): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete asset'));
        });
    }

    /**
     * 查询素材
     */
    async query(options?: QueryOptions): Promise<Asset[]> {
        const all = await this.getAll();
        let results = all;

        if (options) {
            // 类型过滤
            if (options.type) {
                const types = Array.isArray(options.type) ? options.type : [options.type];
                results = results.filter(a => types.includes(a.type));
            }

            // 状态过滤
            if (options.status) {
                const statuses = Array.isArray(options.status) ? options.status : [options.status];
                results = results.filter(a => statuses.includes(a.status));
            }

            // 标签过滤
            if (options.tags && options.tags.length > 0) {
                results = results.filter(a =>
                    options.tags!.some(tag =>
                        a.tags?.includes(tag) || a.aiTags?.includes(tag)
                    )
                );
            }

            // 搜索
            if (options.search) {
                const search = options.search.toLowerCase();
                results = results.filter(a =>
                    a.name.toLowerCase().includes(search) ||
                    a.filename.toLowerCase().includes(search) ||
                    a.tags?.some(t => t.toLowerCase().includes(search)) ||
                    a.aiTags?.some(t => t.toLowerCase().includes(search))
                );
            }

            // 排序
            if (options.sortBy) {
                const order = options.sortOrder === 'desc' ? -1 : 1;
                results.sort((a, b) => {
                    let aVal: any, bVal: any;
                    switch (options.sortBy) {
                        case 'name':
                            aVal = a.name;
                            bVal = b.name;
                            break;
                        case 'createdAt':
                            aVal = a.createdAt.getTime();
                            bVal = b.createdAt.getTime();
                            break;
                        case 'size':
                            aVal = a.size;
                            bVal = b.size;
                            break;
                        case 'duration':
                            aVal = (a as any).metadata?.duration ?? 0;
                            bVal = (b as any).metadata?.duration ?? 0;
                            break;
                        default:
                            return 0;
                    }
                    if (aVal < bVal) return -order;
                    if (aVal > bVal) return order;
                    return 0;
                });
            }

            // 分页
            if (options.offset !== undefined || options.limit !== undefined) {
                const offset = options.offset ?? 0;
                const limit = options.limit ?? results.length;
                results = results.slice(offset, offset + limit);
            }
        }

        return results;
    }

    /**
     * 获取所有素材
     */
    async getAll(): Promise<Asset[]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result.map(r => this.deserialize(r));
                resolve(results);
            };
            request.onerror = () => reject(new Error('Failed to get all assets'));
        });
    }

    /**
     * 清空所有素材
     */
    async clear(): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to clear assets'));
        });
    }

    /**
     * 反序列化存储的数据
     */
    private deserialize(data: any): Asset {
        return {
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        } as Asset;
    }
}

/**
 * 创建素材存储实例
 */
export function createAssetStore(): AssetStore {
    return new AssetIndexedDBStore();
}
