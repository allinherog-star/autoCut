'use client'

import { useState, useCallback, useMemo } from 'react'
import { 
  VarietyAnimatedText, 
  ANIMATION_PRESETS,
  AnimationConfig,
  DEFAULT_CONFIG,
  EnterAnimation,
  LoopAnimation,
  BackgroundEffect,
  DecorationEffect,
  EasingType,
} from '@/components/variety-animated-text'
import { Button, Input, Slider, Switch } from '@/components/ui'
import { RotateCcw, Play, Settings, Sparkles, Palette, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'

// 入场动画选项
const ENTER_ANIMATIONS: { id: EnterAnimation; name: string; icon: string }[] = [
  { id: 'bounce', name: '弹跳', icon: '🏀' },
  { id: 'pop', name: '爆开', icon: '💥' },
  { id: 'slide-up', name: '上滑', icon: '⬆️' },
  { id: 'slide-down', name: '下滑', icon: '⬇️' },
  { id: 'slide-left', name: '左滑', icon: '⬅️' },
  { id: 'slide-right', name: '右滑', icon: '➡️' },
  { id: 'scale', name: '缩放', icon: '🔍' },
  { id: 'rotate', name: '旋转', icon: '🔄' },
  { id: 'flip-x', name: 'X翻转', icon: '🔃' },
  { id: 'flip-y', name: 'Y翻转', icon: '🔁' },
  { id: 'squash', name: '压扁', icon: '🫓' },
  { id: 'stretch', name: '拉伸', icon: '📏' },
  { id: 'jelly', name: '果冻', icon: '🍮' },
  { id: 'elastic', name: '弹性', icon: '🎾' },
  { id: 'drop', name: '掉落', icon: '⬇️' },
  { id: 'rise', name: '升起', icon: '🎈' },
  { id: 'zoom-blur', name: '缩放模糊', icon: '🌀' },
  { id: 'typewriter', name: '打字机', icon: '⌨️' },
  { id: 'wave', name: '波浪', icon: '🌊' },
  { id: 'none', name: '无', icon: '❌' },
]

// 循环动画选项
const LOOP_ANIMATIONS: { id: LoopAnimation; name: string; icon: string }[] = [
  { id: 'none', name: '无循环', icon: '⏹️' },
  { id: 'pulse', name: '脉冲', icon: '💓' },
  { id: 'shake', name: '抖动', icon: '📳' },
  { id: 'swing', name: '摇摆', icon: '🎐' },
  { id: 'bounce', name: '弹跳', icon: '⚽' },
  { id: 'float', name: '漂浮', icon: '🎈' },
  { id: 'glow', name: '发光', icon: '✨' },
  { id: 'flash', name: '闪烁', icon: '💡' },
  { id: 'wiggle', name: '扭动', icon: '🐛' },
  { id: 'heartbeat', name: '心跳', icon: '💗' },
  { id: 'rubber', name: '橡皮', icon: '🎀' },
  { id: 'jello', name: '果冻', icon: '🍮' },
  { id: 'tada', name: '庆祝', icon: '🎉' },
  { id: 'spin', name: '旋转', icon: '🌀' },
  { id: 'rock', name: '摇晃', icon: '🎸' },
]

// 背景效果选项
const BACKGROUND_EFFECTS: { id: BackgroundEffect; name: string }[] = [
  { id: 'radial', name: '放射线' },
  { id: 'grid', name: '网格' },
  { id: 'dots', name: '圆点' },
  { id: 'stars', name: '星星' },
  { id: 'none', name: '无背景' },
]

// 装饰效果选项
const DECORATION_EFFECTS: { id: DecorationEffect; name: string; icon: string }[] = [
  { id: 'confetti', name: '彩纸', icon: '🎊' },
  { id: 'speedlines', name: '速度线', icon: '💨' },
  { id: 'emojis', name: '表情', icon: '😂' },
  { id: 'sparkles', name: '闪光', icon: '✨' },
  { id: 'bubbles', name: '气泡', icon: '🫧' },
]

// 缓动选项
const EASING_OPTIONS: { id: EasingType; name: string }[] = [
  { id: 'linear', name: '线性' },
  { id: 'easeIn', name: '缓入' },
  { id: 'easeOut', name: '缓出' },
  { id: 'easeInOut', name: '缓入出' },
  { id: 'circIn', name: '圆形入' },
  { id: 'circOut', name: '圆形出' },
  { id: 'backIn', name: '后退入' },
  { id: 'backOut', name: '后退出' },
  { id: 'anticipate', name: '预期' },
]

// Web安全色
const COLOR_OPTIONS = [
  { id: '#FFCC00', name: '黄色' },
  { id: '#FF0099', name: '粉色' },
  { id: '#00FFFF', name: '青色' },
  { id: '#FF6600', name: '橙色' },
  { id: '#00FF66', name: '绿色' },
  { id: '#FF3333', name: '红色' },
  { id: '#FFFFFF', name: '白色' },
  { id: '#9933FF', name: '紫色' },
]

export default function AnimationControlPage() {
  const [text, setText] = useState('一见你就笑')
  const [fontSize, setFontSize] = useState(56)
  const [key, setKey] = useState(0)
  
  // 动画配置
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_CONFIG)
  
  // 当前面板
  const [activePanel, setActivePanel] = useState<'enter' | 'loop' | 'effects' | 'presets'>('presets')
  
  const replayAnimation = useCallback(() => {
    setKey(prev => prev + 1)
  }, [])
  
  const updateConfig = useCallback((updates: Partial<AnimationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
    replayAnimation()
  }, [replayAnimation])
  
  const applyPreset = useCallback((presetName: string) => {
    const preset = ANIMATION_PRESETS[presetName]
    if (preset) {
      setConfig({ ...DEFAULT_CONFIG, ...preset })
      replayAnimation()
    }
  }, [replayAnimation])
  
  const toggleDecoration = useCallback((dec: DecorationEffect) => {
    setConfig(prev => {
      const newDecs = prev.decorations.includes(dec)
        ? prev.decorations.filter(d => d !== dec)
        : [...prev.decorations, dec]
      return { ...prev, decorations: newDecs }
    })
  }, [])

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* 头部 */}
      <header className="border-b border-surface-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-amber-400" />
            <span className="text-gradient-primary">动画控制面板</span>
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={replayAnimation}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              重播
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={replayAnimation}
            >
              播放
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：预览 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 预览区 */}
            <div className="card overflow-hidden">
              <div className="relative aspect-video bg-surface-900">
                <VarietyAnimatedText
                  key={key}
                  text={text}
                  fontSize={fontSize}
                  config={config}
                />
              </div>
            </div>
            
            {/* 文字输入 */}
            <div className="card p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-surface-400 mb-1 block">文字内容</label>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入文字..."
                    size="lg"
                  />
                </div>
                <div className="w-32">
                  <label className="text-sm text-surface-400 mb-1 block">字号</label>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    min={24}
                    max={120}
                    size="lg"
                  />
                </div>
              </div>
              
              {/* 快捷文字 */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['一见你就笑', '笑死我了', '绝了绝了', '好会玩', 'yyds', '太秀了'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setText(t); replayAnimation() }}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      text === t ? 'bg-amber-500 text-black' : 'bg-surface-700 hover:bg-surface-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 当前配置显示 */}
            <div className="card p-4">
              <div className="text-sm text-surface-400 mb-2">当前配置</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-sm">
                  入场: {ENTER_ANIMATIONS.find(a => a.id === config.enter)?.name}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                  循环: {LOOP_ANIMATIONS.find(a => a.id === config.loop)?.name}
                </span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                  背景: {BACKGROUND_EFFECTS.find(b => b.id === config.background)?.name}
                </span>
                {config.decorations.map(d => (
                  <span key={d} className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-sm">
                    {DECORATION_EFFECTS.find(dec => dec.id === d)?.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：控制面板 */}
          <div className="space-y-4">
            {/* 面板切换 */}
            <div className="flex gap-1 p-1 bg-surface-800 rounded-xl">
              {[
                { id: 'presets', name: '预设', icon: '✨' },
                { id: 'enter', name: '入场', icon: '🎬' },
                { id: 'loop', name: '循环', icon: '🔄' },
                { id: 'effects', name: '效果', icon: '🎨' },
              ].map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activePanel === panel.id
                      ? 'bg-amber-500 text-black'
                      : 'hover:bg-surface-700'
                  }`}
                >
                  {panel.icon} {panel.name}
                </button>
              ))}
            </div>

            {/* 预设面板 */}
            {activePanel === 'presets' && (
              <div className="card p-4 space-y-3">
                <h3 className="font-semibold text-lg">✨ 动画预设</h3>
                <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
                  {Object.keys(ANIMATION_PRESETS).map((name) => (
                    <motion.button
                      key={name}
                      onClick={() => applyPreset(name)}
                      className="p-3 bg-surface-800 hover:bg-surface-700 rounded-xl text-left transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-sm">{name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* 入场动画面板 */}
            {activePanel === 'enter' && (
              <div className="card p-4 space-y-4">
                <h3 className="font-semibold text-lg">🎬 入场动画</h3>
                
                {/* 动画类型 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">动画类型</label>
                  <div className="grid grid-cols-4 gap-1 max-h-[200px] overflow-y-auto">
                    {ENTER_ANIMATIONS.map((anim) => (
                      <button
                        key={anim.id}
                        onClick={() => updateConfig({ enter: anim.id })}
                        className={`p-2 rounded-lg text-center transition-colors ${
                          config.enter === anim.id
                            ? 'bg-amber-500 text-black'
                            : 'bg-surface-700 hover:bg-surface-600'
                        }`}
                        title={anim.name}
                      >
                        <div className="text-lg">{anim.icon}</div>
                        <div className="text-[10px]">{anim.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 时长 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">
                    时长: {config.enterDuration.toFixed(2)}s
                  </label>
                  <Slider
                    value={[config.enterDuration]}
                    onValueChange={([v]) => updateConfig({ enterDuration: v })}
                    min={0.1}
                    max={2}
                    step={0.1}
                  />
                </div>
                
                {/* 延迟 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">
                    延迟: {config.enterDelay.toFixed(2)}s
                  </label>
                  <Slider
                    value={[config.enterDelay]}
                    onValueChange={([v]) => updateConfig({ enterDelay: v })}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
                
                {/* 缓动 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">缓动函数</label>
                  <div className="grid grid-cols-3 gap-1">
                    {EASING_OPTIONS.map((ease) => (
                      <button
                        key={ease.id}
                        onClick={() => updateConfig({ enterEasing: ease.id })}
                        className={`p-2 rounded text-xs transition-colors ${
                          config.enterEasing === ease.id
                            ? 'bg-amber-500 text-black'
                            : 'bg-surface-700 hover:bg-surface-600'
                        }`}
                      >
                        {ease.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 变形强度 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">
                    变形强度: {(config.squashStretch * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={[config.squashStretch]}
                    onValueChange={([v]) => updateConfig({ squashStretch: v })}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
                
                {/* 过冲强度 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">
                    过冲强度: {(config.overshoot * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={[config.overshoot]}
                    onValueChange={([v]) => updateConfig({ overshoot: v })}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
                
                {/* 逐字动画 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm">逐字动画</label>
                  <Switch
                    checked={config.stagger}
                    onCheckedChange={(v) => updateConfig({ stagger: v })}
                  />
                </div>
                
                {config.stagger && (
                  <div>
                    <label className="text-sm text-surface-400 mb-2 block">
                      逐字间隔: {config.staggerDelay.toFixed(2)}s
                    </label>
                    <Slider
                      value={[config.staggerDelay]}
                      onValueChange={([v]) => updateConfig({ staggerDelay: v })}
                      min={0.02}
                      max={0.2}
                      step={0.01}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 循环动画面板 */}
            {activePanel === 'loop' && (
              <div className="card p-4 space-y-4">
                <h3 className="font-semibold text-lg">🔄 循环动画</h3>
                
                {/* 动画类型 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">动画类型</label>
                  <div className="grid grid-cols-3 gap-1 max-h-[250px] overflow-y-auto">
                    {LOOP_ANIMATIONS.map((anim) => (
                      <button
                        key={anim.id}
                        onClick={() => updateConfig({ loop: anim.id })}
                        className={`p-2 rounded-lg text-center transition-colors ${
                          config.loop === anim.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-surface-700 hover:bg-surface-600'
                        }`}
                      >
                        <div className="text-lg">{anim.icon}</div>
                        <div className="text-[10px]">{anim.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 循环时长 */}
                {config.loop !== 'none' && (
                  <div>
                    <label className="text-sm text-surface-400 mb-2 block">
                      循环时长: {config.loopDuration.toFixed(1)}s
                    </label>
                    <Slider
                      value={[config.loopDuration]}
                      onValueChange={([v]) => updateConfig({ loopDuration: v })}
                      min={0.3}
                      max={3}
                      step={0.1}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 效果面板 */}
            {activePanel === 'effects' && (
              <div className="card p-4 space-y-4">
                <h3 className="font-semibold text-lg">🎨 视觉效果</h3>
                
                {/* 背景效果 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">背景效果</label>
                  <div className="grid grid-cols-3 gap-1">
                    {BACKGROUND_EFFECTS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => updateConfig({ background: bg.id })}
                        className={`p-2 rounded text-sm transition-colors ${
                          config.background === bg.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-surface-700 hover:bg-surface-600'
                        }`}
                      >
                        {bg.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 背景强度 */}
                {config.background !== 'none' && (
                  <div>
                    <label className="text-sm text-surface-400 mb-2 block">
                      背景强度: {(config.backgroundIntensity * 100).toFixed(0)}%
                    </label>
                    <Slider
                      value={[config.backgroundIntensity]}
                      onValueChange={([v]) => updateConfig({ backgroundIntensity: v })}
                      min={0.1}
                      max={1}
                      step={0.1}
                    />
                  </div>
                )}
                
                {/* 装饰效果 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">装饰效果</label>
                  <div className="flex flex-wrap gap-2">
                    {DECORATION_EFFECTS.map((dec) => (
                      <button
                        key={dec.id}
                        onClick={() => toggleDecoration(dec.id)}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                          config.decorations.includes(dec.id)
                            ? 'bg-pink-500 text-white'
                            : 'bg-surface-700 hover:bg-surface-600'
                        }`}
                      >
                        <span>{dec.icon}</span>
                        <span className="text-sm">{dec.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 装饰强度 */}
                {config.decorations.length > 0 && (
                  <div>
                    <label className="text-sm text-surface-400 mb-2 block">
                      装饰强度: {(config.decorationIntensity * 100).toFixed(0)}%
                    </label>
                    <Slider
                      value={[config.decorationIntensity]}
                      onValueChange={([v]) => updateConfig({ decorationIntensity: v })}
                      min={0.2}
                      max={1}
                      step={0.1}
                    />
                  </div>
                )}
                
                {/* 文字颜色 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">文字颜色</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => updateConfig({ textColor: color.id })}
                        className={`p-1 rounded-lg transition-all ${
                          config.textColor === color.id ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <div 
                          className="w-full h-8 rounded"
                          style={{ background: color.id }}
                        />
                        <div className="text-[10px] mt-1 text-center">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 描边颜色 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">描边颜色</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: '#0033CC', name: '深蓝' },
                      { id: '#000066', name: '藏蓝' },
                      { id: '#6600CC', name: '紫色' },
                      { id: '#990066', name: '紫红' },
                      { id: '#006633', name: '深绿' },
                      { id: '#993300', name: '棕色' },
                      { id: '#333333', name: '深灰' },
                      { id: '#000000', name: '黑色' },
                    ].map((color) => (
                      <button
                        key={color.id}
                        onClick={() => updateConfig({ strokeColor: color.id })}
                        className={`p-1 rounded-lg transition-all ${
                          config.strokeColor === color.id ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <div 
                          className="w-full h-8 rounded"
                          style={{ background: color.id }}
                        />
                        <div className="text-[10px] mt-1 text-center">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 重置按钮 */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setConfig(DEFAULT_CONFIG)
                replayAnimation()
              }}
            >
              重置为默认配置
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

















