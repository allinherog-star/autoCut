'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Video,
  ImageIcon,
  FileText,
  Sparkles,
  Upload,
  Play,
  ChevronRight,
  Wand2,
  Music,
  Type,
  Zap,
  Heart,
  Volume2,
  Scissors,
  Download,
  Star,
  TrendingUp,
  Palette,
  Clock,
  Brain,
} from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'

/**
 * AutoCut 首页 - AI视频剪辑工具
 */
export default function HomePage() {
  const router = useRouter()
  const [hoveredScenario, setHoveredScenario] = useState<string | null>(null)

  // 跳转到编辑器
  const handleStartCreate = (scenarioId?: string) => {
    // 根据不同场景跳转到不同的起始页面
    router.push('/editor/upload')
  }

  return (
    <main className="min-h-screen bg-surface-950 overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] gradient-radial-glow opacity-20" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-gradient-to-tl from-amber-500/5 to-transparent" />
      </div>

      {/* 导航栏 */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Scissors className="w-5 h-5 text-surface-950" />
          </div>
          <span className="text-xl font-display font-bold text-surface-100">AutoCut</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/library')}>素材库</Button>
          <Button variant="ghost" size="sm" onClick={() => router.push('/templates')}>模版库</Button>
          <Button variant="ghost" size="sm">我的偏好</Button>
          <Button variant="ghost" size="sm">我的项目</Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={() => handleStartCreate()}
          >
            开始创作
          </Button>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative z-10 px-8 pt-12 pb-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              size="lg"
              className="mb-6 border-amber-500/50 text-amber-400 shadow-glow-amber bg-amber-500/10"
            >
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  rotate: [0, 10, -10, 0],
                  filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mr-2 flex items-center justify-center"
              >
                <Brain className="w-3.5 h-3.5" />
              </motion.div>
              重新定义视频剪辑，剪到点上，才有流量
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
          >
            <span className="text-surface-100">让 AI 帮你剪出</span>
            <br />
            <span className="text-gradient-primary">爆款视频</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-12"
          >
            上传素材，AI 自动理解内容、智能分割、推荐字幕标题、音乐卡点、特效渲染，
            一站式完成高质量视频创作
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Button
              size="xl"
              leftIcon={<Upload className="w-5 h-5" />}
              className="px-8"
              onClick={() => handleStartCreate()}
            >
              上传素材开始
            </Button>
            <Button
              variant="outline"
              size="xl"
              leftIcon={<Play className="w-5 h-5" />}
            >
              观看演示
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 四种场景入口 */}
      <section className="relative z-10 px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-surface-100 mb-4">
              选择你的创作方式
            </h2>
            <p className="text-surface-400">
              无论你手里有什么素材，AutoCut 都能帮你快速创作
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                onMouseEnter={() => setHoveredScenario(scenario.id)}
                onMouseLeave={() => setHoveredScenario(null)}
              >
                <Card
                  isInteractive
                  isSelected={hoveredScenario === scenario.id}
                  className="relative h-full overflow-hidden group"
                >
                  {/* 渐变背景 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${scenario.gradient[0]}15 0%, ${scenario.gradient[1]}10 100%)`,
                    }}
                  />

                  <div className="relative p-6">
                    {/* 图标 */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${scenario.gradient[0]} 0%, ${scenario.gradient[1]} 100%)`,
                      }}
                    >
                      <scenario.icon className="w-7 h-7 text-surface-950" />
                    </div>

                    {/* 内容 */}
                    <h3 className="text-lg font-semibold text-surface-100 mb-2">
                      {scenario.title}
                    </h3>
                    <p className="text-sm text-surface-400 mb-4 line-clamp-2">
                      {scenario.description}
                    </p>

                    {/* 推荐标签 */}
                    {scenario.recommended && (
                      <Badge variant="primary" size="sm" className="mb-4">
                        <Star className="w-3 h-3" />
                        推荐
                      </Badge>
                    )}

                    {/* 开始按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                      className="group-hover:text-amber-400"
                      onClick={() => handleStartCreate(scenario.id)}
                    >
                      开始创作
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 剪辑流程展示 */}
      <section className="relative z-10 px-8 py-24 bg-surface-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" size="lg" className="mb-6">
              <Wand2 className="w-3.5 h-3.5" />
              智能剪辑流程
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-100 mb-4">
              AI 引导式视频创作
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              从素材上传到成片导出，10 步智能引导，让专业剪辑变得触手可及
            </p>
          </motion.div>

          {/* 步骤卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {editingSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  variant="default"
                  className="p-4 h-full hover:border-amber-400/30 transition-colors duration-300 group"
                >
                  {/* 步骤序号 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="step-indicator step-indicator-pending group-hover:step-indicator-active transition-all duration-300">
                      {index + 1}
                    </div>
                    <span className="text-xs text-surface-500 font-mono">
                      STEP {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* 图标和标题 */}
                  <div className="flex items-center gap-2 mb-2">
                    <step.icon className="w-4 h-4 text-amber-400" />
                    <h3 className="font-medium text-surface-100 text-sm">
                      {step.label}
                    </h3>
                  </div>

                  {/* 描述 */}
                  <p className="text-xs text-surface-500 line-clamp-2">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 产品亮点 */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-100 mb-4">
              为什么选择 AutoCut
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              强大的 AI 能力加上丰富的素材库，让你的创作更高效
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mb-4">
                    <highlight.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-100 mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-surface-400">
                    {highlight.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="relative z-10 px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card variant="glass" className="p-12 text-center relative overflow-hidden">
            {/* 背景光效 */}
            <div className="absolute inset-0 gradient-radial-glow opacity-30" />

            <div className="relative">
              <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center glow-primary">
                <Sparkles className="w-10 h-10 text-surface-950" />
              </div>
              <h2 className="text-3xl font-display font-bold text-surface-100 mb-4">
                准备好创作爆款视频了吗？
              </h2>
              <p className="text-surface-400 mb-8 max-w-lg mx-auto">
                无论你是视频新手还是专业创作者，AutoCut 都能帮你更高效地完成创作
              </p>
              <Button
                size="xl"
                leftIcon={<Upload className="w-5 h-5" />}
                className="px-10 glow-primary-hover"
                onClick={() => handleStartCreate()}
              >
                立即开始创作
              </Button>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* 页脚 */}
      <footer className="relative z-10 border-t border-surface-800 px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Scissors className="w-4 h-4 text-surface-950" />
            </div>
            <span className="font-display font-semibold text-surface-300">AutoCut</span>
          </div>
          <p className="text-sm text-surface-500">
            © 2024 AutoCut. AI 驱动的视频剪辑工具
          </p>
        </div>
      </footer>
    </main>
  )
}

// ============================================
// 数据配置
// ============================================

const scenarios = [
  {
    id: 'video',
    title: '我有视频素材',
    description: 'AI 自动理解视频内容，智能分割提取精华片段',
    icon: Video,
    gradient: ['#fbbf24', '#f59e0b'],
    recommended: true,
  },
  {
    id: 'image',
    title: '我有图片素材',
    description: '图片转视频，AI 自动添加动效和转场',
    icon: ImageIcon,
    gradient: ['#60a5fa', '#3b82f6'],
    recommended: false,
  },
  {
    id: 'text',
    title: '我有文字脚本',
    description: '根据文字脚本，AI 自动匹配素材生成视频',
    icon: FileText,
    gradient: ['#4ade80', '#22c55e'],
    recommended: false,
  },
  {
    id: 'empty',
    title: '从零开始',
    description: '选择热门话题，AI 帮你创作完整视频',
    icon: Sparkles,
    gradient: ['#c084fc', '#a855f7'],
    recommended: false,
  },
]

const editingSteps = [
  {
    id: 'upload',
    label: '上传素材',
    description: '上传视频、图片、文字等基础素材',
    icon: Upload,
  },
  {
    id: 'understand',
    label: '理解视频',
    description: 'AI 分析内容，智能分割提取精华',
    icon: Wand2,
  },
  {
    id: 'subtitle',
    label: '字幕推荐',
    description: '智能识别语音，推荐热点关键字',
    icon: Type,
  },
  {
    id: 'title',
    label: '标题推荐',
    description: '结合热点生成吸睛标题',
    icon: TrendingUp,
  },
  {
    id: 'music',
    label: '音乐卡点',
    description: '智能配乐，自动音乐卡点',
    icon: Music,
  },
  {
    id: 'effects',
    label: '特效渲染',
    description: '标题动画，字幕动效',
    icon: Zap,
  },
  {
    id: 'emotion',
    label: '情绪增强',
    description: '关键点情绪渲染，音效配合',
    icon: Heart,
  },
  {
    id: 'sync',
    label: '音画同步',
    description: '自动校准对齐，确保同步',
    icon: Volume2,
  },
  {
    id: 'edit',
    label: '剪辑微调',
    description: '专业时间轴，精细调整',
    icon: Scissors,
  },
  {
    id: 'export',
    label: '导出成片',
    description: '多分辨率导出爆款视频',
    icon: Download,
  },
]

const highlights = [
  {
    icon: Palette,
    title: '个人偏好记忆',
    description: '保存常用的片头片尾、字幕样式、转场特效，下次自动优先使用你的偏好',
  },
  {
    icon: Sparkles,
    title: '海量素材库',
    description: '音频、视频、花字、表情、字体、动效、转场、滤镜等，按情绪智能分类',
  },
  {
    icon: Wand2,
    title: '智能素材召唤',
    description: '上传素材后自动理解意图，从素材库中召唤最匹配的辅助素材',
  },
  {
    icon: TrendingUp,
    title: '热点关联',
    description: '实时分析平台热点，推荐热门关键词，提升视频曝光',
  },
  {
    icon: Clock,
    title: '效率提升',
    description: '从素材到成片，AI 自动完成 80% 的工作，大幅节省创作时间',
  },
  {
    icon: Scissors,
    title: '专业剪辑',
    description: '提供完整的时间轴编辑功能，随时微调每一个细节',
  },
]
