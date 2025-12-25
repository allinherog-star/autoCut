/**
 * 素材库服务
 * 统一管理本地和远程素材资源
 * 支持扩展 iconfont.cn / icons8.com 等外部素材源
 */

// ============================================
// 类型定义
// ============================================

/**
 * 素材类型
 */
export type AssetType =
  | 'video'
  | 'image'
  | 'audio'
  | 'svg'
  | 'sticker'
  | 'emoji'
  | 'icon'
  | 'font'
  | 'effect'
  | 'transition';

/**
 * 素材分类
 */
export type AssetCategory =
  | 'backgrounds'
  | 'overlays'
  | 'stickers'
  | 'icons'
  | 'emojis'
  | 'music'
  | 'sound_effects'
  | 'fonts'
  | 'effects'
  | 'transitions'
  | 'templates';

/**
 * 素材源
 */
export type AssetSource = 'local' | 'iconfont' | 'icons8' | 'custom';

/**
 * 素材元数据
 */
export interface AssetMetadata {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  source: AssetSource;
  src: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  fileSize?: number;
  tags?: string[];
  license?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 素材搜索参数
 */
export interface AssetSearchParams {
  query?: string;
  type?: AssetType | AssetType[];
  category?: AssetCategory | AssetCategory[];
  source?: AssetSource | AssetSource[];
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * 素材搜索结果
 */
export interface AssetSearchResult {
  assets: AssetMetadata[];
  total: number;
  hasMore: boolean;
}

/**
 * 素材源配置
 */
export interface AssetSourceConfig {
  iconfont?: {
    baseUrl?: string;
    apiKey?: string;
  };
  icons8?: {
    baseUrl?: string;
    apiKey?: string;
  };
  custom?: {
    baseUrl: string;
    headers?: Record<string, string>;
  };
}

// ============================================
// 素材库服务
// ============================================

export class AssetLibraryService {
  private localAssets: Map<string, AssetMetadata> = new Map();
  private config: AssetSourceConfig;

  constructor(config?: AssetSourceConfig) {
    this.config = config || {};
  }

  // ============================================
  // 本地素材管理
  // ============================================

  /**
   * 注册本地素材
   */
  registerLocalAsset(asset: AssetMetadata): void {
    this.localAssets.set(asset.id, {
      ...asset,
      source: 'local',
    });
  }

  /**
   * 批量注册本地素材
   */
  registerLocalAssets(assets: AssetMetadata[]): void {
    assets.forEach((asset) => this.registerLocalAsset(asset));
  }

  /**
   * 获取本地素材
   */
  getLocalAsset(id: string): AssetMetadata | undefined {
    return this.localAssets.get(id);
  }

  /**
   * 移除本地素材
   */
  removeLocalAsset(id: string): boolean {
    return this.localAssets.delete(id);
  }

  // ============================================
  // 搜索功能
  // ============================================

  /**
   * 搜索素材
   */
  async search(params: AssetSearchParams): Promise<AssetSearchResult> {
    const results: AssetMetadata[] = [];

    // 搜索本地素材
    const localResults = this.searchLocal(params);
    results.push(...localResults);

    // 搜索远程素材（如果配置了）
    if (this.shouldSearchRemote(params)) {
      try {
        const remoteResults = await this.searchRemote(params);
        results.push(...remoteResults);
      } catch (error) {
        console.error('Remote asset search failed:', error);
      }
    }

    // 分页
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      assets: paginatedResults,
      total: results.length,
      hasMore: offset + limit < results.length,
    };
  }

  /**
   * 搜索本地素材
   */
  private searchLocal(params: AssetSearchParams): AssetMetadata[] {
    let results = Array.from(this.localAssets.values());

    // 按类型过滤
    if (params.type) {
      const types = Array.isArray(params.type) ? params.type : [params.type];
      results = results.filter((a) => types.includes(a.type));
    }

    // 按分类过滤
    if (params.category) {
      const categories = Array.isArray(params.category) ? params.category : [params.category];
      results = results.filter((a) => categories.includes(a.category));
    }

    // 按标签过滤
    if (params.tags && params.tags.length > 0) {
      results = results.filter((a) =>
        params.tags!.some((tag) => a.tags?.includes(tag))
      );
    }

    // 关键词搜索
    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    return results;
  }

