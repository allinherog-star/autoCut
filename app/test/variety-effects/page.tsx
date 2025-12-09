'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Variants, useAnimation } from 'framer-motion'
import { EmotionTextEffect } from '@/components/emotion-text-effect'
import { 
  EMOTION_TEXT_PRESETS, 
  EMOTION_COLORS, 
  type EmotionType 
} from '@/lib/emotion-text-effects'
import { 
  Sparkles, 
  Layers, 
  Video, 
  Wand2, 
  Box,
  Atom,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code,
  Eye,
  Palette,
  Zap,
  Heart,
  Star,
  Flame
} from 'lucide-react'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'

// ============================================
// 类型定义
// ============================================

type DemoSection = 'falling' | 'text-animation' | 'particles' | 'keyframes' | 'pip' | 'mask' | 'presets'

interface DemoConfig {
  id: DemoSection
  name: string
  icon: React.ReactNode
  description: string
}

const DEMO_SECTIONS: DemoConfig[] = [
  {
    id: 'falling',
    name: '🍂 逐字飘落',
    icon: <Sparkles className="w-5 h-5" />,
    description: '逐字从天而降的飘落动画效果',
  },
  {
    id: 'presets',
    name: '情绪预设',
    icon: <Wand2 className="w-5 h-5" />,
    description: '像《一见你就笑》一样的综艺花字预设效果',
  },
  {
    id: 'text-animation',
    name: '文字动效',
    icon: <Zap className="w-5 h-5" />,
    description: '入场动画、逐字动画、弹性效果、震动效果',
  },
  {
    id: 'particles',
    name: '粒子效果',
    icon: <Atom className="w-5 h-5" />,
    description: '星星、爱心、火焰、纸屑等粒子系统',
  },
  {
    id: 'pip',
    name: '画中画',
    icon: <Layers className="w-5 h-5" />,
    description: '视频叠加、多层合成、画中画效果',
  },
  {
    id: 'mask',
    name: '蒙版',
    icon: <Box className="w-5 h-5" />,
    description: '遮罩、裁剪、渐变蒙版效果',
  },
]

// ============================================
// 粒子系统组件
// ============================================

interface ParticleDemoProps {
  type: 'star' | 'heart' | 'fire' | 'confetti' | 'sparkle' | 'bubble'
  color?: string
  count?: number
  isPlaying?: boolean
}

