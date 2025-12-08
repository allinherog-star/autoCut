import { PrismaClient, CategoryDimension } from '@prisma/client'

const prisma = new PrismaClient()

// 情绪标签（表达情感和心理状态）
const emotionTags = [
  { name: '笑了', nameEn: 'laughing', icon: null, color: '#FFD93D', description: '哈哈哈、笑死、太好笑' },
  { name: '好奇', nameEn: 'curious', icon: null, color: '#03A9F4', description: '想知道、悬念、吸引' },
  { name: '感动', nameEn: 'touching', icon: null, color: '#FF6B6B', description: '泪目、走心、催泪' },
  { name: '失落', nameEn: 'disappointed', icon: null, color: '#9E9E9E', description: '遗憾、可惜、叹气' },
  { name: '心疼', nameEn: 'heartache', icon: null, color: '#E91E63', description: '心痛、怜惜、难过' },
  { name: '紧张', nameEn: 'tense', icon: null, color: '#9C27B0', description: '悬疑、刺激、心跳加速' },
  { name: '兴奋', nameEn: 'excited', icon: null, color: '#FF5722', description: '激动、太棒了、冲' },
  { name: '期待', nameEn: 'anticipating', icon: null, color: '#FFC107', description: '等不及、想看、催更' },
  { name: '有点东西', nameEn: 'impressive', icon: null, color: '#8BC34A', description: '有料、厉害、学到了' },
  { name: '破防', nameEn: 'emotional', icon: null, color: '#F44336', description: 'emo、泪崩、戳心' },
  { name: '爱了', nameEn: 'love', icon: null, color: '#E91E63', description: '喜欢、太爱了、心动' },
  { name: '震撼', nameEn: 'stunning', icon: null, color: '#673AB7', description: '惊艳、大片感、视觉冲击' },
  { name: '惊讶', nameEn: 'surprised', icon: null, color: '#00BCD4', description: '没想到、意外、居然' },
  { name: '愤怒', nameEn: 'angry', icon: null, color: '#D32F2F', description: '生气、不爽、太过分' },
  { name: '开心', nameEn: 'happy', icon: null, color: '#4CAF50', description: '快乐、愉悦、美好' },
]

// 视频类型维度标签（与上传页面 VIDEO_TYPES 保持一致）
const industryTags = [
  // 日常记录类
  { name: 'Vlog', nameEn: 'vlog', icon: null, color: '#38BDF8', description: '记录日常生活' },
  { name: '旅游旅拍', nameEn: 'travel', icon: null, color: '#06B6D4', description: '旅行攻略记录' },
  { name: '生活小妙招', nameEn: 'life-hack', icon: null, color: '#FACC15', description: '实用生活技巧' },
  
  // 探店体验类
  { name: '美食探店', nameEn: 'food', icon: null, color: '#FB923C', description: '美食推荐分享' },
  { name: '睡寝探店', nameEn: 'hotel', icon: null, color: '#A78BFA', description: '酒店民宿体验' },
  
  // 时尚生活类
  { name: '时尚穿搭', nameEn: 'fashion', icon: null, color: '#F472B6', description: '穿搭分享推荐' },
  { name: '健身减脂', nameEn: 'fitness', icon: null, color: '#34D399', description: '健身教程分享' },
  
  // 知识教程类
  { name: '课程教程', nameEn: 'tutorial', icon: null, color: '#3B82F6', description: '技能教学课程' },
  { name: '知识科普', nameEn: 'knowledge', icon: null, color: '#A855F7', description: '科普知识讲解' },
  { name: '职场攻略', nameEn: 'career', icon: null, color: '#64748B', description: '职场经验分享' },
  { name: '效率工具', nameEn: 'tools', icon: null, color: '#FBBF24', description: '工具软件推荐' },
  
  // 种草带货类
  { name: '安利种草', nameEn: 'recommend', icon: null, color: '#22C55E', description: '好物推荐分享' },
  { name: '评测对比', nameEn: 'review', icon: null, color: '#6366F1', description: '产品评测对比' },
  { name: '优惠带货', nameEn: 'deals', icon: null, color: '#F97316', description: '优惠信息带货' },
  
  // 娱乐内容类
  { name: '影视解说', nameEn: 'movie', icon: null, color: '#EF4444', description: '影视作品解读' },
  { name: '游戏', nameEn: 'gaming', icon: null, color: '#7C3AED', description: '游戏实况攻略' },
  { name: '直播切片', nameEn: 'live-clip', icon: null, color: '#EC4899', description: '直播精彩片段' },
  { name: '情感咨询', nameEn: 'emotion', icon: null, color: '#F43F5E', description: '情感故事分享' },
]

