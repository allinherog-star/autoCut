/**
 * 系统表情贴纸预设库
 * 
 * 综艺节目风格的动态表情贴纸
 * 按情绪/场景分类，支持动画效果
 */

// ============================================
// 类型定义
// ============================================

export type StickerCategory = 
  | 'emotion'     // 情绪表情
  | 'reaction'    // 反应表情
  | 'action'      // 动作表情
  | 'decoration'  // 装饰贴纸
  | 'text'        // 文字贴纸
  | 'popular'     // 热门表情

export interface StickerPreset {
  id: string
  name: string
  category: StickerCategory
  description: string
  // 表情内容（emoji 或 SVG 路径）
  content: {
    type: 'emoji' | 'svg' | 'image'
    value: string           // emoji 字符或 SVG 路径
    size: number            // 默认尺寸 (px)
  }
  // 样式配置
  style: {
    backgroundColor?: string
    borderRadius?: number   // 圆角 (px)
    shadow?: string         // 阴影
    glow?: string           // 发光效果
    scale?: number          // 缩放
  }
  // 动画配置
  animation?: {
    type: 'bounce' | 'shake' | 'rotate' | 'pulse' | 'float' | 'zoom' | 'swing' | 'wobble' | 'heartbeat' | 'flash' | 'none'
    duration: number        // 动画时长 (ms)
    loop: boolean           // 是否循环
    delay?: number          // 延迟 (ms)
  }
  // 标签（用于搜索）
  tags: string[]
}

// ============================================
// 分类配置
// ============================================

export const STICKER_CATEGORY_CONFIG: Record<StickerCategory, { 
  label: string
  labelEn: string
  icon: string
  color: string
  bgColor: string
}> = {
  emotion: {
    label: '情绪表情',
    labelEn: 'Emotion',
    icon: '😊',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/15',
  },
  reaction: {
    label: '反应表情',
    labelEn: 'Reaction',
    icon: '😱',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/15',
  },
  action: {
    label: '动作表情',
    labelEn: 'Action',
    icon: '👋',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/15',
  },
  decoration: {
    label: '装饰贴纸',
    labelEn: 'Decoration',
    icon: '✨',
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/15',
  },
  text: {
    label: '文字贴纸',
    labelEn: 'Text',
    icon: '💬',
    color: 'text-green-400',
    bgColor: 'bg-green-400/15',
  },
  popular: {
    label: '热门表情',
    labelEn: 'Popular',
    icon: '🔥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/15',
  },
}

// ============================================
// 动画关键帧 CSS
// ============================================

export const STICKER_ANIMATIONS_CSS = `
@keyframes sticker-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.1); }
}

@keyframes sticker-shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(-5px) rotate(-5deg); }
  75% { transform: translateX(5px) rotate(5deg); }
}

@keyframes sticker-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sticker-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.9; }
}

@keyframes sticker-float {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
}

@keyframes sticker-zoom {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

@keyframes sticker-swing {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

@keyframes sticker-wobble {
  0%, 100% { transform: translateX(0) rotate(0); }
  15% { transform: translateX(-10px) rotate(-5deg); }
  30% { transform: translateX(8px) rotate(3deg); }
  45% { transform: translateX(-6px) rotate(-3deg); }
  60% { transform: translateX(4px) rotate(2deg); }
  75% { transform: translateX(-2px) rotate(-1deg); }
}

@keyframes sticker-heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

@keyframes sticker-flash {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.5; }
}
`

// ============================================
// 预设表情库
// ============================================