  /**
   * 搜索远程素材
   */
  private async searchRemote(params: AssetSearchParams): Promise<AssetMetadata[]> {
    const results: AssetMetadata[] = [];

    // iconfont.cn 搜索
    if (this.config.iconfont?.apiKey) {
      try {
        const iconfontResults = await this.searchIconfont(params);
        results.push(...iconfontResults);
      } catch (error) {
        console.error('Iconfont search failed:', error);
      }
    }

    // icons8.com 搜索
    if (this.config.icons8?.apiKey) {
      try {
        const icons8Results = await this.searchIcons8(params);
        results.push(...icons8Results);
      } catch (error) {
        console.error('Icons8 search failed:', error);
      }
    }

    return results;
  }

  /**
   * 搜索 iconfont.cn
   */
  private async searchIconfont(params: AssetSearchParams): Promise<AssetMetadata[]> {
    // iconfont.cn API 集成占位
    // 实际实现需要根据 iconfont API 文档
    const baseUrl = this.config.iconfont?.baseUrl || 'https://www.iconfont.cn/api';
    
    // TODO: 实现 iconfont API 调用
    console.log(`Searching iconfont: ${baseUrl}`, params);
    
    return [];
  }

  /**
   * 搜索 icons8.com
   */
  private async searchIcons8(params: AssetSearchParams): Promise<AssetMetadata[]> {
    // icons8.com API 集成占位
    // 实际实现需要根据 icons8 API 文档
    const baseUrl = this.config.icons8?.baseUrl || 'https://api.icons8.com';
    
    // TODO: 实现 icons8 API 调用
    console.log(`Searching icons8: ${baseUrl}`, params);
    
    return [];
  }

  private shouldSearchRemote(params: AssetSearchParams): boolean {
    // 如果指定了 source 为 local，则不搜索远程
    if (params.source) {
      const sources = Array.isArray(params.source) ? params.source : [params.source];
      if (sources.every((s) => s === 'local')) return false;
    }
    return true;
  }

  // ============================================
  // 素材下载
  // ============================================

  /**
   * 下载素材
   */
  async download(asset: AssetMetadata): Promise<Blob> {
    const response = await fetch(asset.src);
    if (!response.ok) {
      throw new Error(`Failed to download asset: ${asset.id}`);
    }
    return response.blob();
  }

  /**
   * 获取素材 URL（处理远程素材的代理等）
   */
  async getAssetUrl(asset: AssetMetadata): Promise<string> {
    if (asset.source === 'local') {
      return asset.src;
    }

    // 对于远程素材，可能需要代理或签名
    // 这里简化处理直接返回原始 URL
    return asset.src;
  }

  // ============================================
  // 分类管理
  // ============================================

  /**
   * 获取所有分类
   */
  getCategories(): AssetCategory[] {
    const categories = new Set<AssetCategory>();
    this.localAssets.forEach((asset) => categories.add(asset.category));
    return Array.from(categories);
  }

  /**
   * 获取分类下的素材数量
   */
  getCategoryCount(category: AssetCategory): number {
    return Array.from(this.localAssets.values()).filter(
      (a) => a.category === category
    ).length;
  }

  /**
   * 获取所有标签
   */
  getTags(): string[] {
    const tags = new Set<string>();
    this.localAssets.forEach((asset) => {
      asset.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }

  // ============================================
  // 清理
  // ============================================

  /**
   * 清空本地素材缓存
   */
  clear(): void {
    this.localAssets.clear();
  }
}

// ============================================
// 预设素材加载器
// ============================================

/**
 * 从目录加载素材
 */
export async function loadAssetsFromDirectory(
  basePath: string,
  category: AssetCategory
): Promise<AssetMetadata[]> {
  // 这个函数需要在服务端或构建时运行
  // 前端使用时需要通过 API 获取素材列表
  console.log(`Loading assets from: ${basePath}, category: ${category}`);
  return [];
}

/**
 * 创建素材元数据
 */
export function createAssetMetadata(
  id: string,
  name: string,
  src: string,
  type: AssetType,
  category: AssetCategory,
  options?: Partial<AssetMetadata>
): AssetMetadata {
  return {
    id,
    name,
    type,
    category,
    source: 'local',
    src,
    ...options,
  };
}

// ============================================
// 默认素材库实例
// ============================================

let defaultLibrary: AssetLibraryService | null = null;

/**
 * 获取默认素材库实例
 */
export function getAssetLibrary(config?: AssetSourceConfig): AssetLibraryService {
  if (!defaultLibrary) {
    defaultLibrary = new AssetLibraryService(config);
  }
  return defaultLibrary;
}

/**
 * 重置默认素材库
 */
export function resetAssetLibrary(): void {
  defaultLibrary?.clear();
  defaultLibrary = null;
}