// 表现力标签（内容表现手法或风格特征）
const styleTags = [
  { name: '沙雕', nameEn: 'shagou', icon: null, color: '#FFD93D', description: '搞怪、无厘头、抽象' },
  { name: '戏精', nameEn: 'dramatic', icon: null, color: '#9C27B0', description: '夸张、演技、小剧场' },
  { name: '逗比欢乐多', nameEn: 'funny', icon: null, color: '#FF9800', description: '搞笑、欢乐、段子手' },
  { name: '接地气', nameEn: 'relatable', icon: null, color: '#795548', description: '真实、生活化、普通人' },
  { name: '又穷又开心', nameEn: 'poor-happy', icon: null, color: '#8BC34A', description: '省钱、平价、穷开心' },
  { name: '呆萌可爱', nameEn: 'cute', icon: null, color: '#FF85A2', description: '萌系、甜美、软萌' },
  { name: '反转再反转', nameEn: 'twist', icon: null, color: '#E91E63', description: '神转折、意外、出人意料' },
  { name: '社畜归来', nameEn: 'worker', icon: null, color: '#607D8B', description: '打工人、职场、摸鱼' },
  { name: '躺平EMO', nameEn: 'emo', icon: null, color: '#9E9E9E', description: '丧、躺平、佛系' },
  { name: '心灵鸡汤', nameEn: 'chicken-soup', icon: null, color: '#FFEB3B', description: '正能量、励志语录' },
  { name: '治愈小伤口', nameEn: 'healing', icon: null, color: '#4CAF50', description: '治愈、温暖、解压' },
  { name: '上头魔性', nameEn: 'addictive', icon: null, color: '#E040FB', description: '洗脑、上头、鬼畜' },
  { name: '震撼超燃', nameEn: 'epic', icon: null, color: '#F44336', description: '燃爆、震撼、大片感' },
  { name: '硬核解说', nameEn: 'hardcore', icon: null, color: '#3F51B5', description: '专业、深度、干货' },
  { name: '振奋励志', nameEn: 'inspiring', icon: null, color: '#FFC107', description: '正能量、逆袭、冲鸭' },
  { name: '另类潮流', nameEn: 'alternative', icon: null, color: '#7C4DFF', description: '小众、独特、个性' },
  { name: '怀旧复古', nameEn: 'retro', icon: null, color: '#795548', description: '复古、经典、年代感' },
  { name: '脑洞科幻', nameEn: 'scifi', icon: null, color: '#00BCD4', description: '科幻、脑洞、未来感' },
  { name: '炫酷不翻车', nameEn: 'cool-safe', icon: null, color: '#00E676', description: '炫技、稳定、不出错' },
]

// 时机标签（视频中使用的时机节点）
const sceneTags = [
  { name: '开头3秒', nameEn: 'hook', icon: null, color: '#F44336', description: '前3秒抓人眼球、黄金开场' },
  { name: '步骤牵引', nameEn: 'guide', icon: null, color: '#2196F3', description: '引导观众、承上启下' },
  { name: '转场过渡', nameEn: 'transition', icon: null, color: '#9C27B0', description: '画面切换、衔接自然' },
  { name: '情绪增强', nameEn: 'emotional', icon: null, color: '#E91E63', description: '情感铺垫、氛围营造' },
  { name: '三连结尾', nameEn: 'ending', icon: null, color: '#4CAF50', description: '引导点赞收藏关注' },
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

  // 批量创建风格标签（先删除旧的，再重新创建）
  console.log('📝 创建风格维度标签...')
  await prisma.categoryTag.deleteMany({
    where: { dimension: CategoryDimension.STYLE }
  })
  for (let i = 0; i < styleTags.length; i++) {
    const tag = styleTags[i]
    await prisma.categoryTag.create({
      data: { ...tag, dimension: CategoryDimension.STYLE, sortOrder: i, isSystem: true },
    })
  }

  // 批量创建场景标签（先删除旧的，再重新创建）
  console.log('📝 创建场景维度标签...')
  await prisma.categoryTag.deleteMany({
    where: { dimension: CategoryDimension.SCENE }
  })
  for (let i = 0; i < sceneTags.length; i++) {
    const tag = sceneTags[i]
    await prisma.categoryTag.create({
      data: { ...tag, dimension: CategoryDimension.SCENE, sortOrder: i, isSystem: true },
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
    '振奋励志': 1.3,
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