export const STICKER_PRESETS: StickerPreset[] = [
  // ============================================
  // 🔥 热门表情系列
  // ============================================
  {
    id: 'popular-laugh',
    name: '笑死了',
    category: 'popular',
    description: '爆笑时刻必备',
    content: { type: 'emoji', value: '🤣', size: 80 },
    style: { glow: '0 0 20px rgba(255,215,0,0.6)' },
    animation: { type: 'shake', duration: 500, loop: true },
    tags: ['笑', '爆笑', '搞笑', '哈哈'],
  },
  {
    id: 'popular-fire',
    name: '太火了',
    category: 'popular',
    description: '热度爆表',
    content: { type: 'emoji', value: '🔥', size: 80 },
    style: { glow: '0 0 30px rgba(255,100,0,0.8)' },
    animation: { type: 'pulse', duration: 600, loop: true },
    tags: ['火', '热门', '爆款', '厉害'],
  },
  {
    id: 'popular-love',
    name: '爱了爱了',
    category: 'popular',
    description: '心动瞬间',
    content: { type: 'emoji', value: '😍', size: 80 },
    style: { glow: '0 0 25px rgba(255,105,180,0.7)' },
    animation: { type: 'heartbeat', duration: 1000, loop: true },
    tags: ['爱', '心动', '喜欢', '可爱'],
  },
  {
    id: 'popular-shocked',
    name: '震惊',
    category: 'popular',
    description: '惊呆了',
    content: { type: 'emoji', value: '😱', size: 80 },
    style: { glow: '0 0 25px rgba(155,93,229,0.6)' },
    animation: { type: 'wobble', duration: 800, loop: false },
    tags: ['震惊', '惊讶', '没想到', 'WTF'],
  },
  {
    id: 'popular-nb',
    name: '666',
    category: 'popular',
    description: '真的牛',
    content: { type: 'emoji', value: '👍', size: 80 },
    style: { glow: '0 0 20px rgba(255,200,0,0.6)' },
    animation: { type: 'bounce', duration: 600, loop: true },
    tags: ['666', '牛', '厉害', '赞'],
  },
  {
    id: 'popular-clap',
    name: '鼓掌',
    category: 'popular',
    description: '精彩绝伦',
    content: { type: 'emoji', value: '👏', size: 80 },
    style: { glow: '0 0 20px rgba(255,220,100,0.5)' },
    animation: { type: 'pulse', duration: 400, loop: true },
    tags: ['鼓掌', '精彩', '支持', '好'],
  },
  {
    id: 'popular-cool',
    name: '酷毙了',
    category: 'popular',
    description: '太酷了',
    content: { type: 'emoji', value: '😎', size: 80 },
    style: { glow: '0 0 20px rgba(0,206,201,0.6)' },
    animation: { type: 'swing', duration: 1000, loop: true },
    tags: ['酷', '帅', '厉害', '牛'],
  },
  {
    id: 'popular-star',
    name: '闪亮登场',
    category: 'popular',
    description: '全场焦点',
    content: { type: 'emoji', value: '🌟', size: 80 },
    style: { glow: '0 0 30px rgba(255,215,0,0.8)' },
    animation: { type: 'flash', duration: 800, loop: true },
    tags: ['闪亮', '明星', '登场', '亮眼'],
  },

  // ============================================
  // 😊 情绪表情系列
  // ============================================
  {
    id: 'emotion-happy',
    name: '开心',
    category: 'emotion',
    description: '快乐每一天',
    content: { type: 'emoji', value: '😊', size: 72 },
    style: { glow: '0 0 15px rgba(255,215,0,0.4)' },
    animation: { type: 'bounce', duration: 800, loop: true },
    tags: ['开心', '快乐', '高兴', '幸福'],
  },
  {
    id: 'emotion-excited',
    name: '兴奋',
    category: 'emotion',
    description: '太激动了',
    content: { type: 'emoji', value: '🤩', size: 72 },
    style: { glow: '0 0 20px rgba(255,200,0,0.6)' },
    animation: { type: 'pulse', duration: 500, loop: true },
    tags: ['兴奋', '激动', '期待', '太棒了'],
  },
  {
    id: 'emotion-angry',
    name: '生气',
    category: 'emotion',
    description: '气死了',
    content: { type: 'emoji', value: '😤', size: 72 },
    style: { glow: '0 0 20px rgba(255,71,87,0.6)' },
    animation: { type: 'shake', duration: 300, loop: true },
    tags: ['生气', '愤怒', '不爽', '烦'],
  },
  {
    id: 'emotion-cry',
    name: '哭了',
    category: 'emotion',
    description: '好难过',
    content: { type: 'emoji', value: '😭', size: 72 },
    style: { glow: '0 0 15px rgba(116,185,255,0.5)' },
    animation: { type: 'shake', duration: 600, loop: true },
    tags: ['哭', '难过', '伤心', '悲伤'],
  },
  {
    id: 'emotion-shy',
    name: '害羞',
    category: 'emotion',
    description: '有点不好意思',
    content: { type: 'emoji', value: '🥺', size: 72 },
    style: { glow: '0 0 15px rgba(255,182,193,0.5)' },
    animation: { type: 'float', duration: 1200, loop: true },
    tags: ['害羞', '可怜', '求求了', '撒娇'],
  },
  {
    id: 'emotion-confused',
    name: '困惑',
    category: 'emotion',
    description: '看不懂',
    content: { type: 'emoji', value: '🤔', size: 72 },
    style: { glow: '0 0 15px rgba(253,203,110,0.5)' },
    animation: { type: 'swing', duration: 1500, loop: true },
    tags: ['困惑', '疑惑', '不懂', '想不通'],
  },
  {
    id: 'emotion-sleepy',
    name: '好困',
    category: 'emotion',
    description: '困死了',
    content: { type: 'emoji', value: '😴', size: 72 },
    style: { glow: '0 0 15px rgba(162,155,254,0.4)' },
    animation: { type: 'float', duration: 2000, loop: true },
    tags: ['困', '睡觉', '累', '休息'],
  },
  {
    id: 'emotion-scared',
    name: '害怕',
    category: 'emotion',
    description: '好可怕',
    content: { type: 'emoji', value: '😨', size: 72 },
    style: { glow: '0 0 20px rgba(99,110,114,0.5)' },
    animation: { type: 'shake', duration: 200, loop: true },
    tags: ['害怕', '恐惧', '可怕', '吓人'],
  },
  {
    id: 'emotion-sick',
    name: '不舒服',
    category: 'emotion',
    description: '身体不适',
    content: { type: 'emoji', value: '🤢', size: 72 },
    style: { glow: '0 0 15px rgba(85,239,196,0.4)' },
    animation: { type: 'wobble', duration: 1000, loop: true },
    tags: ['不舒服', '难受', '恶心', '不行了'],
  },
  {
    id: 'emotion-cold',
    name: '好冷',
    category: 'emotion',
    description: '冻死了',
    content: { type: 'emoji', value: '🥶', size: 72 },
    style: { glow: '0 0 20px rgba(116,185,255,0.6)' },
    animation: { type: 'shake', duration: 300, loop: true },
    tags: ['冷', '冻', '冰', '寒'],
  },
  {
    id: 'emotion-hot',
    name: '好热',
    category: 'emotion',
    description: '热死了',
    content: { type: 'emoji', value: '🥵', size: 72 },
    style: { glow: '0 0 20px rgba(255,71,87,0.6)' },
    animation: { type: 'pulse', duration: 600, loop: true },
    tags: ['热', '烫', '夏天', '出汗'],
  },
  {
    id: 'emotion-relief',
    name: '松口气',
    category: 'emotion',
    description: '终于放松了',
    content: { type: 'emoji', value: '😮‍💨', size: 72 },
    style: { glow: '0 0 15px rgba(129,236,236,0.4)' },
    animation: { type: 'float', duration: 1500, loop: true },
    tags: ['松口气', '放松', '终于', '完成'],
  },

  // ============================================
  // 😱 反应表情系列
  // ============================================
  {
    id: 'reaction-wow',
    name: '哇塞',
    category: 'reaction',
    description: '大开眼界',
    content: { type: 'emoji', value: '😮', size: 72 },
    style: { glow: '0 0 20px rgba(155,93,229,0.5)' },
    animation: { type: 'zoom', duration: 600, loop: false },
    tags: ['哇', '哇塞', '厉害', '震惊'],
  },
  {
    id: 'reaction-facepalm',
    name: '无语',
    category: 'reaction',
    description: '无话可说',
    content: { type: 'emoji', value: '🤦', size: 72 },
    style: { glow: '0 0 15px rgba(253,203,110,0.4)' },
    animation: { type: 'shake', duration: 1000, loop: false },
    tags: ['无语', '服了', '无话可说', '算了'],
  },
  {
    id: 'reaction-eyeroll',
    name: '翻白眼',
    category: 'reaction',
    description: '懒得理你',
    content: { type: 'emoji', value: '🙄', size: 72 },
    style: { glow: '0 0 15px rgba(178,190,195,0.4)' },
    animation: { type: 'rotate', duration: 2000, loop: false },
    tags: ['翻白眼', '无语', '懒得理', '随便'],
  },
  {
    id: 'reaction-mindblown',
    name: '脑子炸了',
    category: 'reaction',
    description: '信息量太大',
    content: { type: 'emoji', value: '🤯', size: 72 },
    style: { glow: '0 0 25px rgba(255,107,107,0.6)' },
    animation: { type: 'wobble', duration: 500, loop: true },
    tags: ['炸了', '爆炸', '信息量', '太多'],
  },
  {
    id: 'reaction-shush',
    name: '嘘',
    category: 'reaction',
    description: '安静点',
    content: { type: 'emoji', value: '🤫', size: 72 },
    style: { glow: '0 0 15px rgba(45,52,54,0.4)' },
    animation: { type: 'pulse', duration: 1000, loop: true },
    tags: ['嘘', '安静', '别说', '秘密'],
  },
  {
    id: 'reaction-thinking',
    name: '让我想想',
    category: 'reaction',
    description: '思考中...',
    content: { type: 'emoji', value: '🧐', size: 72 },
    style: { glow: '0 0 15px rgba(253,203,110,0.5)' },
    animation: { type: 'swing', duration: 2000, loop: true },
    tags: ['想', '思考', '分析', '研究'],
  },
  {
    id: 'reaction-suspicious',
    name: '怀疑',
    category: 'reaction',
    description: '真的假的？',
    content: { type: 'emoji', value: '🤨', size: 72 },
    style: { glow: '0 0 15px rgba(253,203,110,0.4)' },
    animation: { type: 'swing', duration: 1500, loop: true },
    tags: ['怀疑', '不信', '真的吗', '假的吧'],
  },
  {
    id: 'reaction-money',
    name: '有钱了',
    category: 'reaction',
    description: '发财啦',
    content: { type: 'emoji', value: '🤑', size: 72 },
    style: { glow: '0 0 20px rgba(85,239,196,0.6)' },
    animation: { type: 'bounce', duration: 600, loop: true },
    tags: ['钱', '发财', '有钱', '暴富'],
  },
  {
    id: 'reaction-vomit',
    name: '吐了',
    category: 'reaction',
    description: '受不了',
    content: { type: 'emoji', value: '🤮', size: 72 },
    style: { glow: '0 0 15px rgba(85,239,196,0.5)' },
    animation: { type: 'shake', duration: 400, loop: true },
    tags: ['吐', '恶心', '受不了', '太离谱'],
  },
  {
    id: 'reaction-party',
    name: '派对脸',
    category: 'reaction',
    description: '狂欢时刻',
    content: { type: 'emoji', value: '🥳', size: 72 },
    style: { glow: '0 0 25px rgba(255,200,0,0.6)' },
    animation: { type: 'bounce', duration: 500, loop: true },
    tags: ['派对', '庆祝', '狂欢', '开心'],
  },

  // ============================================
  // 👋 动作表情系列
  // ============================================
  {
    id: 'action-wave',
    name: '打招呼',
    category: 'action',
    description: '嗨~',
    content: { type: 'emoji', value: '👋', size: 72 },
    style: { glow: '0 0 15px rgba(255,200,100,0.5)' },
    animation: { type: 'swing', duration: 500, loop: true },
    tags: ['招呼', '嗨', '你好', 'hi'],
  },
  {
    id: 'action-pray',
    name: '求求了',
    category: 'action',
    description: '拜托拜托',
    content: { type: 'emoji', value: '🙏', size: 72 },
    style: { glow: '0 0 15px rgba(255,200,100,0.5)' },
    animation: { type: 'pulse', duration: 800, loop: true },
    tags: ['求', '拜托', '请', '跪求'],
  },
  {
    id: 'action-ok',
    name: 'OK',
    category: 'action',
    description: '没问题',
    content: { type: 'emoji', value: '👌', size: 72 },
    style: { glow: '0 0 15px rgba(85,239,196,0.5)' },
    animation: { type: 'bounce', duration: 700, loop: false },
    tags: ['ok', '好的', '没问题', '可以'],
  },
  {
    id: 'action-peace',
    name: '耶',
    category: 'action',
    description: '胜利✌️',
    content: { type: 'emoji', value: '✌️', size: 72 },
    style: { glow: '0 0 15px rgba(255,200,0,0.5)' },
    animation: { type: 'bounce', duration: 600, loop: true },
    tags: ['耶', '胜利', '成功', 'yeah'],
  },
  {
    id: 'action-muscle',
    name: '加油',
    category: 'action',
    description: '力量满满',
    content: { type: 'emoji', value: '💪', size: 72 },
    style: { glow: '0 0 20px rgba(255,107,53,0.5)' },
    animation: { type: 'pulse', duration: 600, loop: true },
    tags: ['加油', '力量', '冲', '努力'],
  },
  {
    id: 'action-point',
    name: '就是你',
    category: 'action',
    description: '对就是你',
    content: { type: 'emoji', value: '👉', size: 72 },
    style: { glow: '0 0 15px rgba(255,100,100,0.5)' },
    animation: { type: 'bounce', duration: 500, loop: true },
    tags: ['指', '你', '就是', '对'],
  },
  {
    id: 'action-run',
    name: '跑了跑了',
    category: 'action',
    description: '溜了溜了',
    content: { type: 'emoji', value: '🏃', size: 72 },
    style: { glow: '0 0 15px rgba(116,185,255,0.5)' },
    animation: { type: 'bounce', duration: 300, loop: true },
    tags: ['跑', '溜', '闪', '撤'],
  },
  {
    id: 'action-dance',
    name: '跳舞',
    category: 'action',
    description: '嗨起来',
    content: { type: 'emoji', value: '💃', size: 72 },
    style: { glow: '0 0 20px rgba(255,105,180,0.5)' },
    animation: { type: 'swing', duration: 600, loop: true },
    tags: ['跳舞', '嗨', '舞蹈', '狂欢'],
  },
  {
    id: 'action-fist',
    name: '拳头',
    category: 'action',
    description: '准备战斗',
    content: { type: 'emoji', value: '✊', size: 72 },
    style: { glow: '0 0 20px rgba(255,71,87,0.5)' },
    animation: { type: 'shake', duration: 400, loop: true },
    tags: ['拳头', '战斗', '冲', '干'],
  },
  {
    id: 'action-rock',
    name: '摇滚',
    category: 'action',
    description: '燥起来',
    content: { type: 'emoji', value: '🤘', size: 72 },
    style: { glow: '0 0 20px rgba(155,93,229,0.6)' },
    animation: { type: 'shake', duration: 500, loop: true },
    tags: ['摇滚', '燥', '嗨', '酷'],
  },

  // ============================================
  // ✨ 装饰贴纸系列
  // ============================================
  {
    id: 'deco-sparkle',
    name: '闪闪',
    category: 'decoration',
    description: '闪闪发光',
    content: { type: 'emoji', value: '✨', size: 64 },
    style: { glow: '0 0 25px rgba(255,215,0,0.8)' },
    animation: { type: 'flash', duration: 600, loop: true },
    tags: ['闪', '亮', '闪闪', '漂亮'],
  },
  {
    id: 'deco-heart',
    name: '红心',
    category: 'decoration',
    description: '满满的爱',
    content: { type: 'emoji', value: '❤️', size: 64 },
    style: { glow: '0 0 20px rgba(255,71,87,0.7)' },
    animation: { type: 'heartbeat', duration: 1000, loop: true },
    tags: ['心', '爱', '喜欢', '红心'],
  },
  {
    id: 'deco-hearts',
    name: '双心',
    category: 'decoration',
    description: '心心相印',
    content: { type: 'emoji', value: '💕', size: 64 },
    style: { glow: '0 0 20px rgba(255,105,180,0.6)' },
    animation: { type: 'float', duration: 1200, loop: true },
    tags: ['心', '双心', '爱', '甜蜜'],
  },
  {
    id: 'deco-star',
    name: '星星',
    category: 'decoration',
    description: '闪亮之星',
    content: { type: 'emoji', value: '⭐', size: 64 },
    style: { glow: '0 0 25px rgba(255,215,0,0.8)' },
    animation: { type: 'rotate', duration: 3000, loop: true },
    tags: ['星星', '闪亮', '厉害', '好评'],
  },
  {
    id: 'deco-rainbow',
    name: '彩虹',
    category: 'decoration',
    description: '七彩缤纷',
    content: { type: 'emoji', value: '🌈', size: 64 },
    style: { glow: '0 0 20px rgba(255,100,100,0.4)' },
    animation: { type: 'float', duration: 2000, loop: true },
    tags: ['彩虹', '彩色', '漂亮', '梦幻'],
  },
  {
    id: 'deco-confetti',
    name: '彩带',
    category: 'decoration',
    description: '庆祝时刻',
    content: { type: 'emoji', value: '🎊', size: 64 },
    style: { glow: '0 0 20px rgba(255,200,0,0.5)' },
    animation: { type: 'bounce', duration: 800, loop: true },
    tags: ['彩带', '庆祝', '派对', '开心'],
  },
  {
    id: 'deco-balloon',
    name: '气球',
    category: 'decoration',
    description: '欢乐气氛',
    content: { type: 'emoji', value: '🎈', size: 64 },
    style: { glow: '0 0 15px rgba(255,71,87,0.4)' },
    animation: { type: 'float', duration: 1500, loop: true },
    tags: ['气球', '欢乐', '庆祝', '生日'],
  },
  {
    id: 'deco-crown',
    name: '皇冠',
    category: 'decoration',
    description: '王者风范',
    content: { type: 'emoji', value: '👑', size: 64 },
    style: { glow: '0 0 25px rgba(255,215,0,0.8)' },
    animation: { type: 'bounce', duration: 1000, loop: true },
    tags: ['皇冠', '王者', '厉害', '第一'],
  },
  {
    id: 'deco-diamond',
    name: '钻石',
    category: 'decoration',
    description: '闪耀夺目',
    content: { type: 'emoji', value: '💎', size: 64 },
    style: { glow: '0 0 30px rgba(0,206,201,0.8)' },
    animation: { type: 'flash', duration: 800, loop: true },
    tags: ['钻石', '闪亮', '贵重', '珍贵'],
  },
  {
    id: 'deco-explosion',
    name: '爆炸',
    category: 'decoration',
    description: '炸裂效果',
    content: { type: 'emoji', value: '💥', size: 64 },
    style: { glow: '0 0 30px rgba(255,107,53,0.8)' },
    animation: { type: 'zoom', duration: 400, loop: false },
    tags: ['爆炸', '炸', '冲击', '震撼'],
  },
  {
    id: 'deco-lightning',
    name: '闪电',
    category: 'decoration',
    description: '电光火石',
    content: { type: 'emoji', value: '⚡', size: 64 },
    style: { glow: '0 0 25px rgba(255,200,0,0.8)' },
    animation: { type: 'flash', duration: 300, loop: true },
    tags: ['闪电', '快', '电', '速度'],
  },
  {
    id: 'deco-fire-heart',
    name: '燃烧的心',
    category: 'decoration',
    description: '热情似火',
    content: { type: 'emoji', value: '❤️‍🔥', size: 64 },
    style: { glow: '0 0 25px rgba(255,71,87,0.7)' },
    animation: { type: 'pulse', duration: 600, loop: true },
    tags: ['心', '火', '热情', '爱'],
  },

  // ============================================
  // 💬 文字贴纸系列
  // ============================================
  {
    id: 'text-wow-cn',
    name: '哇哦',
    category: 'text',
    description: '惊叹不已',
    content: { type: 'emoji', value: '🗯️', size: 80 },
    style: { 
      backgroundColor: '#FFE66D',
      borderRadius: 16,
      shadow: '4px 4px 0 #000',
    },
    animation: { type: 'bounce', duration: 500, loop: false },
    tags: ['哇', '哇哦', '厉害', '震惊'],
  },
  {
    id: 'text-boom',
    name: 'BOOM',
    category: 'text',
    description: '爆炸来袭',
    content: { type: 'emoji', value: '💬', size: 80 },
    style: { 
      backgroundColor: '#FF6B6B',
      borderRadius: 16,
      shadow: '4px 4px 0 #000',
    },
    animation: { type: 'zoom', duration: 400, loop: false },
    tags: ['boom', '爆炸', '轰', '炸'],
  },
  {
    id: 'text-omg',
    name: 'OMG',
    category: 'text',
    description: '天呐',
    content: { type: 'emoji', value: '😵', size: 80 },
    style: { 
      backgroundColor: '#9B5DE5',
      borderRadius: 16,
      shadow: '4px 4px 0 #000',
    },
    animation: { type: 'shake', duration: 500, loop: true },
    tags: ['omg', '天呐', '我的天', '震惊'],
  },
  {
    id: 'text-nice',
    name: 'NICE',
    category: 'text',
    description: '太棒了',
    content: { type: 'emoji', value: '👍', size: 80 },
    style: { 
      backgroundColor: '#4ECDC4',
      borderRadius: 16,
      shadow: '4px 4px 0 #000',
    },
    animation: { type: 'bounce', duration: 600, loop: false },
    tags: ['nice', '好', '棒', '不错'],
  },
  {
    id: 'text-lol',
    name: 'LOL',
    category: 'text',
    description: '笑死了',
    content: { type: 'emoji', value: '😂', size: 80 },
    style: { 
      backgroundColor: '#FFD93D',
      borderRadius: 16,
      shadow: '4px 4px 0 #000',
    },
    animation: { type: 'shake', duration: 400, loop: true },
    tags: ['lol', '笑', '哈哈', '搞笑'],
  },
  {
    id: 'text-rip',
    name: 'RIP',
    category: 'text',
    description: '凉了凉了',
    content: { type: 'emoji', value: '💀', size: 80 },
    style: { 
      backgroundColor: '#636E72',
      borderRadius: 16,
      shadow: '4px 4px 0 #000',
    },
    animation: { type: 'wobble', duration: 800, loop: false },
    tags: ['rip', '凉了', '完了', '寄'],
  },
  {
    id: 'text-perfect',
    name: 'Perfect',
    category: 'text',
    description: '完美',
    content: { type: 'emoji', value: '💯', size: 80 },
    style: { 
      backgroundColor: '#00D2D3',
      borderRadius: 16,
      shadow: '4px 4px 0 #000',
    },
    animation: { type: 'bounce', duration: 600, loop: false },
    tags: ['perfect', '完美', '满分', '100'],
  },
  {
    id: 'text-help',
    name: 'HELP',
    category: 'text',
    description: '救命',
    content: { type: 'emoji', value: '🆘', size: 80 },
    style: { 
      glow: '0 0 20px rgba(255,71,87,0.6)',
    },
    animation: { type: 'flash', duration: 500, loop: true },
    tags: ['help', '救命', '帮忙', 'sos'],
  },

  // ============================================
  // 🐱 动物表情系列 - 作为热门补充
  // ============================================
  {
    id: 'animal-cat-love',
    name: '猫咪比心',
    category: 'popular',
    description: '猫咪爱你',
    content: { type: 'emoji', value: '😻', size: 72 },
    style: { glow: '0 0 20px rgba(255,105,180,0.6)' },
    animation: { type: 'heartbeat', duration: 1000, loop: true },
    tags: ['猫', '比心', '爱', '可爱'],
  },
  {
    id: 'animal-dog',
    name: '狗狗',
    category: 'popular',
    description: '汪汪汪',
    content: { type: 'emoji', value: '🐕', size: 72 },
    style: { glow: '0 0 15px rgba(255,200,100,0.5)' },
    animation: { type: 'bounce', duration: 600, loop: true },
    tags: ['狗', '汪', '可爱', '萌'],
  },
  {
    id: 'animal-monkey',
    name: '不看',
    category: 'reaction',
    description: '我不看',
    content: { type: 'emoji', value: '🙈', size: 72 },
    style: { glow: '0 0 15px rgba(210,180,140,0.5)' },
    animation: { type: 'shake', duration: 800, loop: true },
    tags: ['猴子', '不看', '害羞', '尴尬'],
  },
  {
    id: 'animal-panda',
    name: '熊猫',
    category: 'popular',
    description: '国宝来啦',
    content: { type: 'emoji', value: '🐼', size: 72 },
    style: { glow: '0 0 15px rgba(100,100,100,0.4)' },
    animation: { type: 'wobble', duration: 1000, loop: true },
    tags: ['熊猫', '国宝', '可爱', '萌'],
  },
  {
    id: 'animal-unicorn',
    name: '独角兽',
    category: 'decoration',
    description: '梦幻生物',
    content: { type: 'emoji', value: '🦄', size: 72 },
    style: { glow: '0 0 25px rgba(225,190,231,0.7)' },
    animation: { type: 'float', duration: 1500, loop: true },
    tags: ['独角兽', '梦幻', '神奇', '可爱'],
  },

  // ============================================
  // 🍕 食物表情系列
  // ============================================
  {
    id: 'food-pizza',
    name: '披萨',
    category: 'popular',
    description: '美食时刻',
    content: { type: 'emoji', value: '🍕', size: 72 },
    style: { glow: '0 0 15px rgba(255,200,100,0.5)' },
    animation: { type: 'wobble', duration: 1000, loop: true },
    tags: ['披萨', '美食', '好吃', '饿'],
  },
  {
    id: 'food-icecream',
    name: '冰淇淋',
    category: 'decoration',
    description: '甜蜜时刻',
    content: { type: 'emoji', value: '🍦', size: 72 },
    style: { glow: '0 0 15px rgba(255,182,193,0.5)' },
    animation: { type: 'float', duration: 1200, loop: true },
    tags: ['冰淇淋', '甜', '夏天', '美食'],
  },
  {
    id: 'food-cake',
    name: '蛋糕',
    category: 'decoration',
    description: '生日快乐',
    content: { type: 'emoji', value: '🎂', size: 72 },
    style: { glow: '0 0 20px rgba(255,200,100,0.6)' },
    animation: { type: 'bounce', duration: 800, loop: true },
    tags: ['蛋糕', '生日', '庆祝', '甜'],
  },

  // ============================================
  // 🎮 游戏/运动表情
  // ============================================
  {
    id: 'game-trophy',
    name: '冠军',
    category: 'decoration',
    description: '第一名',
    content: { type: 'emoji', value: '🏆', size: 72 },
    style: { glow: '0 0 25px rgba(255,215,0,0.8)' },
    animation: { type: 'bounce', duration: 700, loop: true },
    tags: ['冠军', '第一', '胜利', '奖杯'],
  },
  {
    id: 'game-medal',
    name: '金牌',
    category: 'decoration',
    description: '荣誉时刻',
    content: { type: 'emoji', value: '🥇', size: 72 },
    style: { glow: '0 0 25px rgba(255,215,0,0.8)' },
    animation: { type: 'swing', duration: 1000, loop: true },
    tags: ['金牌', '第一', '冠军', '荣誉'],
  },
  {
    id: 'game-rocket',
    name: '火箭',
    category: 'action',
    description: '冲冲冲',
    content: { type: 'emoji', value: '🚀', size: 72 },
    style: { glow: '0 0 20px rgba(255,107,53,0.6)' },
    animation: { type: 'bounce', duration: 500, loop: true },
    tags: ['火箭', '冲', '起飞', '速度'],
  },
  {
    id: 'game-target',
    name: '目标',
    category: 'action',
    description: '精准打击',
    content: { type: 'emoji', value: '🎯', size: 72 },
    style: { glow: '0 0 15px rgba(255,71,87,0.5)' },
    animation: { type: 'pulse', duration: 800, loop: true },
    tags: ['目标', '命中', '准确', '精准'],
  },
]

