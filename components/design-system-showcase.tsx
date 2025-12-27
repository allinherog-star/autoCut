'use client'

import { useState } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Settings,
  Upload,
  Sparkles,
  Wand2,
  Music,
  Type,
  Layers,
  Download,
  Check,
  AlertCircle,
  Info,
  ChevronRight,
  Plus,
  Search,
  Film,
  Scissors,
} from 'lucide-react'

import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Switch,
  Slider,
  Select,
  SelectItem,
  Progress,
  CircularProgress,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Tooltip,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  IconButton,
  Skeleton,
  Divider,
  Spinner,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui'

/**
 * 设计系统展示组件
 * 展示所有 UI 组件和设计令牌
 */
export function DesignSystemShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [switchValue, setSwitchValue] = useState(false)
  const [sliderValue, setSliderValue] = useState([50])
  const [selectValue, setSelectValue] = useState('')
  const [progressValue, setProgressValue] = useState(65)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* 页头 */}
      <FadeIn direction="up">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">Design System v1.0</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-gradient-primary mb-4">
            AutoCut 设计系统
          </h1>
          <p className="text-xl text-surface-400 max-w-2xl mx-auto">
            极简、高级、柔和、有交互感的 AI 视频剪辑工具设计语言
          </p>
        </header>
      </FadeIn>

      {/* 色彩系统 */}
      <Section title="色彩系统" icon={<Layers className="w-5 h-5" />}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* 主色 */}
          <ColorSwatch name="Primary" color="bg-amber-400" textColor="text-surface-950" />
          <ColorSwatch name="Primary Hover" color="bg-amber-300" textColor="text-surface-950" />
          <ColorSwatch name="Primary Active" color="bg-amber-500" textColor="text-surface-950" />
          <ColorSwatch name="Success" color="bg-success" textColor="text-white" />
          <ColorSwatch name="Error" color="bg-error" textColor="text-white" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          {/* 表面色 */}
          <ColorSwatch name="Surface 950" color="bg-surface-950" textColor="text-surface-100" border />
          <ColorSwatch name="Surface 900" color="bg-surface-900" textColor="text-surface-100" />
          <ColorSwatch name="Surface 800" color="bg-surface-800" textColor="text-surface-100" />
          <ColorSwatch name="Surface 700" color="bg-surface-700" textColor="text-surface-100" />
          <ColorSwatch name="Surface 600" color="bg-surface-600" textColor="text-surface-100" />
        </div>
      </Section>

      {/* 按钮 */}
      <Section title="按钮" icon={<Film className="w-5 h-5" />}>
        <div className="space-y-6">
          {/* 变体 */}
          <div>
            <h4 className="text-sm text-surface-400 mb-3">变体</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" leftIcon={<Play className="w-4 h-4" />}>
                开始剪辑
              </Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="danger">危险操作</Button>
              <Button variant="success" leftIcon={<Check className="w-4 h-4" />}>
                确认
              </Button>
            </div>
          </div>

          {/* 尺寸 */}
          <div>
            <h4 className="text-sm text-surface-400 mb-3">尺寸</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">超小</Button>
              <Button size="sm">小</Button>
              <Button size="md">中</Button>
              <Button size="lg">大</Button>
              <Button size="xl">超大</Button>
            </div>
          </div>

          {/* 状态 */}
          <div>
            <h4 className="text-sm text-surface-400 mb-3">状态</h4>
            <div className="flex flex-wrap gap-3">
              <Button isLoading loadingText="处理中...">
                提交
              </Button>
              <Button disabled>禁用状态</Button>
              <Button fullWidth className="max-w-xs">
                全宽按钮
              </Button>
            </div>
          </div>

          {/* 图标按钮 */}
          <div>
            <h4 className="text-sm text-surface-400 mb-3">图标按钮</h4>
            <div className="flex flex-wrap gap-2">
              <IconButton icon={<Play className="w-5 h-5" />} aria-label="播放" variant="primary" />
              <IconButton icon={<Pause className="w-5 h-5" />} aria-label="暂停" />
              <IconButton icon={<SkipBack className="w-5 h-5" />} aria-label="后退" variant="ghost" />
              <IconButton icon={<SkipForward className="w-5 h-5" />} aria-label="前进" variant="ghost" />
              <IconButton icon={<Volume2 className="w-5 h-5" />} aria-label="音量" variant="outline" />
              <IconButton icon={<Settings className="w-5 h-5" />} aria-label="设置" variant="ghost" />
            </div>
          </div>
        </div>
      </Section>

      {/* 输入框 */}
      <Section title="输入框" icon={<Type className="w-5 h-5" />}>
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="项目名称"
            placeholder="请输入项目名称"
            helperText="为你的项目起一个独特的名字"
          />
          <Input
            label="搜索素材"
            placeholder="搜索..."
            leftElement={<Search className="w-4 h-4" />}
          />
          <Input
            label="必填字段"
            placeholder="这是必填项"
            isRequired
          />
          <Input
            label="错误状态"
            placeholder="请输入"
            error="名称不能为空"
            isInvalid
          />
        </div>
      </Section>

      {/* 选择器和开关 */}
      <Section title="表单控件" icon={<Settings className="w-5 h-5" />}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 选择器 */}
          <div>
            <Select
              label="导出分辨率"
              placeholder="选择分辨率"
              value={selectValue}
              onValueChange={setSelectValue}
            >
              <SelectItem value="720p">720p HD</SelectItem>
              <SelectItem value="1080p">1080p Full HD</SelectItem>
              <SelectItem value="2k">2K QHD</SelectItem>
              <SelectItem value="4k">4K Ultra HD</SelectItem>
            </Select>
          </div>

          {/* 滑块 */}
          <div>
            <Slider
              label="音量"
              value={sliderValue}
              onValueChange={setSliderValue}
              showValue
              formatValue={(v) => `${v}%`}
            />
          </div>

          {/* 开关 */}
          <div className="space-y-4">
            <Switch
              label="启用自动保存"
              description="每隔 5 分钟自动保存项目"
              checked={switchValue}
              onCheckedChange={setSwitchValue}
            />
            <Switch
              label="高清导出"
              checked={true}
            />
            <Switch
              label="禁用状态"
              disabled
            />
          </div>
        </div>
      </Section>

      {/* 徽章 */}
      <Section title="徽章" icon={<Sparkles className="w-5 h-5" />}>
        <div className="flex flex-wrap gap-3">
          <Badge>默认</Badge>
          <Badge variant="primary">主色</Badge>
          <Badge variant="success" pulse>已完成</Badge>
          <Badge variant="warning">处理中</Badge>
          <Badge variant="error">失败</Badge>
          <Badge variant="info">提示</Badge>
          <Badge variant="outline">轮廓</Badge>
          <Badge variant="primary" dot />
          <Badge variant="success" dot />
          <Badge variant="error" dot />
        </div>
      </Section>

      {/* 进度条 */}
      <Section title="进度条" icon={<Upload className="w-5 h-5" />}>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Progress value={progressValue} showLabel label="上传进度" />
            <Progress value={85} variant="success" showLabel label="处理完成" />
            <Progress isIndeterminate variant="primary" showLabel label="处理中..." />
            <Progress value={30} variant="warning" showLabel label="磁盘空间" striped />
          </div>

          <div>
            <h4 className="text-sm text-surface-400 mb-3">圆形进度条</h4>
            <div className="flex items-center gap-6">
              <CircularProgress value={75} showValue variant="primary" />
              <CircularProgress value={100} showValue variant="success" />
              <CircularProgress isIndeterminate variant="primary" />
              <CircularProgress value={45} size={64} strokeWidth={6} showValue />
            </div>
          </div>
        </div>
      </Section>

      {/* 卡片 */}
      <Section title="卡片" icon={<Layers className="w-5 h-5" />}>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader title="默认卡片" description="这是卡片描述" />
            <CardContent>
              <p className="text-surface-400 text-sm">卡片内容区域</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="ghost">取消</Button>
              <Button size="sm">确认</Button>
            </CardFooter>
          </Card>

          <Card isInteractive onClick={() => console.log('clicked')}>
            <CardHeader
              title="可交互卡片"
              description="点击查看详情"
              action={<ChevronRight className="w-4 h-4 text-surface-400" />}
            />
            <CardContent>
              <div className="aspect-video bg-surface-700 rounded-lg flex items-center justify-center">
                <Film className="w-8 h-8 text-surface-500" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader title="玻璃效果" />
            <CardContent>
              <p className="text-surface-400 text-sm">
                使用玻璃拟态效果的卡片，背景模糊透明。
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* 标签页 */}
      <Section title="标签页" icon={<Scissors className="w-5 h-5" />}>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic" leftIcon={<Info className="w-4 h-4" />}>
              基础信息
            </TabsTrigger>
            <TabsTrigger value="advanced" leftIcon={<Settings className="w-4 h-4" />}>
              高级设置
            </TabsTrigger>
            <TabsTrigger value="export" leftIcon={<Download className="w-4 h-4" />}>
              导出配置
            </TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <Card padding="md">
              <p className="text-surface-400">基础信息内容区域</p>
            </Card>
          </TabsContent>
          <TabsContent value="advanced">
            <Card padding="md">
              <p className="text-surface-400">高级设置内容区域</p>
            </Card>
          </TabsContent>
          <TabsContent value="export">
            <Card padding="md">
              <p className="text-surface-400">导出配置内容区域</p>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>

      {/* 弹窗 */}
      <Section title="弹窗" icon={<Layers className="w-5 h-5" />}>
        <Button onClick={() => setIsModalOpen(true)}>打开弹窗</Button>
        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalHeader
            title="确认导出"
            description="请确认以下导出配置"
          />
          <ModalContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-surface-400">分辨率</span>
                <span className="text-surface-200">1080p Full HD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">帧率</span>
                <span className="text-surface-200">30 fps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">格式</span>
                <span className="text-surface-200">MP4 (H.264)</span>
              </div>
              <Divider />
              <div className="flex justify-between">
                <span className="text-surface-400">预计大小</span>
                <span className="text-amber-400 font-medium">~256 MB</span>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button leftIcon={<Download className="w-4 h-4" />}>
              开始导出
            </Button>
          </ModalFooter>
        </Modal>
      </Section>

      {/* 提示 */}
      <Section title="提示工具" icon={<Info className="w-5 h-5" />}>
        <div className="flex flex-wrap gap-4">
          <Tooltip content="这是一个提示">
            <Button variant="outline">悬停查看</Button>
          </Tooltip>
          <Tooltip content="右侧提示" side="right">
            <Button variant="outline">右侧</Button>
          </Tooltip>
          <Tooltip content="底部提示" side="bottom">
            <Button variant="outline">底部</Button>
          </Tooltip>
          <Tooltip content="左侧提示" side="left">
            <Button variant="outline">左侧</Button>
          </Tooltip>
        </div>
      </Section>

      {/* 加载状态 */}
      <Section title="加载状态" icon={<Wand2 className="w-5 h-5" />}>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm text-surface-400 mb-3">加载指示器</h4>
            <div className="flex items-center gap-6">
              <Spinner size="sm" />
              <Spinner size="md" variant="primary" />
              <Spinner size="lg" variant="primary" label="加载中..." />
            </div>
          </div>

          <div>
            <h4 className="text-sm text-surface-400 mb-3">骨架屏</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton circle width={48} height={48} />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </Section>

      {/* 动画演示 */}
      <Section title="动画效果" icon={<Sparkles className="w-5 h-5" />}>
        <StaggerContainer className="grid md:grid-cols-4 gap-4">
          {['淡入', '上滑', '缩放', '弹性'].map((item, i) => (
            <StaggerItem key={i}>
              <Card padding="md" className="text-center">
                <span className="text-surface-300">{item}</span>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      {/* 剪辑步骤预览 */}
      <Section title="剪辑步骤" icon={<Scissors className="w-5 h-5" />}>
        <StaggerContainer className="flex flex-wrap gap-4">
          {[
            { icon: Upload, label: '上传素材', status: 'completed' as const },
            { icon: Wand2, label: '理解视频', status: 'completed' as const },
            { icon: Type, label: '字幕推荐', status: 'active' as const },
            { icon: Sparkles, label: '标题推荐', status: 'pending' as const },
            { icon: Music, label: '音乐卡点', status: 'pending' as const },
            { icon: Layers, label: '特效渲染', status: 'pending' as const },
            { icon: AlertCircle, label: '情绪增强', status: 'pending' as const },
            { icon: Play, label: '音画同步', status: 'pending' as const },
            { icon: Scissors, label: '剪辑微调', status: 'pending' as const },
            { icon: Download, label: '完成导出', status: 'pending' as const },
          ].map((step, i) => (
            <StaggerItem key={i}>
              <StepIndicator {...step} index={i + 1} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      {/* 页脚 */}
      <footer className="mt-20 pt-8 border-t border-surface-700 text-center">
        <p className="text-surface-500 text-sm">
          AutoCut Design System · 构建于 Next.js 15 + Tailwind CSS + Framer Motion
        </p>
      </footer>
    </div>
  )
}

// ============================================
// 辅助组件
// ============================================

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mb-16">
      <FadeIn direction="up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">{icon}</div>
          <h2 className="text-2xl font-display font-semibold text-surface-100">{title}</h2>
        </div>
        {children}
      </FadeIn>
    </section>
  )
}

function ColorSwatch({
  name,
  color,
  textColor,
  border,
}: {
  name: string
  color: string
  textColor: string
  border?: boolean
}) {
  return (
    <div
      className={`
        h-24 rounded-xl flex items-end p-3
        ${color} ${textColor}
        ${border ? 'border border-surface-700' : ''}
      `}
    >
      <span className="text-xs font-medium opacity-90">{name}</span>
    </div>
  )
}

function StepIndicator({
  icon: Icon,
  label,
  status,
  index,
}: {
  icon: React.ElementType<{ className?: string }>
  label: string
  status: 'completed' | 'active' | 'pending'
  index: number
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800 border border-surface-600">
      <div
        className={`
          step-indicator
          ${status === 'completed' ? 'step-indicator-completed' : ''}
          ${status === 'active' ? 'step-indicator-active' : ''}
          ${status === 'pending' ? 'step-indicator-pending' : ''}
        `}
      >
        {status === 'completed' ? (
          <Check className="w-4 h-4" />
        ) : (
          <span>{index}</span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-surface-200">{label}</p>
        <p className="text-xs text-surface-500">
          {status === 'completed' && '已完成'}
          {status === 'active' && '进行中'}
          {status === 'pending' && '待处理'}
        </p>
      </div>
    </div>
  )
}






























