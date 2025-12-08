'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Slider, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import {
  FONT_OPTIONS,
  TEXT_COLOR_PRESETS,
  DECORATION_EFFECTS,
  styleToCSS,
  type EnhancedSubtitleStyle,
  DEFAULT_SUBTITLE_STYLE,
} from '@/lib/subtitle-styles'
import { EMOTION_TEXT_PRESETS, presetToCSS, type EmotionTextStyle } from '@/lib/emotion-text-effects'
import { Check, RotateCcw, Download, Copy, Save, Sparkles, Type, Palette, Wand2, Code, X } from 'lucide-react'

// 保存的样式类型
interface SavedFancyTextStyle {
  id: string
  name: string
  createdAt: number
  type: 'basic' | 'emotion'
  basicStyle?: EnhancedSubtitleStyle
  emotionPresetId?: string
  customText?: string
}

const STORAGE_KEY = 'autocut-fancy-text-styles'

export default function FancyTextTestPage() {
  // 当前文本
  const [text, setText] = useState('在这里输入花字')
  
  // 当前模式：basic（基础样式编辑） 或 emotion（情绪预设）
  const [mode, setMode] = useState<'basic' | 'emotion'>('emotion')
  
  // 基础样式
  const [basicStyle, setBasicStyle] = useState<EnhancedSubtitleStyle>({
    ...DEFAULT_SUBTITLE_STYLE,
    fontSize: 72,
    fontWeight: 700,
    backgroundColor: 'transparent',
  })
  
  // 选中的情绪预设
  const [selectedEmotionId, setSelectedEmotionId] = useState<string>('variety-boom')
  
  // 已保存的样式列表
  const [savedStyles, setSavedStyles] = useState<SavedFancyTextStyle[]>([])
  
  // 当前应用的已保存样式
  const [appliedStyleId, setAppliedStyleId] = useState<string | null>(null)
  
  // 样式名称
  const [styleName, setStyleName] = useState('')
  
  // 复制成功提示
  const [copySuccess, setCopySuccess] = useState(false)
  
  // 显示导出代码弹窗
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportCode, setExportCode] = useState('')
  
  // 从 localStorage 加载已保存的样式
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSavedStyles(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse saved styles:', e)
      }
    }
  }, [])
  
  // 保存样式到 localStorage
  const saveStyleToStorage = (styles: SavedFancyTextStyle[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(styles))
    setSavedStyles(styles)
  }
  
  // 确认保存当前样式
  const handleConfirmStyle = () => {
    const newStyle: SavedFancyTextStyle = {
      id: `style-${Date.now()}`,
      name: styleName || `样式 ${savedStyles.length + 1}`,
      createdAt: Date.now(),
      type: mode,
      basicStyle: mode === 'basic' ? { ...basicStyle } : undefined,
      emotionPresetId: mode === 'emotion' ? selectedEmotionId : undefined,
      customText: text,
    }
    
    saveStyleToStorage([...savedStyles, newStyle])
    setAppliedStyleId(newStyle.id)
    setStyleName('')
  }
  
  // 应用已保存的样式
  const handleApplyStyle = (style: SavedFancyTextStyle) => {
    setMode(style.type)
    if (style.type === 'basic' && style.basicStyle) {
      setBasicStyle(style.basicStyle)
    } else if (style.type === 'emotion' && style.emotionPresetId) {
      setSelectedEmotionId(style.emotionPresetId)
    }
    setAppliedStyleId(style.id)
  }
  
  // 删除已保存的样式
  const handleDeleteStyle = (id: string) => {
    const updated = savedStyles.filter(s => s.id !== id)
    saveStyleToStorage(updated)
    if (appliedStyleId === id) {
      setAppliedStyleId(null)
    }
  }
  
  // 复制CSS代码
  const handleCopyCSS = useCallback(() => {
    let css: React.CSSProperties
    if (mode === 'basic') {
      css = styleToCSS(basicStyle, 1)
    } else {
      const preset = EMOTION_TEXT_PRESETS.find(p => p.id === selectedEmotionId)
      if (preset) {
        css = presetToCSS(preset, 1)
      } else {
        css = {}
      }
    }
    
    const cssString = Object.entries(css)
      .map(([key, value]) => {
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `  ${kebabKey}: ${value};`
      })
      .join('\n')
    
    navigator.clipboard.writeText(`{\n${cssString}\n}`).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }, [mode, basicStyle, selectedEmotionId])
  
  // 生成导出代码
  const handleExportCode = () => {
    let code = ''
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (mode === 'basic') {
      // 生成基础样式的代码
      code = `// 花字样式配置 - ${timestamp}
// 使用方法：将此配置添加到 lib/subtitle-styles.ts 的 STYLE_PRESETS 数组中

{
  id: 'custom-${Date.now()}',
  name: '${styleName || '自定义花字'}',
  description: '${text}',
  category: 'creative',
  preview: '✨',
  style: {
    fontSize: ${basicStyle.fontSize},
    fontFamily: '${basicStyle.fontFamily}',
    fontWeight: ${basicStyle.fontWeight},
    letterSpacing: ${basicStyle.letterSpacing},
    color: '${basicStyle.color}',
    colorType: '${basicStyle.colorType}',
    backgroundColor: '${basicStyle.backgroundColor}',
    ${basicStyle.backgroundPadding ? `backgroundPadding: { x: ${basicStyle.backgroundPadding.x}, y: ${basicStyle.backgroundPadding.y} },` : ''}
    ${basicStyle.backgroundBorderRadius ? `backgroundBorderRadius: ${basicStyle.backgroundBorderRadius},` : ''}
    hasOutline: ${basicStyle.hasOutline},
    ${basicStyle.hasOutline ? `outlineColor: '${basicStyle.outlineColor}',
    outlineWidth: ${basicStyle.outlineWidth},` : ''}
    hasShadow: ${basicStyle.hasShadow},
    ${basicStyle.hasShadow ? `shadowColor: '${basicStyle.shadowColor}',
    shadowBlur: ${basicStyle.shadowBlur},
    shadowOffsetX: ${basicStyle.shadowOffsetX},
    shadowOffsetY: ${basicStyle.shadowOffsetY},` : ''}
    position: '${basicStyle.position}',
    alignment: '${basicStyle.alignment}',
    decorationId: '${basicStyle.decorationId}',
    animationId: '${basicStyle.animationId}',
  },
}`
    } else {
      // 情绪预设模式 - 显示完整的预设配置以便自定义修改
      const preset = EMOTION_TEXT_PRESETS.find(p => p.id === selectedEmotionId)
      if (preset) {
        code = `// 情绪花字配置 - ${timestamp}
// 基于预设: ${preset.name}
// 使用方法：将此配置添加到 lib/emotion-text-effects.ts 的 EMOTION_TEXT_PRESETS 数组中

{
  id: 'custom-${Date.now()}',
  name: '${styleName || preset.name + ' (自定义)'}',
  emotion: '${preset.emotion}',
  description: '${text}',
  layout: {
    randomRotation: { min: ${preset.layout.randomRotation.min}, max: ${preset.layout.randomRotation.max} },
    randomOffset: { x: ${preset.layout.randomOffset.x}, y: ${preset.layout.randomOffset.y} },
    randomScale: { min: ${preset.layout.randomScale.min}, max: ${preset.layout.randomScale.max} },
    stagger: ${preset.layout.stagger},
    staggerDelay: ${preset.layout.staggerDelay},
  },
  text: {
    fontFamily: '${preset.text.fontFamily}',
    fontWeight: ${preset.text.fontWeight},
    fontSize: ${preset.text.fontSize},
    color: '${preset.text.color}',
    ${preset.text.gradient ? `gradient: '${preset.text.gradient}',` : ''}
    ${preset.text.stroke ? `stroke: { color: '${preset.text.stroke.color}', width: ${preset.text.stroke.width} },` : ''}
    ${preset.text.shadow ? `shadow: '${preset.text.shadow}',` : ''}
  },
  ${preset.decoration ? `decoration: {
    type: '${preset.decoration.type}',
    items: ${JSON.stringify(preset.decoration.items)},
    position: '${preset.decoration.position}',
    animated: ${preset.decoration.animated},
  },` : ''}
  animation: {
    enter: '${preset.animation.enter}',
    ${preset.animation.loop ? `loop: '${preset.animation.loop}',` : ''}
    ${preset.animation.exit ? `exit: '${preset.animation.exit}',` : ''}
    duration: ${preset.animation.duration},
  },
}`
      }
    }
    
    setExportCode(code)
    setShowExportModal(true)
  }
  
  // 复制导出代码
  const handleCopyExportCode = () => {
    navigator.clipboard.writeText(exportCode).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }
  
  // 重置样式
  const handleReset = () => {
    if (mode === 'basic') {
      setBasicStyle({
        ...DEFAULT_SUBTITLE_STYLE,
        fontSize: 72,
        fontWeight: 700,
        backgroundColor: 'transparent',
      })
    } else {
      setSelectedEmotionId('variety-boom')
    }
    setAppliedStyleId(null)
  }
  
  // 获取当前预览样式
  const getPreviewStyle = (): React.CSSProperties => {
    if (mode === 'basic') {
      return styleToCSS(basicStyle, 0.6)
    } else {
      const preset = EMOTION_TEXT_PRESETS.find(p => p.id === selectedEmotionId)
      if (preset) {
        return presetToCSS(preset, 0.6)
      }
      return {}
    }
  }
  
  // 获取当前情绪预设
  const currentEmotionPreset = EMOTION_TEXT_PRESETS.find(p => p.id === selectedEmotionId)
  
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 glass-strong border-b border-surface-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-surface-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">花字样式工坊</h1>
              <p className="text-xs text-surface-400">设计 · 保存 · 复用</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
              重置
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyCSS} 
              leftIcon={copySuccess ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            >
              {copySuccess ? '已复制' : '复制CSS'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCode} 
              leftIcon={<Code className="w-4 h-4" />}
            >
              导出代码
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：预览区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 预览卡片 */}
            <div className="card p-8">
              <div className="text-sm text-surface-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                实时预览
              </div>
              
              {/* 预览区域 - 模拟视频画面 */}
              <div className="relative aspect-video bg-gradient-to-br from-surface-800 via-surface-900 to-surface-950 rounded-xl overflow-hidden border border-surface-700">
                {/* 网格背景 */}
                <div className="absolute inset-0 bg-grid opacity-30" />
                
                {/* 中心发光效果 */}
                <div className="absolute inset-0 gradient-radial-glow" />
                
                {/* 花字预览 */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div 
                    style={getPreviewStyle()}
                    className="text-center break-words max-w-full transition-all duration-300"
                  >
                    {text || '在这里输入花字'}
                  </div>
                </div>
                
                {/* 当前样式标签 */}
                {appliedStyleId && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-400/20 border border-amber-400/30 rounded-full">
                    <span className="text-xs text-amber-400 font-medium">
                      已应用: {savedStyles.find(s => s.id === appliedStyleId)?.name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* 文本输入 */}
              <div className="mt-6">
                <Input
                  size="lg"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="输入你想要的花字内容..."
                  leftElement={<Type className="w-5 h-5" />}
                />
              </div>
            </div>
            
            {/* 已保存的样式列表 */}
            {savedStyles.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Save className="w-5 h-5 text-amber-400" />
                  已保存的样式
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {savedStyles.map((style) => {
                    const isApplied = appliedStyleId === style.id
                    return (
                      <div
                        key={style.id}
                        className={`
                          relative p-4 rounded-xl border cursor-pointer transition-all
                          ${isApplied 
                            ? 'border-amber-400 bg-amber-400/10' 
                            : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
                          }
                        `}
                        onClick={() => handleApplyStyle(style)}
                      >
                        {/* 删除按钮 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteStyle(style.id)
                          }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-surface-700 hover:bg-red-500/80 flex items-center justify-center text-surface-400 hover:text-white transition-colors"
                        >
                          ×
                        </button>
                        
                        {/* 样式名称 */}
                        <div className="text-sm font-medium truncate pr-6">{style.name}</div>
                        
                        {/* 类型标签 */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`
                            text-xs px-2 py-0.5 rounded-full
                            ${style.type === 'emotion' 
                              ? 'bg-purple-500/20 text-purple-300' 
                              : 'bg-blue-500/20 text-blue-300'
                            }
                          `}>
                            {style.type === 'emotion' ? '情绪预设' : '自定义'}
                          </span>
                        </div>
                        
                        {/* 应用标记 */}
                        {isApplied && (
                          <div className="absolute bottom-2 right-2">
                            <Check className="w-4 h-4 text-amber-400" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* 右侧：样式编辑面板 */}
          <div className="space-y-6">
            {/* 模式切换 */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'basic' | 'emotion')}>
              <TabsList className="w-full">
                <TabsTrigger value="emotion" className="flex-1 gap-2">
                  <Wand2 className="w-4 h-4" />
                  情绪预设
                </TabsTrigger>
                <TabsTrigger value="basic" className="flex-1 gap-2">
                  <Palette className="w-4 h-4" />
                  自定义
                </TabsTrigger>
              </TabsList>
              
              {/* 情绪预设模式 */}
              <TabsContent value="emotion" className="mt-4">
                <div className="card p-4 space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                  <div className="text-sm text-surface-400">选择一个预设效果</div>
                  <div className="grid grid-cols-2 gap-2">
                    {EMOTION_TEXT_PRESETS.map((preset) => {
                      const isSelected = selectedEmotionId === preset.id
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setSelectedEmotionId(preset.id)}
                          className={`
                            p-3 rounded-lg border text-left transition-all
                            ${isSelected 
                              ? 'border-amber-400 bg-amber-400/10' 
                              : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
                            }
                          `}
                        >
                          <div className="text-sm font-medium truncate">{preset.name}</div>
                          <div className="text-xs text-surface-400 truncate mt-0.5">{preset.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>
              
              {/* 自定义模式 */}
              <TabsContent value="basic" className="mt-4">
                <div className="space-y-4">
                  {/* 字体选择 */}
                  <div className="card p-4">
                    <div className="text-sm text-surface-400 mb-3">字体</div>
                    <div className="grid grid-cols-2 gap-2">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font.family}
                          onClick={() => setBasicStyle({ ...basicStyle, fontFamily: font.family })}
                          className={`
                            p-2 rounded-lg border text-sm transition-all truncate
                            ${basicStyle.fontFamily === font.family
                              ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                              : 'border-surface-600 hover:border-surface-500'
                            }
                          `}
                          style={{ fontFamily: font.family }}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 字号和粗细 */}
                  <div className="card p-4 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-surface-400">字号</span>
                        <span className="text-amber-400">{basicStyle.fontSize}px</span>
                      </div>
                      <Slider
                        value={[basicStyle.fontSize]}
                        onValueChange={([v]) => setBasicStyle({ ...basicStyle, fontSize: v })}
                        min={24}
                        max={200}
                        step={2}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-surface-400">粗细</span>
                        <span className="text-amber-400">{basicStyle.fontWeight}</span>
                      </div>
                      <Slider
                        value={[basicStyle.fontWeight]}
                        onValueChange={([v]) => setBasicStyle({ ...basicStyle, fontWeight: v })}
                        min={100}
                        max={900}
                        step={100}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-surface-400">字间距</span>
                        <span className="text-amber-400">{basicStyle.letterSpacing}px</span>
                      </div>
                      <Slider
                        value={[basicStyle.letterSpacing]}
                        onValueChange={([v]) => setBasicStyle({ ...basicStyle, letterSpacing: v })}
                        min={0}
                        max={20}
                        step={1}
                      />
                    </div>
                  </div>
                  
                  {/* 颜色选择 */}
                  <div className="card p-4">
                    <div className="text-sm text-surface-400 mb-3">文字颜色</div>
                    <div className="flex flex-wrap gap-2">
                      {TEXT_COLOR_PRESETS.filter(c => c.type === 'solid').map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setBasicStyle({ ...basicStyle, color: color.value, colorType: 'solid' })}
                          className={`
                            w-8 h-8 rounded-lg border-2 transition-all
                            ${basicStyle.color === color.value
                              ? 'border-amber-400 scale-110'
                              : 'border-transparent hover:border-surface-500'
                            }
                          `}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* 花字效果 */}
                  <div className="card p-4">
                    <div className="text-sm text-surface-400 mb-3">花字效果</div>
                    <div className="grid grid-cols-2 gap-2">
                      {DECORATION_EFFECTS.map((effect) => (
                        <button
                          key={effect.id}
                          onClick={() => setBasicStyle({ ...basicStyle, decorationId: effect.id })}
                          className={`
                            p-2 rounded-lg border text-sm transition-all
                            ${basicStyle.decorationId === effect.id
                              ? 'border-amber-400 bg-amber-400/10'
                              : 'border-surface-600 hover:border-surface-500'
                            }
                          `}
                        >
                          <span className="mr-1">{effect.preview}</span>
                          {effect.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* 保存按钮区域 */}
            <div className="card p-4 space-y-4">
              <Input
                size="md"
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                placeholder="为样式命名（可选）..."
              />
              <Button 
                fullWidth 
                variant="primary" 
                size="lg"
                onClick={handleConfirmStyle}
                leftIcon={<Check className="w-5 h-5" />}
              >
                确认并保存样式
              </Button>
              <p className="text-xs text-surface-400 text-center">
                保存后，下次只需选择样式并修改文字即可
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* 导出代码弹窗 */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          />
          
          {/* 弹窗内容 */}
          <div className="relative w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col bg-surface-900 border border-surface-600 rounded-2xl shadow-2xl">
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">导出样式代码</h2>
                  <p className="text-xs text-surface-400">复制代码发给 AI，即可永久添加到系统预设</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-surface-400" />
              </button>
            </div>
            
            {/* 代码区域 */}
            <div className="flex-1 overflow-auto p-6">
              <pre className="p-4 bg-surface-950 rounded-xl border border-surface-700 overflow-x-auto text-sm text-surface-200 font-mono leading-relaxed">
                {exportCode}
              </pre>
            </div>
            
            {/* 底部操作 */}
            <div className="px-6 py-4 border-t border-surface-700 flex items-center justify-between">
              <p className="text-sm text-surface-400">
                💡 提示：复制上面的代码，告诉 AI &quot;把这个样式添加到系统预设里&quot;
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowExportModal(false)}
                >
                  关闭
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCopyExportCode}
                  leftIcon={copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copySuccess ? '已复制！' : '复制代码'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