const ParticleDemo = ({ type, color = '#FFD700', count = 30, isPlaying = true }: ParticleDemoProps) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 8 + Math.random() * 16,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 2,
      rotation: Math.random() * 360,
    }))
  }, [count])

  const getParticleContent = (t: string, size: number) => {
    switch (t) {
      case 'star':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        )
      case 'heart':
        return <span style={{ fontSize: size, color }}>❤️</span>
      case 'fire':
        return <span style={{ fontSize: size }}>🔥</span>
      case 'sparkle':
        return <span style={{ fontSize: size }}>✨</span>
      case 'confetti':
        return (
          <div
            style={{
              width: size,
              height: size * 0.4,
              background: color,
              borderRadius: '2px',
            }}
          />
        )
      case 'bubble':
        return (
          <div
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle at 30% 30%, white 0%, ${color}40 40%, ${color}60 100%)`,
              borderRadius: '50%',
              border: `1px solid ${color}60`,
            }}
          />
        )
      default:
        return <span style={{ fontSize: size }}>⭐</span>
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isPlaying && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{
            scale: 0,
            opacity: 0,
            rotate: particle.rotation,
          }}
          animate={{
            scale: [0, 1.2, 1, 0],
            opacity: [0, 1, 1, 0],
            y: type === 'bubble' ? [-20, -60] : [0, -30, 0],
            rotate: particle.rotation + (Math.random() > 0.5 ? 180 : -180),
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 1,
            ease: 'easeInOut',
          }}
        >
          {getParticleContent(type, particle.size)}
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// 关键帧动画演示组件
// ============================================

const KeyframeDemo = () => {
  const [activeAnimation, setActiveAnimation] = useState<string>('bounce')
  const [isPlaying, setIsPlaying] = useState(true)
  const [key, setKey] = useState(0)

  const animations: Record<string, Variants> = {
    bounce: {
      animate: {
        y: [0, -50, 0, -25, 0, -10, 0],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
          times: [0, 0.3, 0.5, 0.65, 0.8, 0.9, 1],
        },
      },
    },
    shake: {
      animate: {
        x: [-10, 10, -10, 10, -5, 5, 0],
        rotate: [-3, 3, -3, 3, -1, 1, 0],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 1,
        },
      },
    },
    pulse: {
      animate: {
        scale: [1, 1.2, 1, 1.15, 1],
        opacity: [1, 0.8, 1, 0.9, 1],
        transition: {
          duration: 1,
          repeat: Infinity,
        },
      },
    },
    spin: {
      animate: {
        rotate: [0, 360],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
    wave: {
      animate: {
        scaleY: [1, 1.3, 1, 0.7, 1],
        scaleX: [1, 0.8, 1, 1.2, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
    glitch: {
      animate: {
        x: [0, -5, 5, -3, 3, 0],
        y: [0, 3, -3, 2, -2, 0],
        filter: [
          'hue-rotate(0deg)',
          'hue-rotate(90deg)',
          'hue-rotate(-90deg)',
          'hue-rotate(45deg)',
          'hue-rotate(0deg)',
        ],
        transition: {
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 1.5,
        },
      },
    },
    typewriter: {
      animate: {
        width: ['0%', '100%'],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'steps(10)',
        },
      },
    },
    rubberBand: {
      animate: {
        scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
        scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
        transition: {
          duration: 1,
          repeat: Infinity,
          repeatDelay: 1,
        },
      },
    },
  }

  const animationList = [
    { id: 'bounce', name: '弹跳', icon: '⬆️' },
    { id: 'shake', name: '震动', icon: '📳' },
    { id: 'pulse', name: '脉冲', icon: '💓' },
    { id: 'spin', name: '旋转', icon: '🔄' },
    { id: 'wave', name: '波浪', icon: '🌊' },
    { id: 'glitch', name: '故障', icon: '📺' },
    { id: 'rubberBand', name: '橡皮筋', icon: '🎈' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {animationList.map((anim) => (
          <button
            key={anim.id}
            onClick={() => {
              setActiveAnimation(anim.id)
              setKey(k => k + 1)
            }}
            className={`
              px-4 py-2 rounded-lg border text-sm font-medium transition-all
              ${activeAnimation === anim.id
                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
              }
            `}
          >
            <span className="mr-2">{anim.icon}</span>
            {anim.name}
          </button>
        ))}
      </div>

      <div className="relative h-48 bg-surface-900/80 rounded-xl border border-surface-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <motion.div
          key={key}
          className="text-5xl font-bold text-gradient-primary"
          variants={animations[activeAnimation]}
          animate={isPlaying ? 'animate' : undefined}
        >
          动画效果
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        >
          {isPlaying ? '暂停' : '播放'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setKey(k => k + 1)}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          重播
        </Button>
      </div>

      {/* 代码示例 */}
      <div className="p-4 bg-surface-950 rounded-xl border border-surface-700">
        <div className="text-xs text-surface-400 mb-2">Framer Motion 代码示例</div>
        <pre className="text-sm text-amber-400/80 font-mono overflow-x-auto">
{`<motion.div
  animate={{
    ${activeAnimation === 'bounce' ? 'y: [0, -50, 0, -25, 0],' : ''}
    ${activeAnimation === 'shake' ? 'x: [-10, 10, -10, 10, 0],' : ''}
    ${activeAnimation === 'pulse' ? 'scale: [1, 1.2, 1],' : ''}
    ${activeAnimation === 'spin' ? 'rotate: [0, 360],' : ''}
    ${activeAnimation === 'wave' ? 'scaleY: [1, 1.3, 1, 0.7, 1],' : ''}
    ${activeAnimation === 'glitch' ? 'x: [0, -5, 5, 0], filter: [...]' : ''}
    ${activeAnimation === 'rubberBand' ? 'scaleX: [1, 1.25, 0.75, 1],' : ''}
  }}
  transition={{ duration: 1, repeat: Infinity }}
>
  动画效果
</motion.div>`}
        </pre>
      </div>
    </div>
  )
}

// ============================================
// 画中画演示组件
// ============================================

const PictureInPictureDemo = () => {
  const [pipPosition, setPipPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('bottom-right')
  const [pipSize, setPipSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [showBorder, setShowBorder] = useState(true)
  const [showShadow, setShowShadow] = useState(true)

  const positionStyles: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  const sizeStyles: Record<string, string> = {
    small: 'w-24 h-16',
    medium: 'w-36 h-24',
    large: 'w-48 h-32',
  }

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-surface-400 mb-2">位置</div>
          <div className="flex flex-wrap gap-1">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setPipPosition(pos)}
                className={`
                  px-2 py-1 text-xs rounded border transition-all
                  ${pipPosition === pos
                    ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                    : 'border-surface-600 hover:border-surface-500'
                  }
                `}
              >
                {pos.split('-').map(w => w[0].toUpperCase()).join('')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-surface-400 mb-2">尺寸</div>
          <div className="flex gap-1">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setPipSize(size)}
                className={`
                  px-2 py-1 text-xs rounded border transition-all
                  ${pipSize === size
                    ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                    : 'border-surface-600 hover:border-surface-500'
                  }
                `}
              >
                {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-surface-400 mb-2">边框</div>
          <button
            onClick={() => setShowBorder(!showBorder)}
            className={`
              px-3 py-1 text-xs rounded border transition-all
              ${showBorder
                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                : 'border-surface-600'
              }
            `}
          >
            {showBorder ? '显示' : '隐藏'}
          </button>
        </div>
        <div>
          <div className="text-xs text-surface-400 mb-2">阴影</div>
          <button
            onClick={() => setShowShadow(!showShadow)}
            className={`
              px-3 py-1 text-xs rounded border transition-all
              ${showShadow
                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                : 'border-surface-600'
              }
            `}
          >
            {showShadow ? '显示' : '隐藏'}
          </button>
        </div>
      </div>

      {/* 演示区域 */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-xl overflow-hidden border border-surface-700">
        {/* 主画面 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-white/90 mb-2">主视频画面</div>
            <div className="text-surface-300">这是视频的主要内容区域</div>
          </div>
        </div>

        {/* 画中画小窗 */}
        <motion.div
          layout
          className={`
            absolute ${positionStyles[pipPosition]} ${sizeStyles[pipSize]}
            bg-gradient-to-br from-amber-500 via-orange-500 to-red-500
            rounded-lg overflow-hidden
            ${showBorder ? 'border-2 border-white/80' : ''}
            ${showShadow ? 'shadow-2xl shadow-black/50' : ''}
          `}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs font-medium">画中画</div>
            </div>
          </div>
        </motion.div>

        {/* 花字特效覆盖层 */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none">
          <motion.div
            className="text-2xl font-bold text-white"
            style={{
              textShadow: '0 0 20px rgba(255,107,0,0.8), 2px 2px 0 #000',
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          >
            🔥 综艺花字效果 🔥
          </motion.div>
        </div>
      </div>

      {/* 代码示例 */}
      <div className="p-4 bg-surface-950 rounded-xl border border-surface-700">
        <div className="text-xs text-surface-400 mb-2">CSS 实现画中画</div>
        <pre className="text-sm text-amber-400/80 font-mono overflow-x-auto">
{`.pip-container {
  position: relative;
}

.pip-window {
  position: absolute;
  ${pipPosition.includes('top') ? 'top: 1rem;' : 'bottom: 1rem;'}
  ${pipPosition.includes('right') ? 'right: 1rem;' : 'left: 1rem;'}
  width: ${pipSize === 'small' ? '6rem' : pipSize === 'medium' ? '9rem' : '12rem'};
  ${showBorder ? 'border: 2px solid rgba(255,255,255,0.8);' : ''}
  ${showShadow ? 'box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);' : ''}
  border-radius: 0.5rem;
  overflow: hidden;
  z-index: 10;
}`}
        </pre>
      </div>
    </div>
  )
}

// ============================================
// 蒙版效果演示组件
// ============================================

const MaskDemo = () => {
  const [maskType, setMaskType] = useState<'gradient' | 'radial' | 'shape' | 'text' | 'reveal'>('gradient')
  const [isAnimating, setIsAnimating] = useState(true)
  const [key, setKey] = useState(0)

  const maskStyles: Record<string, React.CSSProperties> = {
    gradient: {
      maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
    },
    radial: {
      maskImage: 'radial-gradient(circle at center, black 0%, black 40%, transparent 70%)',
      WebkitMaskImage: 'radial-gradient(circle at center, black 0%, black 40%, transparent 70%)',
    },
    shape: {
      maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpolygon points=\'100,10 190,190 10,190\' fill=\'black\'/%3E%3C/svg%3E")',
      WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpolygon points=\'100,10 190,190 10,190\' fill=\'black\'/%3E%3C/svg%3E")',
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
    },
    text: {},
    reveal: {},
  }

  const maskList = [
    { id: 'gradient', name: '渐变蒙版', icon: '🌅' },
    { id: 'radial', name: '径向蒙版', icon: '🔘' },
    { id: 'shape', name: '形状蒙版', icon: '📐' },
    { id: 'text', name: '文字蒙版', icon: '📝' },
    { id: 'reveal', name: '揭示动画', icon: '✨' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {maskList.map((mask) => (
          <button
            key={mask.id}
            onClick={() => {
              setMaskType(mask.id as any)
              setKey(k => k + 1)
            }}
            className={`
              px-4 py-2 rounded-lg border text-sm font-medium transition-all
              ${maskType === mask.id
                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
              }
            `}
          >
            <span className="mr-2">{mask.icon}</span>
            {mask.name}
          </button>
        ))}
      </div>

      {/* 演示区域 */}
      <div className="relative h-64 bg-surface-900/80 rounded-xl border border-surface-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        {/* 不同蒙版效果 */}
        {maskType === 'gradient' && (
          <div
            key={key}
            className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center"
            style={maskStyles.gradient}
          >
            <span className="text-4xl font-bold text-white">渐变蒙版效果</span>
          </div>
        )}

        {maskType === 'radial' && (
          <div
            key={key}
            className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"
            style={maskStyles.radial}
          >
            <span className="text-4xl font-bold text-white">径向蒙版效果</span>
          </div>
        )}

        {maskType === 'shape' && (
          <div
            key={key}
            className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center"
            style={maskStyles.shape}
          >
            <span className="text-3xl font-bold text-white">形状</span>
          </div>
        )}

        {maskType === 'text' && (
          <div
            key={key}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* 背景图案 */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />
            {/* 文字蒙版 */}
            <span 
              className="text-7xl font-black"
              style={{
                background: 'linear-gradient(45deg, #FFD700, #FF6B00, #FF0000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              花字
            </span>
          </div>
        )}

        {maskType === 'reveal' && (
          <div key={key} className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={isAnimating ? { clipPath: 'inset(0 0% 0 0)' } : undefined}
              transition={{
                duration: 1.5,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 0.5,
              }}
            />
            <span className="relative z-10 text-4xl font-bold text-white">揭示动画效果</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAnimating(!isAnimating)}
          leftIcon={isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        >
          {isAnimating ? '暂停' : '播放'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setKey(k => k + 1)}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          重播
        </Button>
      </div>

      {/* 代码示例 */}
      <div className="p-4 bg-surface-950 rounded-xl border border-surface-700">
        <div className="text-xs text-surface-400 mb-2">CSS 蒙版代码</div>
        <pre className="text-sm text-amber-400/80 font-mono overflow-x-auto">
{maskType === 'gradient' ? 
`.masked-element {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 20%,
    black 80%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(...);
}` : maskType === 'radial' ?
`.masked-element {
  mask-image: radial-gradient(
    circle at center,
    black 0%,
    black 40%,
    transparent 70%
  );
}` : maskType === 'reveal' ?
`<motion.div
  initial={{ clipPath: 'inset(0 100% 0 0)' }}
  animate={{ clipPath: 'inset(0 0% 0 0)' }}
  transition={{ duration: 1.5, ease: 'easeInOut' }}
/>` : maskType === 'text' ?
`.text-mask {
  background: linear-gradient(45deg, #FFD700, #FF6B00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}` :
`.shape-mask {
  mask-image: url('triangle.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}`}
        </pre>
      </div>
    </div>
  )
}

