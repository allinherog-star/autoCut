'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { METALLIC_SHINE_PRESET, NEON_GLOW_PRESET, createMetallicShine, createNeonGlow } from '@/lib/webgl-fancy-text'
import type { WebGLFancyTextScene } from '@/lib/webgl-fancy-text/types'

// 动态导入 WebGL 组件（避免 SSR 问题）
const WebGLFancyTextRenderer = dynamic(
  () => import('@/lib/webgl-fancy-text').then(mod => mod.WebGLFancyTextRenderer),
  { ssr: false }
)

type PresetType = 'metallic' | 'neon'

export default function WebGLFancyTextTest() {
  const [customText, setCustomText] = useState('一见你就笑')
  const [preset, setPreset] = useState<PresetType>('metallic')
  const [scene, setScene] = useState<WebGLFancyTextScene>(() => createMetallicShine('一见你就笑'))

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setCustomText(text)
    updateScene(text, preset)
  }

  const handleQuickText = (text: string) => {
    setCustomText(text)
    updateScene(text, preset)
  }

  const handlePresetChange = (newPreset: PresetType) => {
    setPreset(newPreset)
    updateScene(customText, newPreset)
  }

  const updateScene = (text: string, presetType: PresetType) => {
    if (presetType === 'metallic') {
      setScene(createMetallicShine(text))
    } else {
      setScene(createNeonGlow(text))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            WebGL 3D 花字特效系统
          </h1>
          <p className="text-gray-400 text-lg">
            基于 Three.js 和 React Three Fiber 的高性能 3D 渲染引擎
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🎨 自定义配置
          </h2>
          
          <div className="space-y-6">
            {/* 文字输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                3D 文字内容
              </label>
              <input
                type="text"
                value={customText}
                onChange={handleTextChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                placeholder="输入文字..."
                maxLength={8}
              />
            </div>

            {/* 预设选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                预设风格
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePresetChange('metallic')}
                  className={`
                    px-6 py-4 rounded-xl font-medium transition-all
                    ${preset === 'metallic'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  <div className="text-3xl mb-1">👑</div>
                  <div className="font-bold">金属光泽</div>
                  <div className="text-xs mt-1 opacity-80">奢华、高端</div>
                </button>
                
                <button
                  onClick={() => handlePresetChange('neon')}
                  className={`
                    px-6 py-4 rounded-xl font-medium transition-all
                    ${preset === 'neon'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  <div className="text-3xl mb-1">🌃</div>
                  <div className="font-bold">霓虹发光</div>
                  <div className="text-xs mt-1 opacity-80">赛博朋克</div>
                </button>
              </div>
            </div>

            {/* 快速文字 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                快速预设文字
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['一见你就笑', '笑死我了', '赛博朋克', '绝绝子'].map((text) => (
                  <button
                    key={text}
                    onClick={() => handleQuickText(text)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3D 渲染器 */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            ▶️ 实时 3D 预览
          </h2>
          <div className="bg-black rounded-lg overflow-hidden" style={{ minHeight: '650px' }}>
            {scene ? (
              <WebGLFancyTextRenderer
                scene={scene}
                autoPlay={true}
                className="w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">加载 3D 场景...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 技术特性 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 左侧 */}
          <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🚀 核心技术
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✦</span>
                <span><strong>Three.js:</strong> 行业标准 WebGL 库</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✦</span>
                <span><strong>React Three Fiber:</strong> React 声明式 3D</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✦</span>
                <span><strong>drei:</strong> 实用工具库 (Text3D, 相机控制)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✦</span>
                <span><strong>postprocessing:</strong> 后期特效 (辉光、色差)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✦</span>
                <span><strong>PBR 材质:</strong> 物理渲染材质系统</span>
              </li>
            </ul>
          </div>

          {/* 右侧 */}
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-xl p-6 border border-yellow-500/30">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ✨ 视觉效果
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">◆</span>
                <span><strong>3D 挤出文字:</strong> 真实立体感，可调厚度</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">◆</span>
                <span><strong>倒角 (Bevel):</strong> 圆润边缘，高级质感</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">◆</span>
                <span><strong>多光源系统:</strong> 环境光、方向光、点光源</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">◆</span>
                <span><strong>辉光 (Bloom):</strong> 发光材质 + 后期辉光</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">◆</span>
                <span><strong>粒子系统:</strong> 500-1000 个 3D 粒子</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 性能对比 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">📊 三种渲染技术对比</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">技术</th>
                  <th className="text-center py-3 px-4 text-gray-400">性能</th>
                  <th className="text-center py-3 px-4 text-gray-400">视觉效果</th>
                  <th className="text-center py-3 px-4 text-gray-400">3D 能力</th>
                  <th className="text-center py-3 px-4 text-gray-400">开发难度</th>
                  <th className="text-center py-3 px-4 text-gray-400">适用场景</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4 font-medium">CSS + Framer Motion</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐☆☆</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐☆☆</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐⭐⭐</td>
                  <td className="py-3 px-4 text-xs">简单 2D 动画</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="py-3 px-4 font-medium">Canvas 2D</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐⭐☆</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐⭐☆</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐⭐☆</td>
                  <td className="py-3 px-4 text-xs">复杂 2D 特效</td>
                </tr>
                <tr className="bg-purple-500/10">
                  <td className="py-3 px-4 font-medium text-purple-300">WebGL (Three.js) 🆕</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐⭐⭐</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐⭐⭐</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">⭐⭐⭐☆☆</td>
                  <td className="py-3 px-4 text-xs">3D 特效、高端视觉</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 使用示例 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">💻 代码示例</h3>
          <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
{`import { WebGLFancyTextRenderer, createMetallicShine } from '@/lib/webgl-fancy-text'

// 创建金属光泽场景
const scene = createMetallicShine('一见你就笑')

// 使用渲染器
<WebGLFancyTextRenderer
  scene={scene}
  autoPlay={true}
/>

// 或者使用霓虹发光
import { createNeonGlow } from '@/lib/webgl-fancy-text'
const neonScene = createNeonGlow('赛博朋克', '#00FFFF')`}
          </pre>
        </div>

        {/* 提示 */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            <strong>💡 提示:</strong> 鼠标拖动可旋转 3D 场景，滚轮可缩放。WebGL 需要现代浏览器支持，建议使用 Chrome / Edge / Safari。
          </p>
        </div>
      </div>
    </div>
  )
}

