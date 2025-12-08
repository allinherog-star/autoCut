import { PrismaClient, CategoryDimension } from '@prisma/client'

const prisma = new PrismaClient()

// 情绪维度标签
const emotionTags = [
  { name: '开心', nameEn: 'happy', icon: '😄', color: '#FFD93D', description: '欢快、搞笑、轻松的内容' },
  { name: '感动', nameEn: 'touching', icon: '🥹', color: '#FF6B6B', description: '温暖、走心、催泪的内容' },
  { name: '治愈', nameEn: 'healing', icon: '🌿', color: '#6BCB77', description: '放松、舒适、解压的内容' },
  { name: '励志', nameEn: 'inspiring', icon: '💪', color: '#4D96FF', description: '热血、正能量、鼓舞人心' },
  { name: '紧张', nameEn: 'tense', icon: '😰', color: '#9B59B6', description: '悬疑、紧迫、刺激的内容' },
  { name: '震撼', nameEn: 'stunning', icon: '🤯', color: '#E74C3C', description: '惊艳、大片感、视觉冲击' },
  { name: '共鸣', nameEn: 'relatable', icon: '🤝', color: '#3498DB', description: '感同身受、真实、接地气' },
  { name: '反转', nameEn: 'twist', icon: '🔄', color: '#F39C12', description: '意外、神转折、出人意料' },
  { name: '可爱', nameEn: 'cute', icon: '🥰', color: '#FF85A2', description: '萌系、甜美、少女心' },
  { name: '酷炫', nameEn: 'cool', icon: '😎', color: '#2C3E50', description: '潮流、帅气、高级感' },
]

// 行业/垂类维度标签
const industryTags = [
  { name: '美食', nameEn: 'food', icon: '🍜', color: '#FF6B35' },
  { name: '旅游', nameEn: 'travel', icon: '✈️', color: '#4ECDC4' },
  { name: '知识', nameEn: 'knowledge', icon: '📚', color: '#45B7D1' },
  { name: '科技', nameEn: 'tech', icon: '💻', color: '#96CEB4' },
  { name: '美妆', nameEn: 'beauty', icon: '💄', color: '#DDA0DD' },
  { name: '穿搭', nameEn: 'fashion', icon: '👗', color: '#FFB6C1' },
  { name: '健身', nameEn: 'fitness', icon: '🏋️', color: '#98D8C8' },
  { name: '音乐', nameEn: 'music', icon: '🎵', color: '#9B59B6' },
  { name: '舞蹈', nameEn: 'dance', icon: '💃', color: '#E91E63' },
  { name: '游戏', nameEn: 'gaming', icon: '🎮', color: '#673AB7' },
  { name: '生活', nameEn: 'lifestyle', icon: '🏠', color: '#8BC34A' },
  { name: '职场', nameEn: 'career', icon: '💼', color: '#607D8B' },
  { name: '情感', nameEn: 'relationship', icon: '💕', color: '#E91E63' },
  { name: '宠物', nameEn: 'pets', icon: '🐱', color: '#FF9800' },
  { name: '母婴', nameEn: 'parenting', icon: '👶', color: '#FFCDD2' },
  { name: '汽车', nameEn: 'auto', icon: '🚗', color: '#37474F' },
  { name: '家居', nameEn: 'home', icon: '🛋️', color: '#795548' },
  { name: '三农', nameEn: 'agriculture', icon: '🌾', color: '#689F38' },
  { name: '剧情', nameEn: 'drama', icon: '🎬', color: '#F44336' },
  { name: '搞笑', nameEn: 'comedy', icon: '😂', color: '#FFEB3B' },
]

// 风格维度标签
const styleTags = [
  { name: '幽默', nameEn: 'humorous', icon: '😜', color: '#FFC107', description: '搞笑、段子、吐槽' },
  { name: '文艺', nameEn: 'artistic', icon: '🎨', color: '#9C27B0', description: '清新、小众、有格调' },
  { name: '专业', nameEn: 'professional', icon: '🎓', color: '#2196F3', description: '干货、硬核、有深度' },
  { name: '潮流', nameEn: 'trendy', icon: '🔥', color: '#FF5722', description: '时尚、流行、年轻化' },
  { name: '真实', nameEn: 'authentic', icon: '📷', color: '#4CAF50', description: '接地气、日常、真诚' },
  { name: '高级', nameEn: 'luxury', icon: '✨', color: '#9E9E9E', description: '质感、精致、高端' },
  { name: '复古', nameEn: 'retro', icon: '📻', color: '#795548', description: '怀旧、经典、年代感' },
  { name: '极简', nameEn: 'minimal', icon: '⬜', color: '#ECEFF1', description: '简洁、留白、克制' },
  { name: '热血', nameEn: 'passionate', icon: '🔥', color: '#D32F2F', description: '激情、燃、热烈' },
  { name: '温柔', nameEn: 'gentle', icon: '🌸', color: '#F8BBD9', description: '柔和、舒适、温馨' },
]