// ============================================
// 音效系统
// ============================================

type SoundType = 'ding' | 'pop' | 'drop' | 'chime' | 'bounce' | 'sparkle' | 'none'

// Web Audio API 生成音效
const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback((type: SoundType, index: number = 0) => {
    if (type === 'none') return
    
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      const now = ctx.currentTime
      // 根据字符索引调整音高，形成音阶效果
      const baseFreq = 400 + index * 80

      switch (type) {
        case 'ding':
          // 清脆的叮咚声
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(baseFreq + 200, now)
          oscillator.frequency.exponentialRampToValueAtTime(baseFreq + 100, now + 0.1)
          gainNode.gain.setValueAtTime(0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
          oscillator.start(now)
          oscillator.stop(now + 0.3)
          break

        case 'pop':
          // 气泡爆破声
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(baseFreq + 300, now)
          oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.08)
          gainNode.gain.setValueAtTime(0.4, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
          oscillator.start(now)
          oscillator.stop(now + 0.15)
          break

        case 'drop':
          // 水滴落下声
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(baseFreq + 400, now)
          oscillator.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.15)
          oscillator.frequency.exponentialRampToValueAtTime(baseFreq + 50, now + 0.2)
          gainNode.gain.setValueAtTime(0.25, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
          oscillator.start(now)
          oscillator.stop(now + 0.25)
          break

        case 'chime':
          // 风铃声 - 使用多个频率叠加
          oscillator.type = 'triangle'
          oscillator.frequency.setValueAtTime(baseFreq + 500, now)
          oscillator.frequency.setValueAtTime(baseFreq + 700, now + 0.05)
          oscillator.frequency.setValueAtTime(baseFreq + 600, now + 0.1)
          gainNode.gain.setValueAtTime(0.2, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
          oscillator.start(now)
          oscillator.stop(now + 0.5)
          break

        case 'bounce':
          // 弹跳声
          oscillator.type = 'square'
          oscillator.frequency.setValueAtTime(baseFreq, now)
          oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.05)
          oscillator.frequency.setValueAtTime(baseFreq * 0.8, now + 0.06)
          oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.1)
          gainNode.gain.setValueAtTime(0.15, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
          oscillator.start(now)
          oscillator.stop(now + 0.12)
          break

        case 'sparkle':
          // 星光闪烁声
          oscillator.type = 'sine'
          const freq1 = baseFreq + 800
          oscillator.frequency.setValueAtTime(freq1, now)
          oscillator.frequency.setValueAtTime(freq1 + 200, now + 0.02)
          oscillator.frequency.setValueAtTime(freq1 + 400, now + 0.04)
          oscillator.frequency.exponentialRampToValueAtTime(freq1 + 100, now + 0.2)
          gainNode.gain.setValueAtTime(0.15, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
          oscillator.start(now)
          oscillator.stop(now + 0.25)
          break
      }
    } catch (e) {
      console.warn('Sound playback failed:', e)
    }
  }, [getAudioContext])

  return { playSound }
}

