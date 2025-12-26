'use client'

/**
 * 通用预览组件测试页面
 */

import { useState, useMemo } from 'react'
import { UniversalPreview } from '@/components/ui/universal-preview'
import { ASPECT_RATIO_PRESETS, type AspectRatioPreset } from '@/lib/preview/aspect-ratios'

export default function UniversalPreviewTestPage() {
    const [selectedPreset, setSelectedPreset] = useState<string>('16:9')
    const [showGrid, setShowGrid] = useState(true)
    const [showCenterLines, setShowCenterLines] = useState(true)
    const [showSafeArea, setShowSafeArea] = useState(false)
    const [zoom, setZoom] = useState(1)

    const preset = ASPECT_RATIO_PRESETS[selectedPreset]
    const resolution = preset?.resolution || [1920, 1080]

    // 模拟内容
    const demoContent = useMemo(() => (
        <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-2">Universal Preview</h1>
                <p className="text-xl opacity-80">{preset?.name}</p>
                <p className="text-sm opacity-60 font-mono mt-2">
                    {resolution[0]} × {resolution[1]}
                </p>
            </div>
        </div>
    ), [preset, resolution])

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">通用预览组件测试</h1>

                {/* 控制面板 */}
                <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
                    <div className="flex flex-wrap gap-4">
                        {/* 比例选择 */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm text-[#888] block mb-2">视频比例</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(ASPECT_RATIO_PRESETS).map(([id, p]) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedPreset(id)}
                                        className={`px-3 py-1.5 rounded text-sm transition-colors ${selectedPreset === id
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-[#333] text-[#888] hover:bg-[#444]'
                                            }`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 显示选项 */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm text-[#888] block mb-2">显示选项</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showGrid}
                                        onChange={(e) => setShowGrid(e.target.checked)}
                                        className="w-4 h-4 rounded"
                                    />
                                    网格
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showCenterLines}
                                        onChange={(e) => setShowCenterLines(e.target.checked)}
                                        className="w-4 h-4 rounded"
                                    />
                                    中心线
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showSafeArea}
                                        onChange={(e) => setShowSafeArea(e.target.checked)}
                                        className="w-4 h-4 rounded"
                                    />
                                    安全区
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 预览区域 */}
                <div className="h-[600px] bg-[#111] rounded-lg overflow-hidden">
                    <UniversalPreview
                        contentResolution={resolution}
                        showGrid={showGrid}
                        showCenterLines={showCenterLines}
                        showSafeArea={showSafeArea}
                        showControls={true}
                        zoom={zoom}
                        onZoomChange={setZoom}
                    >
                        {demoContent}
                    </UniversalPreview>
                </div>

                {/* 预设信息 */}
                {preset && (
                    <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">{preset.name}</h2>
                        <p className="text-sm text-[#888] mb-2">{preset.description}</p>
                        <div className="flex gap-2">
                            {preset.platforms.map((p) => (
                                <span key={p} className="px-2 py-0.5 bg-[#333] rounded text-xs text-[#aaa]">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