// ============================================
// 工具函数
// ============================================

/**
 * 根据分类获取表情列表
 */
export function getStickersByCategory(category: StickerCategory): StickerPreset[] {
  return STICKER_PRESETS.filter(sticker => sticker.category === category)
}

/**
 * 根据 ID 获取表情
 */
export function getStickerById(id: string): StickerPreset | undefined {
  return STICKER_PRESETS.find(sticker => sticker.id === id)
}

/**
 * 搜索表情
 */
export function searchStickers(keyword: string): StickerPreset[] {
  const lowerKeyword = keyword.toLowerCase()
  return STICKER_PRESETS.filter(sticker => 
    sticker.name.toLowerCase().includes(lowerKeyword) ||
    sticker.description.toLowerCase().includes(lowerKeyword) ||
    sticker.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

/**
 * 获取所有分类
 */
export function getAllCategories(): StickerCategory[] {
  return Object.keys(STICKER_CATEGORY_CONFIG) as StickerCategory[]
}

/**
 * 将表情预设转换为 CSS 样式
 */
export function stickerToCSS(sticker: StickerPreset, scale: number = 1): React.CSSProperties {
  const css: React.CSSProperties = {
    fontSize: `${sticker.content.size * scale}px`,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (sticker.style.backgroundColor) {
    css.backgroundColor = sticker.style.backgroundColor
    css.padding = `${8 * scale}px ${12 * scale}px`
  }

  if (sticker.style.borderRadius) {
    css.borderRadius = `${sticker.style.borderRadius * scale}px`
  }

  if (sticker.style.shadow) {
    css.boxShadow = sticker.style.shadow
  }

  if (sticker.style.glow) {
    css.filter = `drop-shadow(${sticker.style.glow})`
  }

  if (sticker.animation && sticker.animation.type !== 'none') {
    css.animation = `sticker-${sticker.animation.type} ${sticker.animation.duration}ms ${sticker.animation.loop ? 'infinite' : 'forwards'} ease-in-out`
    if (sticker.animation.delay) {
      css.animationDelay = `${sticker.animation.delay}ms`
    }
  }

  return css
}

/**
 * 获取动画 CSS 类名
 */
export function getStickerAnimationClass(sticker: StickerPreset): string {
  if (!sticker.animation || sticker.animation.type === 'none') {
    return ''
  }
  return `animate-sticker-${sticker.animation.type}`
}

