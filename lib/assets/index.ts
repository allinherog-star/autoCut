/**
 * 素材管理系统 - 模块入口
 * Asset Management System
 */

// 类型导出
export * from './types';

// 存储层
export { AssetIndexedDBStore, createAssetStore } from './store/indexed-db-store';

// 解析器
export { parseVideoAsset } from './parser/video-parser';
export { parseAudioAsset } from './parser/audio-parser';
export { parseImageAsset } from './parser/image-parser';
export { parseAsset } from './parser/asset-parser';

// 管理器
export { AssetManager, getAssetManager } from './manager';