// 场景维度标签
const sceneTags = [
  { name: '开头Hook', nameEn: 'hook', icon: '🎣', color: '#F44336', description: '前3秒抓人眼球' },
  { name: '转场过渡', nameEn: 'transition', icon: '🔀', color: '#9C27B0', description: '画面切换衔接' },
  { name: '高潮爆点', nameEn: 'climax', icon: '💥', color: '#FF9800', description: '情绪最高点' },
  { name: '结尾收尾', nameEn: 'ending', icon: '🎬', color: '#4CAF50', description: '完美收官' },
  { name: '背景氛围', nameEn: 'ambient', icon: '🌅', color: '#03A9F4', description: '营造环境氛围' },
  { name: '产品展示', nameEn: 'product', icon: '📦', color: '#795548', description: '商品/产品特写' },
  { name: '人物出场', nameEn: 'intro', icon: '🙋', color: '#E91E63', description: '人物登场亮相' },
  { name: '知识讲解', nameEn: 'explain', icon: '💡', color: '#FFC107', description: '信息图解说明' },
  { name: '情绪渲染', nameEn: 'emotional', icon: '🎭', color: '#673AB7', description: '强化情感表达' },
  { name: '节奏卡点', nameEn: 'beat', icon: '🎵', color: '#00BCD4', description: '配合音乐节拍' },
]

// 平台适配标签
const platformTags = [
  { name: '抖音', nameEn: 'douyin', icon: '📱', color: '#000000', description: '适合抖音平台风格' },
  { name: 'B站', nameEn: 'bilibili', icon: '📺', color: '#00A1D6', description: '适合B站平台风格' },
  { name: '小红书', nameEn: 'xiaohongshu', icon: '📕', color: '#FE2C55', description: '适合小红书平台风格' },
  { name: '快手', nameEn: 'kuaishou', icon: '📷', color: '#FF6600', description: '适合快手平台风格' },
  { name: '视频号', nameEn: 'weixin', icon: '💬', color: '#07C160', description: '适合微信视频号风格' },
]

// 节奏/速度维度标签
const tempoTags = [
  { name: '快节奏', nameEn: 'fast', icon: '⚡', color: '#F44336', description: '快速剪辑、信息密度高' },
  { name: '中等', nameEn: 'medium', icon: '▶️', color: '#FF9800', description: '正常节奏、平衡' },
  { name: '慢节奏', nameEn: 'slow', icon: '🐢', color: '#4CAF50', description: '舒缓、沉浸、有呼吸感' },
  { name: '变速', nameEn: 'variable', icon: '🎢', color: '#9C27B0', description: '节奏变化、有起伏' },
]

// 氛围/调性维度标签
const moodTags = [
  { name: '阳光', nameEn: 'sunny', icon: '☀️', color: '#FFEB3B', description: '明亮、积极、活力' },
  { name: '暗黑', nameEn: 'dark', icon: '🌙', color: '#263238', description: '神秘、深沉、有质感' },
  { name: '清新', nameEn: 'fresh', icon: '🌿', color: '#81C784', description: '自然、干净、舒适' },
  { name: '梦幻', nameEn: 'dreamy', icon: '🦄', color: '#E1BEE7', description: '唯美、浪漫、童话感' },
  { name: '科技', nameEn: 'techy', icon: '🤖', color: '#00BCD4', description: '未来感、数字化、炫酷' },
  { name: '复古', nameEn: 'vintage', icon: '📼', color: '#8D6E63', description: '胶片感、怀旧、年代感' },
  { name: '城市', nameEn: 'urban', icon: '🏙️', color: '#607D8B', description: '都市、现代、快节奏' },
  { name: '自然', nameEn: 'nature', icon: '🏞️', color: '#689F38', description: '户外、原生态、放松' },
]

