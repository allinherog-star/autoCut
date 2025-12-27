'use client'

import { useState, useCallback } from 'react'
import { VarietyComedyText } from '@/components/variety-comedy-text'
import { Button, Input, Slider } from '@/components/ui'
import { RotateCcw, Sparkles, Download, Play } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ComedyTitleTestPage() {
  const [text, setText] = useState('一见你就笑')
  const [scale, setScale] = useState(1)
  const [key, setKey] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const replayAnimation = useCallback(() => {
    setKey(prev => prev + 1)
    setIsPlaying(true)
  }, [])

  const handleAnimationComplete = useCallback(() => {
    // 动画完成后的回调
  }, [])

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* 头部 */}
      <header className="border-b border-surface-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">😂</span>
            <span className="text-gradient-primary">搞笑综艺花字特效</span>
            <span className="text-4xl">🎉</span>
          </h1>
          <p className="text-surface-400 mt-2">
            中国搞笑综艺节目风格，色彩饱和、活泼，卡通漫画感
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* 预览区域 */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-surface-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              实时预览
            </h2>
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                onClick={replayAnimation}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                重播动画
              </Button>
              <Button
                variant="primary"
                leftIcon={<Play className="w-4 h-4" />}
                onClick={replayAnimation}
              >
                播放
              </Button>
            </div>
          </div>
          
          {/* 视频预览框 */}
          <div 
            className="relative aspect-video bg-surface-900"
            style={{ minHeight: '400px' }}
          >
            <VarietyComedyText
              key={key}
              text={text}
              scale={scale}
              onAnimationComplete={handleAnimationComplete}
            />
          </div>
        </div>

        {/* 控制面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 文字设置 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              ✏️ 文字内容
            </h3>
            <Input
              size="lg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入你的搞笑标题..."
              leftElement={<span className="text-xl">😂</span>}
            />
            
            {/* 快捷文字 */}
            <div className="mt-4">
              <div className="text-sm text-surface-400 mb-2">快捷选择</div>
              <div className="flex flex-wrap gap-2">
                {[
                  '一见你就笑',
                  '笑死我了',
                  '哈哈哈哈',
                  '太搞笑了',
                  '神仙操作',
                  '绝了绝了',
                  '这谁顶得住',
                  '笑出腹肌',
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setText(t); replayAnimation() }}
                    className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-full text-sm transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 缩放设置 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🔍 缩放比例
            </h3>
            <div className="space-y-4">
              <Slider
                value={[scale]}
                onValueChange={([v]) => setScale(v)}
                min={0.5}
                max={1.5}
                step={0.1}
              />
              <div className="flex justify-between text-sm text-surface-400">
                <span>0.5x</span>
                <span className="text-amber-400 font-semibold">{scale.toFixed(1)}x</span>
                <span>1.5x</span>
              </div>
            </div>
            
            {/* 快捷缩放 */}
            <div className="mt-4 flex gap-2">
              {[0.6, 0.8, 1, 1.2].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scale === s 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-surface-800 hover:bg-surface-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 特效说明 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📋 特效说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-surface-800/50 rounded-lg p-4">
              <div className="text-amber-400 font-semibold mb-2">🎨 整体风格</div>
              <p className="text-surface-300">
                参考中国搞笑综艺节目棚内主视觉，色彩超级饱和、活泼，类似卡通漫画封面
              </p>
            </div>
            <div className="bg-surface-800/50 rounded-lg p-4">
              <div className="text-amber-400 font-semibold mb-2">🔤 字体效果</div>
              <p className="text-surface-300">
                粗体手写感中文字，略带圆角，厚重描边和内发光，明黄色为主，深蓝+白色双描边
              </p>
            </div>
            <div className="bg-surface-800/50 rounded-lg p-4">
              <div className="text-amber-400 font-semibold mb-2">🌈 背景效果</div>
              <p className="text-surface-300">
                紫色+蓝色渐变的舞台灯光，夸张的放射线和彩色速度线
              </p>
            </div>
            <div className="bg-surface-800/50 rounded-lg p-4">
              <div className="text-amber-400 font-semibold mb-2">💥 动画细节</div>
              <p className="text-surface-300">
                镜头推近 → 表情飞入 → 爆炸底板 → 文字弹出 → 彩纸飞舞
              </p>
            </div>
            <div className="bg-surface-800/50 rounded-lg p-4">
              <div className="text-amber-400 font-semibold mb-2">⏱️ 时长</div>
              <p className="text-surface-300">
                2-3秒内完成标题亮相，适合作为片头 LOGO 使用
              </p>
            </div>
            <div className="bg-surface-800/50 rounded-lg p-4">
              <div className="text-amber-400 font-semibold mb-2">🎯 适用场景</div>
              <p className="text-surface-300">
                综艺节目、搞笑视频、短视频片头、表情包制作
              </p>
            </div>
          </div>
        </div>

        {/* 颜色参考 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🎨 Web安全色配色方案
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: '明黄色', color: '#FFCC00' },
              { name: '亮黄色', color: '#FFFF00' },
              { name: '深黄色', color: '#FF9900' },
              { name: '深蓝色', color: '#0033CC' },
              { name: '更深蓝', color: '#000066' },
              { name: '纯白色', color: '#FFFFFF' },
              { name: '紫色', color: '#6600CC' },
              { name: '亮紫色', color: '#9933FF' },
              { name: '深紫色', color: '#330066' },
              { name: '粉红色', color: '#FF0099' },
              { name: '青色', color: '#00FFFF' },
              { name: '橙色', color: '#FF6600' },
            ].map(({ name, color }) => (
              <div key={color} className="text-center">
                <div 
                  className="w-full h-12 rounded-lg border border-surface-600 mb-2"
                  style={{ background: color }}
                />
                <div className="text-xs text-surface-400">{name}</div>
                <code className="text-xs text-amber-400">{color}</code>
              </div>
            ))}
          </div>
        </div>

        {/* 使用代码 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            💻 使用方式
          </h3>
          <pre className="p-4 bg-surface-950 rounded-xl border border-surface-700 overflow-x-auto text-sm text-amber-400/80 font-mono">
{`import { VarietyComedyText } from '@/components/variety-comedy-text'

<VarietyComedyText
  text="${text}"
  scale={${scale}}
  onAnimationComplete={() => console.log('动画完成')}
/>`}
          </pre>
        </div>
      </main>
    </div>
  )
}





















