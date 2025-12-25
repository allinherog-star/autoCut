'use client';

/**
 * 素材列表组件
 * Asset List Component
 */

import React, { useEffect, useState, useCallback } from 'react';
import { getAssetManager, type Asset, type AssetType } from '@/lib/assets';
import { formatFileSize, formatDuration } from '@/lib/assets/parser/utils';

interface AssetListProps {
    /** 素材类型过滤 */
    filter?: AssetType | 'all';
    /** 选中的素材 ID */
    selectedId?: string;
    /** 选中素材回调 */
    onSelect?: (asset: Asset) => void;
    /** 删除素材回调 */
    onDelete?: (asset: Asset) => void;
    /** 双击素材回调（如添加到时间轴） */
    onDoubleClick?: (asset: Asset) => void;
    /** 自定义类名 */
    className?: string;
}

export function AssetList({
    filter = 'all',
    selectedId,
    onSelect,
    onDelete,
    onDoubleClick,
    className = '',
}: AssetListProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);

    // 加载素材列表
    const loadAssets = useCallback(async () => {
        setLoading(true);
        try {
            const manager = getAssetManager();
            const allAssets = await manager.query(
                filter !== 'all' ? { type: filter } : undefined
            );
            setAssets(allAssets);
        } catch (error) {
            console.error('Failed to load assets:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    // 初始加载
    useEffect(() => {
        loadAssets();

        // 监听素材变化
        const manager = getAssetManager();
        const unsubAdd = manager.on('asset:added', () => loadAssets());
        const unsubUpdate = manager.on('asset:updated', () => loadAssets());
        const unsubDelete = manager.on('asset:deleted', () => loadAssets());

        return () => {
            unsubAdd();
            unsubUpdate();
            unsubDelete();
        };
    }, [loadAssets]);

    // 删除素材
    const handleDelete = useCallback(async (e: React.MouseEvent, asset: Asset) => {
        e.stopPropagation();
        if (confirm(`确定删除素材 "${asset.name}" 吗？`)) {
            try {
                const manager = getAssetManager();
                await manager.delete(asset.id);
                onDelete?.(asset);
            } catch (error) {
                console.error('Failed to delete asset:', error);
            }
        }
    }, [onDelete]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 text-gray-400 ${className}`}>
                <svg
                    className="w-12 h-12 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
                <p>暂无素材</p>
                <p className="text-sm">拖拽或点击上传区域添加素材</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-2 gap-2 p-2 ${className}`}>
            {assets.map((asset) => (
                <AssetCard
                    key={asset.id}
                    asset={asset}
                    selected={asset.id === selectedId}
                    onClick={() => onSelect?.(asset)}
                    onDoubleClick={() => onDoubleClick?.(asset)}
                    onDelete={(e) => handleDelete(e, asset)}
                />
            ))}
        </div>
    );
}

// ============================================
// 素材卡片组件
// ============================================

interface AssetCardProps {
    asset: Asset;
    selected?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
    onDelete?: (e: React.MouseEvent) => void;
}

function AssetCard({ asset, selected, onClick, onDoubleClick, onDelete }: AssetCardProps) {
    const typeIcon = {
        video: '🎬',
        audio: '🎵',
        image: '🖼️',
    }[asset.type];

    const duration = asset.type === 'video' || asset.type === 'audio'
        ? formatDuration(asset.metadata.duration || 0)
        : null;

    return (
        <div
            className={`
        group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 hover:ring-2 hover:ring-indigo-500
        ${selected ? 'ring-2 ring-indigo-500' : ''}
      `}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            {/* 缩略图 */}
            <div className="aspect-video bg-gray-900 relative">
                {asset.thumbnailUrl ? (
                    <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        {typeIcon}
                    </div>
                )}

                {/* 时长标签 */}
                {duration && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                        {duration}
                    </span>
                )}

                {/* 类型标签 */}
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                    {typeIcon}
                </span>

                {/* 删除按钮 */}
                <button
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 rounded opacity-0 group-hover:opacity-100 
                     transition-opacity flex items-center justify-center hover:bg-red-500"
                    onClick={onDelete}
                >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* 信息 */}
            <div className="p-2">
                <p className="text-sm text-white truncate" title={asset.name}>
                    {asset.name}
                </p>
                <p className="text-xs text-gray-400">
                    {formatFileSize(asset.size)}
                </p>
            </div>
        </div>
    );
}