async function main() {
  console.log('🌱 开始初始化分类标签...')

  // 批量创建情绪标签
  console.log('📝 创建情绪维度标签...')
  for (let i = 0; i < emotionTags.length; i++) {
    const tag = emotionTags[i]
    await prisma.categoryTag.upsert({
      where: { dimension_name: { dimension: CategoryDimension.EMOTION, name: tag.name } },
      update: { ...tag, sortOrder: i, isSystem: true },
      create: { ...tag, dimension: CategoryDimension.EMOTION, sortOrder: i, isSystem: true },
    })
  }

  // 批量创建行业标签
  console.log('📝 创建行业维度标签...')
  for (let i = 0; i < industryTags.length; i++) {
    const tag = industryTags[i]
    await prisma.categoryTag.upsert({
      where: { dimension_name: { dimension: CategoryDimension.INDUSTRY, name: tag.name } },
      update: { ...tag, sortOrder: i, isSystem: true },
      create: { ...tag, dimension: CategoryDimension.INDUSTRY, sortOrder: i, isSystem: true },
    })
  }

  // 批量创建风格标签
  console.log('📝 创建风格维度标签...')
  for (let i = 0; i < styleTags.length; i++) {
    const tag = styleTags[i]
    await prisma.categoryTag.upsert({
      where: { dimension_name: { dimension: CategoryDimension.STYLE, name: tag.name } },
      update: { ...tag, sortOrder: i, isSystem: true },
      create: { ...tag, dimension: CategoryDimension.STYLE, sortOrder: i, isSystem: true },
    })
  }

  // 批量创建场景标签
  console.log('📝 创建场景维度标签...')
  for (let i = 0; i < sceneTags.length; i++) {
    const tag = sceneTags[i]
    await prisma.categoryTag.upsert({
      where: { dimension_name: { dimension: CategoryDimension.SCENE, name: tag.name } },
      update: { ...tag, sortOrder: i, isSystem: true },
      create: { ...tag, dimension: CategoryDimension.SCENE, sortOrder: i, isSystem: true },
    })
  }

  // 批量创建平台标签
  console.log('📝 创建平台维度标签...')
  for (let i = 0; i < platformTags.length; i++) {
    const tag = platformTags[i]
    await prisma.categoryTag.upsert({
      where: { dimension_name: { dimension: CategoryDimension.PLATFORM, name: tag.name } },
      update: { ...tag, sortOrder: i, isSystem: true },
      create: { ...tag, dimension: CategoryDimension.PLATFORM, sortOrder: i, isSystem: true },
    })
  }

  // 批量创建节奏标签
  console.log('📝 创建节奏维度标签...')
  for (let i = 0; i < tempoTags.length; i++) {
    const tag = tempoTags[i]
    await prisma.categoryTag.upsert({
      where: { dimension_name: { dimension: CategoryDimension.TEMPO, name: tag.name } },
      update: { ...tag, sortOrder: i, isSystem: true },
      create: { ...tag, dimension: CategoryDimension.TEMPO, sortOrder: i, isSystem: true },
    })
  }

  // 批量创建氛围标签
  console.log('📝 创建氛围维度标签...')
  for (let i = 0; i < moodTags.length; i++) {
    const tag = moodTags[i]
    await prisma.categoryTag.upsert({
      where: { dimension_name: { dimension: CategoryDimension.MOOD, name: tag.name } },
      update: { ...tag, sortOrder: i, isSystem: true },
      create: { ...tag, dimension: CategoryDimension.MOOD, sortOrder: i, isSystem: true },
    })
  }

  // 创建平台偏好权重（抖音示例）
  console.log('📝 创建平台偏好配置...')
  
  // 获取所有情绪标签
  const allEmotionTags = await prisma.categoryTag.findMany({
    where: { dimension: CategoryDimension.EMOTION }
  })
  
  // 抖音偏好：强情绪内容权重更高
  const douyinEmotionWeights: Record<string, number> = {
    '反转': 1.8,
    '震撼': 1.6,
    '共鸣': 1.5,
    '感动': 1.4,
    '开心': 1.3,
    '励志': 1.3,
    '紧张': 1.2,
  }

  for (const tag of allEmotionTags) {
    const weight = douyinEmotionWeights[tag.name] || 1.0
    await prisma.platformPreference.upsert({
      where: { platform_categoryId: { platform: 'douyin', categoryId: tag.id } },
      update: { weight },
      create: { platform: 'douyin', categoryId: tag.id, weight },
    })
  }

  console.log('✅ 分类标签初始化完成！')
  
  // 统计
  const counts = await Promise.all([
    prisma.categoryTag.count({ where: { dimension: CategoryDimension.EMOTION } }),
    prisma.categoryTag.count({ where: { dimension: CategoryDimension.INDUSTRY } }),
    prisma.categoryTag.count({ where: { dimension: CategoryDimension.STYLE } }),
    prisma.categoryTag.count({ where: { dimension: CategoryDimension.SCENE } }),
    prisma.categoryTag.count({ where: { dimension: CategoryDimension.PLATFORM } }),
    prisma.categoryTag.count({ where: { dimension: CategoryDimension.TEMPO } }),
    prisma.categoryTag.count({ where: { dimension: CategoryDimension.MOOD } }),
  ])
  
  console.log(`
📊 标签统计：
   情绪维度: ${counts[0]} 个
   行业维度: ${counts[1]} 个
   风格维度: ${counts[2]} 个
   场景维度: ${counts[3]} 个
   平台维度: ${counts[4]} 个
   节奏维度: ${counts[5]} 个
   氛围维度: ${counts[6]} 个
   总计: ${counts.reduce((a, b) => a + b, 0)} 个标签
  `)
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

