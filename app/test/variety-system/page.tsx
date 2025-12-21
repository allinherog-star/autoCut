'use client'

import { useState, useCallback } from 'react'
import { 
  MainTitle, 
  SectionTitle, 
  GuestName, 
  FunnyText,
} from '@/components/variety-text-system'
import { Button, Input, Slider } from '@/components/ui'
import { RotateCcw, Play, Tv, User, MessageSquare, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// 模板类型
type TemplateType = 'main-title' | 'section-title' | 'guest-name' | 'funny-text'

// 模板配置
const TEMPLATES = [
  { 
    id: 'main-title' as TemplateType, 
    name: '节目主标题', 
    icon: Tv,
    defaultText: '一见你就笑',
    description: '节目开场Logo，2-3秒完整动画',
    presets: ['一见你就笑', '快乐大本营', '王牌对王牌', '跑男来了'],
  },
  { 
    id: 'section-title' as TemplateType, 
    name: '分段标题', 
    icon: MessageSquare,
    defaultText: '本期主题',
    description: '游戏环节/章节切换标题',
    presets: ['本期主题', '游戏环节', '互动时间', '精彩回顾', '神秘嘉宾'],
  },
  { 
    id: 'guest-name' as TemplateType, 
    name: '嘉宾姓名条', 
    icon: User,
    defaultText: '张三',
    description: '嘉宾出场介绍条',
    presets: ['张三', '李四', '王五', '赵六'],
  },
  { 
    id: 'funny-text' as TemplateType, 
    name: '爆笑大字', 
    icon: Sparkles,
    defaultText: '笑死我了',
    description: '搞笑反应/弹幕风格大字',
    presets: ['笑死我了', '绝了绝了', '好会玩', '神仙操作', '这谁顶得住', 'yyds', '太秀了', '笑出腹肌'],
  },
]

// 颜色变体
const COLOR_VARIANTS = [
  { id: 'yellow', name: '经典黄', color: '#FFCC00' },
  { id: 'pink', name: '可爱粉', color: '#FF0099' },
  { id: 'cyan', name: '清新蓝', color: '#00FFFF' },
  { id: 'rainbow', name: '彩虹色', color: 'linear-gradient(90deg, #FF0099, #FFCC00, #00FF66, #00CCFF)' },
]

export default function VarietySystemTestPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('main-title')
  const [text, setText] = useState('一见你就笑')
  const [subtitle, setSubtitle] = useState('欢乐喜剧人')
  const [title, setTitle] = useState('特邀嘉宾')
  const [variant, setVariant] = useState<'yellow' | 'pink' | 'cyan' | 'rainbow'>('yellow')
  const [scale, setScale] = useState(1)
  const [key, setKey] = useState(0)

  const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplate)!

  const replayAnimation = useCallback(() => {
    setKey(prev => prev + 1)
  }, [])

  const handleTemplateChange = (templateId: TemplateType) => {
    setSelectedTemplate(templateId)
    const template = TEMPLATES.find(t => t.id === templateId)!
    setText(template.defaultText)
    replayAnimation()
  }

  const renderPreview = () => {
    switch (selectedTemplate) {
      case 'main-title':
        return <MainTitle key={key} text={text} scale={scale} />
      case 'section-title':
        return <SectionTitle key={key} title={text} subtitle={subtitle} scale={scale} />
      case 'guest-name':
        return <GuestName key={key} name={text} title={title} scale={scale} />
      case 'funny-text':
        return <FunnyText key={key} text={text} variant={variant} scale={scale} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* 头部 */}
      <header className="border-b border-surface-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">🎬</span>
            <span className="text-gradient-primary">综艺花字特效系统</span>
            <span className="text-4xl">📺</span>
          </h1>
          <p className="text-surface-400 mt-2">
            参考《一见你就笑》视觉风格 · 4类模板 · Web安全色 · 适配PR/AE
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 左侧控制面板 */}
          <div className="xl:col-span-1 space-y-6">
            {/* 模板选择 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🎨 选择模板
              </h3>
              <div className="space-y-2">
                {TEMPLATES.map((template) => {
                  const Icon = template.icon
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template.id)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'bg-amber-500/20 border-2 border-amber-500'
                          : 'bg-surface-800/50 border-2 border-transparent hover:bg-surface-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${selectedTemplate === template.id ? 'text-amber-400' : 'text-surface-400'}`} />
                        <div>
                          <div className="font-semibold">{template.name}</div>
                          <div className="text-xs text-surface-400">{template.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 文字设置 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4">✏️ 文字内容</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-surface-400 mb-1 block">主文字</label>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入文字..."
                  />
                </div>
                
                {selectedTemplate === 'section-title' && (
                  <div>
                    <label className="text-sm text-surface-400 mb-1 block">副标题</label>
                    <Input
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="可选副标题..."
                    />
                  </div>
                )}
                
                {selectedTemplate === 'guest-name' && (
                  <div>
                    <label className="text-sm text-surface-400 mb-1 block">身份标签</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="如: 特邀嘉宾..."
                    />
                  </div>
                )}
                
                {/* 快捷选择 */}
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">快捷选择</label>
                  <div className="flex flex-wrap gap-2">
                    {currentTemplate.presets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => { setText(preset); replayAnimation() }}
                        className={`px-2 py-1 text-sm rounded-lg transition-colors ${
                          text === preset 
                            ? 'bg-amber-500 text-black' 
                            : 'bg-surface-700 hover:bg-surface-600'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 颜色变体（仅爆笑大字） */}
            {selectedTemplate === 'funny-text' && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4">🌈 颜色风格</h3>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_VARIANTS.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { setVariant(v.id as any); replayAnimation() }}
                      className={`p-3 rounded-xl text-center transition-all ${
                        variant === v.id
                          ? 'ring-2 ring-amber-500'
                          : 'hover:bg-surface-700/50'
                      }`}
                    >
                      <div 
                        className="w-full h-8 rounded-lg mb-2"
                        style={{ background: v.color }}
                      />
                      <div className="text-sm">{v.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 缩放控制 */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4">🔍 缩放比例</h3>
              <Slider
                value={[scale]}
                onValueChange={([v]) => setScale(v)}
                min={0.5}
                max={1.5}
                step={0.1}
              />
              <div className="flex justify-between text-sm text-surface-400 mt-2">
                <span>0.5x</span>
                <span className="text-amber-400 font-bold">{scale.toFixed(1)}x</span>
                <span>1.5x</span>
              </div>
            </div>
          </div>

          {/* 右侧预览区域 */}
          <div className="xl:col-span-3 space-y-6">
            {/* 预览卡片 */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-surface-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {(() => {
                      const Icon = currentTemplate.icon
                      return <Icon className="w-5 h-5 text-amber-400" />
                    })()}
                    {currentTemplate.name}
                  </h2>
                  <p className="text-sm text-surface-400">{currentTemplate.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={replayAnimation}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    重播
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
              <div className="relative aspect-video bg-surface-900 overflow-hidden">
                {renderPreview()}
                
                {/* 安全区指示 */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-[5%] border border-dashed border-white/10 rounded-lg" />
                  <div className="absolute top-[5%] left-[5%] text-[10px] text-white/30">安全区</div>
                </div>
              </div>
            </div>

            {/* 所有模板预览 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">📋 全部模板预览</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => (
                  <motion.div
                    key={template.id}
                    className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${
                      selectedTemplate === template.id 
                        ? 'border-amber-500' 
                        : 'border-surface-700 hover:border-surface-500'
                    }`}
                    onClick={() => handleTemplateChange(template.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      {template.id === 'main-title' && (
                        <MainTitle text={template.defaultText} scale={0.6} />
                      )}
                      {template.id === 'section-title' && (
                        <SectionTitle title={template.defaultText} scale={0.6} />
                      )}
                      {template.id === 'guest-name' && (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                          <GuestName name={template.defaultText} scale={0.7} />
                        </div>
                      )}
                      {template.id === 'funny-text' && (
                        <FunnyText text={template.defaultText} scale={0.5} />
                      )}
                    </div>
                    <div className="p-3 bg-surface-800">
                      <div className="font-semibold">{template.name}</div>
                      <div className="text-xs text-surface-400">{template.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 使用说明 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">💻 使用方式</h3>
              <pre className="p-4 bg-surface-950 rounded-xl border border-surface-700 overflow-x-auto text-sm text-amber-400/80 font-mono">
{`import { 
  MainTitle,      // 节目主标题
  SectionTitle,   // 分段标题
  GuestName,      // 嘉宾姓名条
  FunnyText,      // 爆笑大字
} from '@/components/variety-text-system'

// 节目主标题
<MainTitle text="一见你就笑" scale={1} />

// 分段标题
<SectionTitle title="本期主题" subtitle="欢乐喜剧人" scale={1} />

// 嘉宾姓名条
<GuestName name="张三" title="特邀嘉宾" scale={1} />

// 爆笑大字 (variant: yellow | pink | cyan | rainbow)
<FunnyText text="笑死我了" variant="yellow" scale={1} />`}
              </pre>
            </div>

            {/* 特效说明 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🎨', title: '视觉风格', desc: '参考《一见你就笑》，色彩饱和、卡通漫画感' },
                { icon: '🔤', title: '文字效果', desc: '粗体圆角字体 + 白色描边 + 立体软糖效果' },
                { icon: '💥', title: '动画特效', desc: '弹跳感 + Squash & Stretch + 速度线 + 粒子' },
                { icon: '📦', title: '输出格式', desc: '预留安全区，适配PR/AE后期包装' },
              ].map((item, i) => (
                <div key={i} className="card p-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-amber-400">{item.title}</div>
                  <div className="text-sm text-surface-400 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}







