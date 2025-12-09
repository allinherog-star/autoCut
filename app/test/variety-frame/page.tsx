'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { VarietyFrameText } from '@/components/emotion-text-effect'
import { Button, Input, Slider } from '@/components/ui'
import { RotateCcw, Sparkles, Palette, Sun, Type } from 'lucide-react'

// 预设配色方案 - 使用 Web 安全色
const COLOR_PRESETS = [
  {
    id: 'classic-red',
    name: '经典红框（原版）',
    frameColor: '#CC0000',        // Web安全红
    sunColor: '#FFCC00',          // Web安全黄
    textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #CCCCFF 30%, #9999FF 50%, #6666CC 70%, #333399 100%)',
    strokeColor: '#6633CC',       // Web安全紫
    outerStrokeColor: '#CC0000',  // Web安全红
  },
  {
    id: 'golden-luxury',
    name: '金色奢华',
    frameColor: '#CC9900',        // Web安全金
    sunColor: '#FFFF00',          // Web安全黄
    textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFFF99 30%, #FFCC00 60%, #FF9900 100%)',
    strokeColor: '#996633',       // Web安全棕
    outerStrokeColor: '#CC6600',  // Web安全橙棕
  },
  {
    id: 'cyber-pink',
    name: '赛博粉',
    frameColor: '#FF0099',        // Web安全粉
    sunColor: '#FF66CC',          // Web安全亮粉
    textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFCCFF 30%, #FF99CC 50%, #FF6699 70%, #CC0066 100%)',
    strokeColor: '#990066',       // Web安全深粉
    outerStrokeColor: '#FF0099',
  },
  {
    id: 'ocean-blue',
    name: '海洋蓝',
    frameColor: '#0066CC',        // Web安全蓝
    sunColor: '#00CCFF',          // Web安全青
    textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #CCFFFF 30%, #66CCFF 50%, #3399FF 70%, #0033CC 100%)',
    strokeColor: '#003399',       // Web安全深蓝
    outerStrokeColor: '#0066CC',
  },
  {
    id: 'forest-green',
    name: '森林绿',
    frameColor: '#009933',        // Web安全绿
    sunColor: '#99FF00',          // Web安全黄绿
    textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #CCFFCC 30%, #66FF66 50%, #33CC33 70%, #006600 100%)',
    strokeColor: '#006633',       // Web安全深绿
    outerStrokeColor: '#009933',
  },
  {
    id: 'sunset-orange',
    name: '日落橙',
    frameColor: '#FF6600',        // Web安全橙
    sunColor: '#FFCC00',          // Web安全黄
    textGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFCC99 30%, #FF9966 50%, #FF6633 70%, #CC3300 100%)',
    strokeColor: '#993300',       // Web安全棕
    outerStrokeColor: '#FF6600',
  },
]

// 示例文案
const SAMPLE_TEXTS = [
  '流水的情节 铁打的男主',
  '太棒了！',
  '绝绝子',
  '笑死我了',
  '心动的信号',
  '名场面来了',
  '高能预警',
  '这也太好笑了吧',
]