// ============================================
// 逐字飘落效果独立演示
// ============================================

const FallingTextDemo = () => {
  const [text, setText] = useState('我爱了')
  const [fallStyle, setFallStyle] = useState<'gentle' | 'swing' | 'spiral' | 'bounce' | 'snow'>('gentle')
  const [soundType, setSoundType] = useState<SoundType>('ding')
  const [layoutMode, setLayoutMode] = useState<'line' | 'scatter' | 'triangle' | 'random'>('scatter')
  const [key, setKey] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const { playSound } = useSound()
  const soundPlayedRef = useRef<Set<number>>(new Set())
  
  const layoutModes = [
    { id: 'line', name: '一行排列', icon: '➖' },
    { id: 'scatter', name: '分散布局', icon: '✨' },
    { id: 'triangle', name: '三角形', icon: '🔺' },
    { id: 'random', name: '随机位置', icon: '🎲' },
  ]
  
  // 固定的分散位置配置（针对3个字优化）
  const getScatterPosition = (index: number, total: number) => {
    // 3个字的经典布局：左上、右上、下中
    if (total === 3) {
      const positions = [
        { x: -25, y: -15, rotate: -8, scale: 1.1 },   // 我 - 左上
        { x: 30, y: -10, rotate: 12, scale: 1.2 },    // 爱 - 右上（稍大）
        { x: 5, y: 25, rotate: -5, scale: 1 },        // 了 - 下中
      ]
      return positions[index]
    }
    // 其他数量的默认布局
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2
    const radius = 25
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.6,
      rotate: (Math.random() - 0.5) * 20,
      scale: 0.9 + Math.random() * 0.3,
    }
  }

  // 三角形布局
  const getTrianglePosition = (index: number, total: number) => {
    if (total === 3) {
      const positions = [
        { x: 0, y: -20, rotate: 0, scale: 1.15 },     // 顶部
        { x: -30, y: 20, rotate: -10, scale: 1 },     // 左下
        { x: 30, y: 20, rotate: 10, scale: 1 },       // 右下
      ]
      return positions[index]
    }
    return { x: 0, y: 0, rotate: 0, scale: 1 }
  }

  // 获取字符的最终位置和样式
  const getCharLayout = (index: number) => {
    const total = text.length
    switch (layoutMode) {
      case 'scatter':
        return getScatterPosition(index, total)
      case 'triangle':
        return getTrianglePosition(index, total)
      case 'random':
        return {
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 35,
          rotate: (Math.random() - 0.5) * 25,
          scale: 0.9 + Math.random() * 0.3,
        }
      case 'line':
      default:
        return { x: 0, y: 0, rotate: 0, scale: 1 }
    }
  }

  const fallStyles = [
    { id: 'gentle', name: '轻柔飘落', icon: '🍂', description: '像秋叶般轻盈落下' },
    { id: 'swing', name: '摇摆飘落', icon: '🍃', description: '左右摇摆着落下' },
    { id: 'spiral', name: '螺旋飘落', icon: '🌀', description: '旋转着螺旋下降' },
    { id: 'bounce', name: '弹跳落地', icon: '⬇️', description: '落地后弹跳几下' },
    { id: 'snow', name: '雪花飘落', icon: '❄️', description: '像雪花一样慢慢飘' },
  ]

  const soundTypes = [
    { id: 'ding', name: '叮咚', icon: '🔔', description: '清脆的叮咚声' },
    { id: 'pop', name: '气泡', icon: '🫧', description: '气泡爆破声' },
    { id: 'drop', name: '水滴', icon: '💧', description: '水滴落下声' },
    { id: 'chime', name: '风铃', icon: '🎐', description: '悠扬的风铃声' },
    { id: 'bounce', name: '弹跳', icon: '🏀', description: '弹跳落地声' },
    { id: 'sparkle', name: '星光', icon: '✨', description: '星光闪烁声' },
    { id: 'none', name: '静音', icon: '🔇', description: '无声模式' },
  ]

  // 重置时清空已播放记录，并设置音效定时器
  useEffect(() => {
    soundPlayedRef.current = new Set()
    
    if (!isPlaying || soundType === 'none') return

    // 根据动画延迟设置音效播放时间
    const timeouts: NodeJS.Timeout[] = []
    const baseDelay = 0.18 // 与动画中的 delay 一致
    const animDuration = fallStyle === 'snow' ? 2 : fallStyle === 'swing' ? 1.4 : 0.9

    text.split('').forEach((_, index) => {
      const soundDelay = (index * baseDelay + animDuration * 0.7) * 1000 // 在动画 70% 时播放（接近落地）
      const timeout = setTimeout(() => {
        playSound(soundType, index)
      }, soundDelay)
      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [key, isPlaying, soundType, text, fallStyle, playSound])

  const getCharAnimation = (index: number): Variants => {
    const baseDelay = index * 0.25  // 增加延迟让效果更明显
    const layout = getCharLayout(index)
    const randomSwing = Math.random() * 20 - 10

    switch (fallStyle) {
      case 'gentle':
        return {
          hidden: { 
            opacity: 0, 
            y: -180,
            scale: 0.4,
            filter: 'blur(8px)',
          },
          visible: {
            opacity: 1,
            y: 0,
            scale: layout.scale,
            rotate: layout.rotate,
            filter: 'blur(0px)',
            transition: {
              duration: 1,
              delay: baseDelay,
              ease: [0.25, 0.46, 0.45, 0.94],
            },
          },
        }
      case 'swing':
        return {
          hidden: { 
            opacity: 0, 
            y: -200,
            x: index % 2 === 0 ? -50 : 50,
            rotate: index % 2 === 0 ? -30 : 30,
          },
          visible: {
            opacity: 1,
            y: 0,
            x: [
              index % 2 === 0 ? -50 : 50,
              index % 2 === 0 ? 30 : -30,
              index % 2 === 0 ? -18 : 18,
              index % 2 === 0 ? 10 : -10,
              0
            ],
            rotate: [
              index % 2 === 0 ? -30 : 30,
              index % 2 === 0 ? 20 : -20,
              index % 2 === 0 ? -12 : 12,
              layout.rotate
            ],
            scale: layout.scale,
            transition: {
              duration: 1.5,
              delay: baseDelay,
              ease: 'easeOut',
            },
          },
        }
      case 'spiral':
        return {
          hidden: { 
            opacity: 0, 
            y: -220,
            rotate: -720,
            scale: 0.15,
          },
          visible: {
            opacity: 1,
            y: 0,
            rotate: [null, -360, -180, layout.rotate],
            scale: [0.15, 1.4, 0.8, layout.scale],
            transition: {
              duration: 1.3,
              delay: baseDelay,
              ease: [0.22, 1, 0.36, 1],
            },
          },
        }
      case 'bounce':
        return {
          hidden: { 
            opacity: 0, 
            y: -280,
            scale: 0.5,
          },
          visible: {
            opacity: 1,
            y: [null, 40, -25, 15, -8, 0],
            scale: [0.5, layout.scale * 1.2, layout.scale * 0.85, layout.scale * 1.1, layout.scale],
            rotate: [0, 5, -3, 2, layout.rotate],
            transition: {
              duration: 1.2,
              delay: baseDelay,
              times: [0, 0.35, 0.5, 0.65, 0.8, 1],
              ease: 'easeOut',
            },
          },
        }
      case 'snow':
        return {
          hidden: { 
            opacity: 0, 
            y: -220,
            x: randomSwing,
          },
          visible: {
            opacity: [0, 0.5, 1, 1],
            y: 0,
            x: [
              randomSwing,
              randomSwing + 20,
              randomSwing - 15,
              randomSwing + 10,
              0
            ],
            rotate: [0, 10, -8, 5, layout.rotate],
            scale: layout.scale,
            transition: {
              duration: 2.2,
              delay: baseDelay,
              ease: 'linear',
            },
          },
        }
      default:
        return {
          hidden: { opacity: 0, y: -150 },
          visible: { opacity: 1, y: 0, scale: layout.scale, rotate: layout.rotate },
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* 样式选择 */}
      <div className="flex flex-wrap gap-2">
        {fallStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => {
              setFallStyle(style.id as any)
              setKey(k => k + 1)
            }}
            className={`
              px-4 py-2 rounded-lg border text-sm font-medium transition-all
              ${fallStyle === style.id
                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
              }
            `}
          >
            <span className="mr-2">{style.icon}</span>
            {style.name}
          </button>
        ))}
      </div>

      {/* 布局模式选择 */}
      <div>
        <div className="text-xs text-surface-500 mb-2">📍 位置布局</div>
        <div className="flex flex-wrap gap-2">
          {layoutModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setLayoutMode(mode.id as any)
                setKey(k => k + 1)
              }}
              className={`
                px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                ${layoutMode === mode.id
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
                }
              `}
            >
              <span className="mr-1">{mode.icon}</span>
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* 音效选择 */}
      <div>
        <div className="text-xs text-surface-500 mb-2">🔊 落地音效</div>
        <div className="flex flex-wrap gap-2">
          {soundTypes.map((sound) => (
            <button
              key={sound.id}
              onClick={() => {
                setSoundType(sound.id as SoundType)
                // 预览音效
                if (sound.id !== 'none') {
                  playSound(sound.id as SoundType, 3)
                }
              }}
              className={`
                px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                ${soundType === sound.id
                  ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                  : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
                }
              `}
              title={sound.description}
            >
              <span className="mr-1">{sound.icon}</span>
              {sound.name}
            </button>
          ))}
        </div>
      </div>

      {/* 当前效果描述 */}
      <div className="text-sm text-surface-400 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1">
          <span>🍂</span> 
          <span>{fallStyles.find(s => s.id === fallStyle)?.description}</span>
        </span>
        <span className="text-surface-600">·</span>
        <span className="flex items-center gap-1">
          <span>📍</span>
          <span>{layoutModes.find(m => m.id === layoutMode)?.name}</span>
        </span>
        <span className="text-surface-600">·</span>
        <span className="flex items-center gap-1">
          <span>🔊</span>
          <span>{soundTypes.find(s => s.id === soundType)?.name}</span>
        </span>
      </div>

      {/* 预览区域 */}
      <div 
        className="relative h-72 bg-gradient-to-b from-surface-900 via-surface-900/95 to-surface-800 rounded-xl border border-surface-700 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => setKey(k => k + 1)}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-purple-500/10 to-transparent" />
        
        {/* 位置指示线（分散模式下显示） */}
        {layoutMode !== 'line' && (
          <>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-surface-700/30" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-surface-700/30" />
          </>
        )}
        
        {/* 飘落的文字 */}
        <motion.div
          key={key}
          className={`relative ${layoutMode === 'line' ? 'flex gap-3' : ''}`}
          style={{
            width: layoutMode === 'line' ? 'auto' : '100%',
            height: layoutMode === 'line' ? 'auto' : '100%',
          }}
          initial="hidden"
          animate={isPlaying ? "visible" : "hidden"}
        >
          {text.split('').map((char, index) => {
            const layout = getCharLayout(index)
            return (
              <motion.span
                key={`${char}-${index}-${key}`}
                custom={index}
                variants={getCharAnimation(index)}
                className="text-6xl font-black"
                style={{
                  display: 'inline-block',
                  position: layoutMode === 'line' ? 'relative' : 'absolute',
                  left: layoutMode === 'line' ? 'auto' : '50%',
                  top: layoutMode === 'line' ? 'auto' : '50%',
                  marginLeft: layoutMode === 'line' ? 0 : `${layout.x}%`,
                  marginTop: layoutMode === 'line' ? 0 : `${layout.y}%`,
                  transform: layoutMode === 'line' ? 'none' : 'translate(-50%, -50%)',
                  background: 'linear-gradient(180deg, #FFD700 0%, #FF6B00 50%, #FF4444 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                }}
              >
                {char}
              </motion.span>
            )
          })}
        </motion.div>

        {/* 落地线 */}
        <div className="absolute bottom-12 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* 提示 */}
        <div className="absolute bottom-4 text-xs text-surface-500">
          点击预览区域重新播放
        </div>
      </div>

      {/* 文字输入 */}
      <div className="flex gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要飘落的文字..."
          className="flex-1 px-4 py-2 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 focus:outline-none focus:border-amber-400"
          maxLength={10}
        />
        <Button
          variant="secondary"
          onClick={() => setKey(k => k + 1)}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          重播
        </Button>
      </div>

      {/* 代码示例 */}
      <div className="p-4 bg-surface-950 rounded-xl border border-surface-700">
        <div className="text-xs text-surface-400 mb-2">
          {layoutMode === 'scatter' ? '分散位置飘落代码' : '逐字飘落 + 音效代码'}
        </div>
        <pre className="text-sm text-amber-400/80 font-mono overflow-x-auto whitespace-pre-wrap">
{layoutMode === 'scatter' || layoutMode === 'triangle' ? 
`// 📍 分散位置配置（3个字专用）
const positions = [
  { x: -25, y: -15, rotate: -8, scale: 1.1 },  // 我 - 左上
  { x: 30, y: -10, rotate: 12, scale: 1.2 },   // 爱 - 右上（稍大强调）
  { x: 5, y: 25, rotate: -5, scale: 1 },       // 了 - 下中
]

// 🍂 分散飘落动画
{text.split('').map((char, index) => {
  const pos = positions[index]
  return (
    <motion.span
      key={index}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: \`\${pos.x}%\`,
        marginTop: \`\${pos.y}%\`,
      }}
      initial={{ opacity: 0, y: -200, scale: 0.4 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: pos.scale,
        rotate: pos.rotate,
      }}
      transition={{ 
        duration: 1,
        delay: index * 0.25,  // 逐字延迟
      }}
    />
  )
})}` :
`// 🔊 Web Audio API 生成音效
const playSound = (index: number) => {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  // 根据索引调整音高，形成音阶
  const freq = 400 + index * 80
  osc.frequency.setValueAtTime(freq + 200, ctx.currentTime)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
  
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.3)
}

// 🍂 逐字飘落动画
{text.split('').map((char, index) => (
  <motion.span
    key={index}
    initial={{ opacity: 0, y: -150 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.25 }}
  />
))}`}
        </pre>
      </div>
    </div>
  )
}

