'use client';

/**
 * 素材上传组件
 * Asset Uploader Component
 */

import React, { useCallback, useState, useRef } from 'react';
import { getAssetManager, type Asset, type UploadProgressEvent } from '@/lib/assets';
import { SUPPORTED_EXTENSIONS, formatFileSize } from '@/lib/assets/parser/utils';

interface AssetUploaderProps {
    /** 上传完成回调 */
    onUpload?: (assets: Asset[]) => void;
    /** 是否允许多文件上传 */
    multiple?: boolean;
    /** 接受的文件类型 */
    accept?: ('video' | 'audio' | 'image')[];
    /** 自定义类名 */
    className?: string;
}

export function AssetUploader({
    onUpload,
    multiple = true,
    accept = ['video', 'audio', 'image'],
    className = '',
}: AssetUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number; message?: string }>({
        current: 0,
        total: 0,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 生成 accept 属性
    const acceptString = accept
        .flatMap(type => SUPPORTED_EXTENSIONS[type])
        .join(',');

    // 处理文件上传
    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setProgress({ current: 0, total: files.length });

        try {
            const manager = getAssetManager();
            const assets = await manager.uploadMultiple(Array.from(files), {
                onProgress: (current, total) => {
                    setProgress({ current, total, message: `正在处理 ${current}/${total}` });
                },
            });

            onUpload?.(assets);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
            setProgress({ current: 0, total: 0 });
        }
    }, [onUpload]);

    // 拖拽事件处理
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    // 点击上传
    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // 重置 input，允许重复上传相同文件
        e.target.value = '';
    }, [handleFiles]);

    return (
        <div
            className={`
        relative border-2 border-dashed rounded-xl p-8
        transition-all duration-200 cursor-pointer
        ${isDragging
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'}
        ${className}
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptString}
                multiple={multiple}
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center text-center">
                {uploading ? (
                    <>
                        {/* 上传进度 */}
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white font-medium">
                            {progress.message || '正在处理...'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            {progress.current} / {progress.total}
                        </p>
                    </>
                ) : (
                    <>
                        {/* 上传图标 */}
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>

                        <p className="text-white font-medium mb-2">
                            拖拽文件到此处，或点击上传
                        </p>
                        <p className="text-gray-400 text-sm">
                            支持视频、音频、图片格式
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