export default function VarietyFrameTestPage() {
  const [text, setText] = useState('流水的情节 铁打的男主')
  const [selectedPreset, setSelectedPreset] = useState(COLOR_PRESETS[0])
  const [scale, setScale] = useState(1)
  const [key, setKey] = useState(0)

  const replay = useCallback(() => {
    setKey(k => k + 1)
  }, [])

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 glass-strong border-b border-surface-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">综艺边框花字</h1>
              <p className="text-xs text-surface-400">《一见你就笑》经典风格</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href="/test/variety-effects" 
              className="px-4 py-2 text-sm text-surface-300 hover:text-white transition-colors"
            >
              ← 返回特效调研
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 预览区域 */}
        <div className="mb-8">
          <div className="card p-8">
            <div className="text-sm text-surface-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              实时预览
            </div>
            
            {/* 预览画布 */}
            <div 
              className="relative aspect-video bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-blue-900/40 rounded-xl overflow-hidden border border-surface-700 flex items-center justify-center cursor-pointer"
              onClick={replay}
            >
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
              
              {/* 主花字效果 */}
              <VarietyFrameText
                key={key}
                text={text}
                scale={scale}
                frameColor={selectedPreset.frameColor}
                sunColor={selectedPreset.sunColor}
                textGradient={selectedPreset.textGradient}
                strokeColor={selectedPreset.strokeColor}
                outerStrokeColor={selectedPreset.outerStrokeColor}
              />
              
              {/* 提示 */}
              <div className="absolute bottom-4 text-xs text-surface-400 bg-surface-900/80 px-3 py-1 rounded-full">
                点击预览区域重新播放
              </div>
            </div>
            
            {/* 重播按钮 */}
            <div className="mt-4 flex justify-center">
              <Button
                variant="secondary"
                size="md"
                onClick={replay}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                重新播放
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：文字输入 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文字输入 */}
            <div className="card p-6">
              <div className="text-sm text-surface-400 mb-4 flex items-center gap-2">
                <Type className="w-4 h-4" />
                文字内容
              </div>
              
              <Input
                size="lg"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入花字内容..."
              />
              
              {/* 示例文案 */}
              <div className="mt-4">
                <div className="text-xs text-surface-500 mb-2">快速选择：</div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TEXTS.map((sample) => (
                    <button
                      key={sample}
                      onClick={() => {
                        setText(sample)
                        replay()
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg border border-surface-600 hover:border-amber-400 hover:text-amber-400 transition-all bg-surface-800/50"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 缩放控制 */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-surface-400">缩放比例</span>
                <span className="text-amber-400 font-medium">{(scale * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={([v]) => setScale(v)}
                min={0.5}
                max={1.5}
                step={0.1}
              />
            </div>

            {/* 效果说明 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                效果说明
              </h3>
              <div className="space-y-3 text-sm text-surface-300">
                <p>
                  <span className="text-amber-400 font-medium">🌟 多层描边：</span> 
                  白色/渐变填充 + 蓝紫色描边 + 红色外描边，营造立体感
                </p>
                <p>
                  <span className="text-amber-400 font-medium">☀️ 太阳装饰：</span> 
                  左侧爆炸状太阳图标，带有笑脸表情，增添趣味性
                </p>
                <p>
                  <span className="text-amber-400 font-medium">📦 红色边框：</span> 
                  整体包裹在红色矩形边框内，突出重点内容
                </p>
                <p>
                  <span className="text-amber-400 font-medium">⎯ 底部横线：</span> 
                  白色渐变装饰线 + 红色圆点，增加细节层次
                </p>
              </div>
            </div>
          </div>

          {/* 右侧：配色选择 */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="text-sm text-surface-400 mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                配色方案
              </div>
              
              <div className="space-y-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset)
                      replay()
                    }}
                    className={`
                      w-full p-4 rounded-xl border text-left transition-all
                      ${selectedPreset.id === preset.id
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* 颜色预览 */}
                      <div className="flex gap-1">
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ background: preset.frameColor }}
                        />
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ background: preset.sunColor }}
                        />
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ background: preset.strokeColor }}
                        />
                      </div>
                      <span className="font-medium">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 当前配色详情 */}
            <div className="card p-6">
              <div className="text-sm text-surface-400 mb-4">当前配色（Web安全色）</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">边框颜色</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ background: selectedPreset.frameColor }}
                    />
                    <code className="text-amber-400">{selectedPreset.frameColor}</code>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">太阳颜色</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ background: selectedPreset.sunColor }}
                    />
                    <code className="text-amber-400">{selectedPreset.sunColor}</code>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">内描边颜色</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ background: selectedPreset.strokeColor }}
                    />
                    <code className="text-amber-400">{selectedPreset.strokeColor}</code>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-surface-400">外描边颜色</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ background: selectedPreset.outerStrokeColor }}
                    />
                    <code className="text-amber-400">{selectedPreset.outerStrokeColor}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 代码示例 */}
        <div className="mt-8 card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            💻 使用方式
          </h3>
          <pre className="p-4 bg-surface-950 rounded-xl border border-surface-700 overflow-x-auto text-sm text-amber-400/80 font-mono">
{`import { VarietyFrameText } from '@/components/emotion-text-effect'

<VarietyFrameText
  text="${text}"
  scale={${scale}}
  frameColor="${selectedPreset.frameColor}"
  sunColor="${selectedPreset.sunColor}"
  textGradient="${selectedPreset.textGradient}"
  strokeColor="${selectedPreset.strokeColor}"
  outerStrokeColor="${selectedPreset.outerStrokeColor}"
/>`}
          </pre>
        </div>
      </main>
    </div>
  )
}