// ============================================
// 文字动效演示组件
// ============================================

const TextAnimationDemo = () => {
  const [animationType, setAnimationType] = useState<string>('fall')
  const [key, setKey] = useState(0)
  const text = "综艺花字效果"

  const animationTypes = [
    { id: 'fall', name: '🍂 逐字飘落', icon: '🍂' },
    { id: 'fall-swing', name: '🍃 摇摆飘落', icon: '🍃' },
    { id: 'fall-spiral', name: '🌀 螺旋飘落', icon: '🌀' },
    { id: 'fall-bounce', name: '⬇️ 弹跳落地', icon: '⬇️' },
    { id: 'stagger', name: '逐字入场', icon: '📝' },
    { id: 'bounce', name: '弹跳入场', icon: '⬆️' },
    { id: 'scale', name: '缩放', icon: '🔍' },
    { id: 'wave', name: '波浪效果', icon: '🌊' },
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animationType.startsWith('fall') ? 0 : 0.05, // 飘落动画使用 custom delay
        delayChildren: 0.1,
      },
    },
  }

  const getCharVariants = (): Variants => {
    switch (animationType) {
      // ========== 飘落系列动画 ==========
      case 'fall':
        // 简洁的逐字飘落，像树叶一样轻盈落下
        return {
          hidden: { 
            opacity: 0, 
            y: -120,
            scale: 0.5,
          },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.8,
              delay: i * 0.15, // 逐字延迟
              ease: [0.34, 1.56, 0.64, 1], // 弹性缓动
            },
          }),
        }
      case 'fall-swing':
        // 摇摆飘落，像落叶一样左右摇摆
        return {
          hidden: { 
            opacity: 0, 
            y: -150,
            x: -30,
            rotate: -20,
          },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            x: [i % 2 === 0 ? -30 : 30, i % 2 === 0 ? 20 : -20, i % 2 === 0 ? -10 : 10, 0],
            rotate: [i % 2 === 0 ? -20 : 20, i % 2 === 0 ? 15 : -15, i % 2 === 0 ? -8 : 8, 0],
            transition: {
              duration: 1.2,
              delay: i * 0.2,
              ease: 'easeOut',
            },
          }),
        }
      case 'fall-spiral':
        // 螺旋飘落，旋转着落下
        return {
          hidden: { 
            opacity: 0, 
            y: -180,
            rotate: -360,
            scale: 0.3,
          },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            rotate: 0,
            scale: [0.3, 1.2, 0.9, 1],
            transition: {
              duration: 1,
              delay: i * 0.18,
              ease: [0.22, 1, 0.36, 1],
            },
          }),
        }
      case 'fall-bounce':
        // 弹跳落地，落下后弹跳几下
        return {
          hidden: { 
            opacity: 0, 
            y: -200,
            scale: 0.8,
          },
          visible: (i: number) => ({
            opacity: 1,
            y: [null, 20, -15, 8, -4, 0], // 弹跳效果
            scale: [0.8, 1.1, 0.95, 1.05, 0.98, 1],
            transition: {
              duration: 1,
              delay: i * 0.12,
              times: [0, 0.4, 0.55, 0.7, 0.85, 1],
              ease: 'easeOut',
            },
          }),
        }
      // ========== 原有动画 ==========
      case 'stagger':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 500, damping: 20 },
          },
        }
      case 'bounce':
        return {
          hidden: { opacity: 0, y: -100, scale: 0 },
          visible: {
            opacity: 1,
            y: 0,
            scale: [0, 1.3, 0.9, 1.1, 1],
            transition: { type: 'spring', stiffness: 400, damping: 15 },
          },
        }
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1,
            scale: [0, 1.5, 0.8, 1.2, 1],
            transition: { duration: 0.6 },
          },
        }
      case 'wave':
        return {
          hidden: { opacity: 0, y: 0 },
          visible: (i: number) => ({
            opacity: 1,
            y: [0, -20, 0],
            transition: {
              y: {
                repeat: Infinity,
                duration: 1,
                delay: i * 0.1,
              },
            },
          }),
        }
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {animationTypes.map((anim) => (
          <button
            key={anim.id}
            onClick={() => {
              setAnimationType(anim.id)
              setKey(k => k + 1)
            }}
            className={`
              px-4 py-2 rounded-lg border text-sm font-medium transition-all
              ${animationType === anim.id
                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
              }
            `}
          >
            <span className="mr-2">{anim.icon}</span>
            {anim.name}
          </button>
        ))}
      </div>

      <div className="relative h-48 bg-surface-900/80 rounded-xl border border-surface-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <motion.div
          key={key}
          className="flex"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {text.split('').map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              custom={i}
              variants={getCharVariants()}
              className="text-5xl font-bold"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(180deg, #FFD700 0%, #FF6B00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255,107,0,0.5)',
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setKey(k => k + 1)}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          重播动画
        </Button>
      </div>
    </div>
  )
}

