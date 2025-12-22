'use client'

import { useState } from 'react'
import { CanvasFancyTextPlayer } from '@/components/canvas-fancy-text-player'
import { VARIETY_MAIN_TITLE_PRESET, createVarietyMainTitle } from '@/assets/fancy-text-presets/variety-main-title/variety-main-title.scene'

export default function CanvasVarietyTitleTest() {
  const [customText, setCustomText] = useState('一见你就笑')
  const [scene, setScene] = useState(VARIETY_MAIN_TITLE_PRESET)

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setCustomText(text)
    setScene(createVarietyMainTitle(text))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Canvas 综艺主标题特效</h1>
          <p className="text-gray-600">
            基于 Canvas 2D 的高性能花字渲染系统 - "一见你就笑"片头效果
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎨 自定义配置</h2>

          <div className="space-y-4">
            {/* 文字输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主标题文字
              </label>
              <input
                type="text"
                value={customText}
                onChange={handleTextChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="输入文字..."
                maxLength={10}
              />
            </div>

            {/* 预设选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                快速预设
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleTextChange({ target: { value: '一见你就笑' } } as any)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  一见你就笑
                </button>
                <button
                  onClick={() => handleTextChange({ target: { value: '笑死我了' } } as any)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  笑死我了
                </button>
                <button
                  onClick={() => handleTextChange({ target: { value: '太好笑了' } } as any)}
                  className="px-4 py-2 bg-pink-100 text-pink-700 rounded hover:bg-pink-200"
                >
                  太好笑了
                </button>
                <button
                  onClick={() => handleTextChange({ target: { value: '绝绝子' } } as any)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  绝绝子
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 播放器 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">▶️ 实时预览</h2>
          <CanvasFancyTextPlayer
            scene={scene}
            autoPlay={true}
            loop={true}
          />
        </div>

        {/* 技术说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">🚀 技术特性</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>Canvas 2D 渲染:</strong> 高性能原生渲染，支持复杂特效</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>多层合成:</strong> 8 层独立渲染，精确控制 z-index</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>关键帧动画:</strong> 支持 spring、bounce、elastic 等缓动</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>多层描边:</strong> 3 层描边（深蓝+白色+蓝色）+ 渐变填充</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>粗糙边缘:</strong> 手绘纹理效果，避免过于光滑</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>粒子系统:</strong> 彩纸粒子、速度线、放射线</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>视频导出:</strong> 支持导出为 WebM/MP4（待实现）</span>
            </li>
          </ul>
        </div>

        {/* 对比说明 */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">📊 技术对比</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded p-4">
              <h4 className="font-semibold text-purple-700 mb-2">CSS + Framer Motion (旧)</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ 开发快速，代码简洁</li>
                <li>✓ 声明式动画，易于理解</li>
                <li>✗ 复杂特效性能受限</li>
                <li>✗ 多层阴影计算开销大</li>
                <li>✗ 导出视频困难</li>
              </ul>
            </div>
            <div className="bg-white rounded p-4">
              <h4 className="font-semibold text-blue-700 mb-2">Canvas 2D (新)</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ 高性能，GPU 加速</li>
                <li>✓ 像素级精确控制</li>
                <li>✓ 支持视频导出</li>
                <li>✓ 复杂特效无压力</li>
                <li>✓ 可离屏渲染优化</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用示例 */}
        <div className="mt-8 bg-gray-800 text-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">💻 代码示例</h3>
          <pre className="text-sm overflow-x-auto">
            {`import { CanvasFancyTextPlayer } from '@/components/canvas-fancy-text-player'
import { createVarietyMainTitle } from '@/lib/canvas-fancy-text/presets/variety-main-title'

// 创建场景
const scene = createVarietyMainTitle('一见你就笑', {
  background: ['#6600CC', '#330066', '#000066'],
  text: ['#FFFFFF', '#FFFF99', '#FFCC00', '#FF9900'],
})

// 使用播放器
<CanvasFancyTextPlayer
  scene={scene}
  autoPlay={true}
  loop={true}
  onComplete={() => console.log('动画完成')}
/>`}
          </pre>
        </div>
      </div>
    </div>
  )
}