// ============================================
// 情绪预设展示组件
// ============================================

const PresetShowcase = () => {
  const [selectedPreset, setSelectedPreset] = useState(EMOTION_TEXT_PRESETS[0].id)
  const [previewText, setPreviewText] = useState('太棒了！')
  const [key, setKey] = useState(0)

  // 分组预设
  const groupedPresets = useMemo(() => {
    const groups: Record<string, typeof EMOTION_TEXT_PRESETS> = {}
    EMOTION_TEXT_PRESETS.forEach(preset => {
      if (!groups[preset.emotion]) {
        groups[preset.emotion] = []
      }
      groups[preset.emotion].push(preset)
    })
    return groups
  }, [])

  const emotionLabels: Record<EmotionType, { label: string; icon: string }> = {
    happy: { label: '开心', icon: '😄' },
    excited: { label: '激动', icon: '🔥' },
    surprised: { label: '惊讶', icon: '😱' },
    love: { label: '心动', icon: '❤️' },
    angry: { label: '生气', icon: '😤' },
    sad: { label: '难过', icon: '😢' },
    scared: { label: '害怕', icon: '😨' },
    confused: { label: '困惑', icon: '🤔' },
    cool: { label: '酷炫', icon: '😎' },
    funny: { label: '搞笑', icon: '🤣' },
  }

  return (
    <div className="space-y-6">
      {/* 预览区域 */}
      <div 
        className="relative h-64 bg-surface-900/80 rounded-xl border border-surface-700 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => setKey(k => k + 1)}
      >
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <EmotionTextEffect
          key={key}
          text={previewText}
          preset={selectedPreset}
          scale={0.7}
        />
        
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-xs text-surface-400 bg-surface-900/80 px-3 py-1 rounded-full">
            点击预览区域重新播放
          </span>
        </div>
      </div>

      {/* 文字输入 */}
      <div className="flex gap-4">
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="输入预览文字..."
          className="flex-1 px-4 py-2 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 focus:outline-none focus:border-amber-400"
        />
        <Button
          variant="secondary"
          onClick={() => setKey(k => k + 1)}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          重播
        </Button>
      </div>

      {/* 预设列表 */}
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {Object.entries(groupedPresets).map(([emotion, presets]) => (
          <div key={emotion}>
            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-surface-950 py-1">
              <span>{emotionLabels[emotion as EmotionType]?.icon}</span>
              <span className="text-sm font-medium text-surface-300">
                {emotionLabels[emotion as EmotionType]?.label}
              </span>
              <span className="text-xs text-surface-500">({presets.length})</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {presets.slice(0, 6).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset.id)
                    setKey(k => k + 1)
                  }}
                  className={`
                    p-3 rounded-lg border text-left transition-all
                    ${selectedPreset === preset.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
                    }
                  `}
                >
                  <div className="text-sm font-medium truncate">{preset.name}</div>
                  <div className="text-xs text-surface-400 truncate mt-0.5">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// 主页面组件
// ============================================

export default function VarietyEffectsTestPage() {
  const [activeSection, setActiveSection] = useState<DemoSection>('falling')
  const [expandedSection, setExpandedSection] = useState<DemoSection | null>(null)

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 glass-strong border-b border-surface-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">综艺特效调研</h1>
              <p className="text-xs text-surface-400">《一见你就笑》风格 · 底层技术解析</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href="/test/fancy-text" 
              className="px-4 py-2 text-sm text-surface-300 hover:text-white transition-colors"
            >
              花字工坊 →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 技术概览卡片 */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            综艺花字特效技术架构
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DEMO_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  p-4 rounded-xl border text-center transition-all
                  ${activeSection === section.id
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-surface-600 hover:border-surface-500 bg-surface-800/50'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center
                  ${activeSection === section.id ? 'bg-amber-400/20 text-amber-400' : 'bg-surface-700 text-surface-400'}
                `}>
                  {section.icon}
                </div>
                <div className="text-sm font-medium">{section.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 当前选中的演示区域 */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                {DEMO_SECTIONS.find(s => s.id === activeSection)?.icon}
                {DEMO_SECTIONS.find(s => s.id === activeSection)?.name}
              </h3>
              <p className="text-sm text-surface-400 mt-1">
                {DEMO_SECTIONS.find(s => s.id === activeSection)?.description}
              </p>
            </div>
          </div>

          {/* 演示内容 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'falling' && <FallingTextDemo />}
              {activeSection === 'presets' && <PresetShowcase />}
              {activeSection === 'text-animation' && <TextAnimationDemo />}
              {activeSection === 'particles' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(['star', 'heart', 'fire', 'sparkle', 'confetti', 'bubble'] as const).map((type) => (
                      <div
                        key={type}
                        className="relative h-32 bg-surface-800/50 rounded-xl border border-surface-700 overflow-hidden"
                      >
                        <ParticleDemo 
                          type={type} 
                          color={
                            type === 'heart' ? '#FF69B4' :
                            type === 'fire' ? '#FF6B35' :
                            type === 'bubble' ? '#00CEC9' :
                            '#FFD700'
                          }
                          count={15}
                        />
                        <div className="absolute bottom-2 left-2 text-xs text-surface-400 bg-surface-900/80 px-2 py-1 rounded">
                          {type === 'star' ? '⭐ 星星' :
                           type === 'heart' ? '❤️ 爱心' :
                           type === 'fire' ? '🔥 火焰' :
                           type === 'sparkle' ? '✨ 闪光' :
                           type === 'confetti' ? '🎊 纸屑' :
                           '🫧 气泡'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-surface-950 rounded-xl border border-surface-700">
                    <div className="text-xs text-surface-400 mb-2">粒子系统实现原理</div>
                    <pre className="text-sm text-amber-400/80 font-mono overflow-x-auto">
{`// 使用 Framer Motion 实现粒子系统
const particles = Array.from({ length: 30 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 8 + Math.random() * 16,
  delay: Math.random() * 2,
}))

<motion.div
  animate={{
    scale: [0, 1.2, 1, 0],
    opacity: [0, 1, 1, 0],
    y: [0, -30, 0],
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    delay: particle.delay,
  }}
/>`}
                    </pre>
                  </div>
                </div>
              )}
              {activeSection === 'pip' && <PictureInPictureDemo />}
              {activeSection === 'mask' && <MaskDemo />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 p-6 rounded-2xl bg-surface-800/50 border border-surface-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            如何将样式添加到系统预设？
          </h3>
          <div className="space-y-4 text-sm text-surface-300">
            <p>
              <span className="text-amber-400 font-medium">方式一：</span> 
              访问 <a href="/test/fancy-text" className="text-amber-400 hover:underline">/test/fancy-text</a> 花字工坊，
              设计好样式后点击"导出代码"，将代码发给我，我会帮你添加到系统预设中。
            </p>
            <p>
              <span className="text-amber-400 font-medium">方式二：</span> 
              直接告诉我你想要的效果描述，例如："我想要一个红色火焰效果的花字，带有爆炸粒子，文字从上方砸入屏幕"，
              我会帮你生成对应的预设配置。
            </p>
            <div className="p-4 bg-surface-900/80 rounded-xl border border-surface-600 mt-4">
              <div className="text-xs text-surface-400 mb-2">预设配置示例</div>
              <pre className="text-xs text-amber-400/80 font-mono overflow-x-auto">
{`{
  id: 'custom-effect',
  name: '🔥 我的特效',
  emotion: 'excited',
  description: '自定义的炸裂效果',
  layout: { randomRotation: { min: -6, max: 6 }, ... },
  text: { fontFamily: 'Noto Sans SC', fontWeight: 900, fontSize: 88, ... },
  decoration: { type: 'particle', items: ['💥', '🔥', '⚡'], ... },
  animation: { enter: 'variety-boom-in', loop: 'intense-shake', duration: 300 },
}`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

