# 视频剪辑素材库与模版库 PRD 需求文档

> 本文档为 AI 开发助手提供清晰、结构化的需求描述，用于实现 AutoCut 视频剪辑工具的素材库和模版库系统。

---

## 一、产品概述

### 1.1 产品定位
构建一套完整的**视频剪辑素材库与模版库系统**，支持：
- 素材的直接使用、分类管理、收藏检索
- 模版的参数化配置、一键生成素材
- AI 能力加持的智能召唤与创意生成

### 1.2 核心价值
- **效率提升**：素材即拿即用，模版参数化批量生成
- **创意赋能**：AI 召唤网络素材、智能生成花字模版
- **个性定制**：用户可创建、收藏、管理自己的素材与模版

---

## 二、素材库系统

### 2.1 素材定义
> **素材是可直接使用的资源，无需修改参数，仅需指定在视频中的位置和时间即可应用。**

### 2.2 素材类型

| 类型 | 英文标识 | 说明 | 支持格式 |
|------|----------|------|----------|
| 视频 | `VIDEO` | 视频片段素材 | mp4, mov, webm |
| 图片 | `IMAGE` | 静态图片素材 | jpg, png, gif, webp |
| 音乐 | `AUDIO` | 背景音乐 | mp3, wav, aac |
| 音效 | `SOUND_EFFECT` | 短音效素材 | mp3, wav |
| 字体 | `FONT` | 自定义字体文件 | ttf, otf, woff |
| 花字 | `FANCY_TEXT` | 已渲染的花字素材（视频/序列帧） | mp4, png序列 |
| 表情 | `STICKER` | 表情包/贴纸 | gif, png, apng, lottie |
| 特效 | `EFFECT` | 视觉特效叠加 | mp4, json(lottie) |
| 转场 | `TRANSITION` | 转场动画 | mp4, json |

### 2.3 素材来源分类

| 来源 | 标识 | 说明 |
|------|------|------|
| 系统预设 | `SYSTEM` | 平台预置的优质素材 |
| 用户创建 | `USER` | 用户上传或从模版生成的素材 |
| AI 召唤 | `AI_CRAWL` | 通过 AI 从网络实时爬取的素材 |
| AI 生成 | `AI_GENERATED` | 通过 AI 模型直接生成的素材 |

### 2.4 素材库 Tab 结构

```
素材库
├── 全部素材      # 显示所有可用素材
├── 系统素材      # 仅显示 source=SYSTEM 的素材
├── 我的素材      # 仅显示 source=USER 的素材
├── 我的收藏      # 显示用户收藏的素材
└── AI 素材       # 仅在视频/图片类型下显示，调用 AI 生成
```

### 2.5 素材交互规范

#### 2.5.1 封面展示
- **首帧截取**：视频/GIF 类素材自动截取首帧作为封面缩略图
- **缩略图尺寸**：统一 16:9 或 9:16（根据素材原始比例智能适配）

#### 2.5.2 悬浮预览
```typescript
interface HoverPreviewBehavior {
  trigger: 'mouseenter'
  delay: 300 // ms，防抖延迟
  behavior: {
    video: 'auto-play-muted-loop' // 视频自动静音循环播放
    gif: 'animate' // GIF 动画播放
    audio: 'play-waveform' // 显示波形并播放前 5 秒
    image: 'zoom-preview' // 轻微放大预览
    sticker: 'animate' // 动画播放
  }
  onMouseLeave: 'stop-and-reset'
}
```

#### 2.5.3 点击放大
```typescript
interface ClickExpandBehavior {
  trigger: 'click'
  modal: {
    type: 'center-modal'
    maxWidth: '80vw'
    maxHeight: '80vh'
    backdrop: 'blur'
    closeOn: ['escape', 'backdrop-click', 'close-button']
  }
  content: {
    video: 'full-player-with-controls'
    image: 'zoomable-image'
    audio: 'audio-player-with-waveform'
  }
  actions: ['添加到时间轴', '收藏', '下载', '删除'] // 根据权限显示
}
```

---

## 三、模版库系统

### 3.1 模版定义
> **模版是参数化的素材生成器，用户通过调整可控参数，一键生成定制化素材。**

### 3.2 模版类型

#### 3.2.1 视频模版 (`VIDEO_TEMPLATE`)

```typescript
interface VideoTemplate {
  id: string
  type: 'VIDEO_TEMPLATE'
  name: string
  thumbnail: string
  previewVideo: string
  
  // 可控参数
  parameters: {
    // 替换人物
    personReplacement?: {
      enabled: boolean
      regions: Array<{
        id: string
        name: string // 如 "主角", "配角1"
        boundingBox: { x: number, y: number, width: number, height: number }
        keyframes: Array<{ time: number, box: BoundingBox }>
      }>
    }
    
    // 替换背景
    backgroundReplacement?: {
      enabled: boolean
      originalBackground: string // 原背景预览
      supportedTypes: ['image', 'video', 'color']
    }
    
    // 变速曲线
    speedCurve?: {
      enabled: boolean
      presets: Array<{
        name: string // 如 "渐快", "渐慢", "心跳节奏"
        curve: Array<{ time: number, speed: number }> // 关键帧
      }>
      customizable: boolean // 是否支持自定义曲线
    }
  }
}
```

#### 3.2.2 图片模版 (`IMAGE_TEMPLATE`)

```typescript
interface ImageTemplate {
  id: string
  type: 'IMAGE_TEMPLATE'
  name: string
  thumbnail: string
  
  // 可控参数
  parameters: {
    // 替换人物
    personReplacement?: {
      enabled: boolean
      regions: Array<{
        id: string
        name: string
        mask: string // 蒙版图片路径
      }>
    }
    
    // 替换背景
    backgroundReplacement?: {
      enabled: boolean
      supportedTypes: ['image', 'color', 'gradient']
    }
  }
}
```

#### 3.2.3 花字模版 (`FANCY_TEXT_TEMPLATE`)

```typescript
interface FancyTextTemplate {
  id: string
  type: 'FANCY_TEXT_TEMPLATE'
  name: string
  thumbnail: string
  previewVideo: string
  
  // ========== 整体可控参数 ==========
  globalParameters: {
    // 文字内容
    text: {
      type: 'string'
      default: '示例文字'
      maxLength: 50
      placeholder: '请输入文字'
    }
    
    // 颜色方案
    colorScheme: {
      type: 'color-picker'
      properties: {
        primary: string      // 主色
        secondary?: string   // 辅色
        outline?: string     // 描边色
        shadow?: string      // 阴影色
        gradient?: {         // 渐变
          type: 'linear' | 'radial'
          colors: string[]
          angle?: number
        }
      }
    }
    
    // 字体
    font: {
      type: 'font-selector'
      options: string[] // 可选字体列表
      default: 'default-bold'
    }
    
    // 字号（基准）
    fontSize: {
      type: 'slider'
      min: 12
      max: 200
      default: 48
      unit: 'px'
    }
    
    // 入场方式
    entrance: {
      type: 'select'
      options: [
        { value: 'fade', label: '淡入' },
        { value: 'scale-bounce', label: '放大弹跳' },
        { value: 'slide-left', label: '左侧飘入' },
        { value: 'slide-right', label: '右侧飘入' },
        { value: 'slide-up', label: '底部飘入' },
        { value: 'slide-down', label: '顶部飘入' },
        { value: 'flash', label: '闪现' },
        { value: 'explode', label: '爆炸入场' },
        { value: 'spring-shake', label: '弹簧抖动' },
        { value: 'typewriter', label: '打字机' },
        { value: 'char-scatter', label: '逐字散开' }
      ]
    }
    
    // 循环动画
    loopAnimation: {
      type: 'select'
      options: [
        { value: 'none', label: '无' },
        { value: 'breath-glow', label: '呼吸光' },
        { value: 'neon-flicker', label: '霓虹闪烁' },
        { value: 'border-flow', label: '边框流光' },
        { value: 'q-bounce', label: 'Q弹抖动' },
        { value: 'float', label: '悬浮' },
        { value: 'pulse', label: '脉冲' },
        { value: 'swing', label: '摇摆' }
      ]
    }
    
    // 退场动画
    exit: {
      type: 'select'
      options: [
        { value: 'fade', label: '淡出' },
        { value: 'scale-shrink', label: '缩回' },
        { value: 'flip-out', label: '翻转消失' },
        { value: 'explode', label: '爆炸消散' },
        { value: 'slide-out', label: '滑出' }
      ]
    }
    
    // 装饰元素
    decorations: {
      type: 'multi-select'
      options: [
        { value: 'sparkle', label: '闪光粒子' },
        { value: 'underline', label: '下划线' },
        { value: 'highlight-box', label: '高亮框' },
        { value: 'speech-bubble', label: '对话气泡' },
        { value: 'emoji-surround', label: '表情环绕' },
        { value: 'fire', label: '火焰效果' },
        { value: 'ice', label: '冰霜效果' },
        { value: 'electric', label: '电流效果' }
      ]
    }
    
    // 音效
    soundEffect: {
      type: 'audio-selector'
      categories: ['pop', 'whoosh', 'ding', 'explosion', 'magic', 'none']
      customUpload: true
    }
    
    // 整体旋转角度
    rotation: {
      type: 'slider'
      min: -45
      max: 45
      default: 0
      unit: 'deg'
    }
    
    // 时长控制
    duration: {
      entrance: { type: 'slider', min: 0.1, max: 1.0, default: 0.4, unit: 's' }
      display: { type: 'slider', min: 1.0, max: 10.0, default: 3.0, unit: 's' }
      exit: { type: 'slider', min: 0.1, max: 1.0, default: 0.3, unit: 's' }
    }
  }
  
  // ========== 逐字可控参数 ==========
  perCharacterParameters: {
    enabled: boolean // 是否启用逐字控制
    
    // 每个字符可独立控制的属性
    characterControls: Array<{
      charIndex: number
      
      // 高低偏移 (Y轴)
      offsetY: {
        type: 'slider'
        min: -50
        max: 50
        default: 0
        unit: 'px'
      }
      
      // 远近偏移 (缩放模拟)
      scale: {
        type: 'slider'
        min: 0.5
        max: 2.0
        default: 1.0
      }
      
      // 独立字号（相对基准）
      fontSizeMultiplier: {
        type: 'slider'
        min: 0.5
        max: 2.0
        default: 1.0
      }
      
      // 独立旋转
      rotation: {
        type: 'slider'
        min: -30
        max: 30
        default: 0
        unit: 'deg'
      }
      
      // 独立颜色（可选覆盖全局）
      colorOverride?: string
      
      // 入场延迟（逐字动画用）
      entranceDelay: {
        type: 'slider'
        min: 0
        max: 0.5
        default: 0.05
        unit: 's'
      }
    }>
  }
}
```

### 3.3 模版库 Tab 结构

```
模版库
├── 全部模版      # 显示所有可用模版
├── 系统模版      # 仅显示 source=SYSTEM 的模版
├── 我的模版      # 仅显示 source=USER 的模版
├── 我的收藏      # 显示用户收藏的模版
├── AI 模版       # 仅在视频/图片类型下显示，调用 AI 生成
└── 灵感创意      # 仅在花字类型下显示，交互式创意生成
```

---

## 四、花字用途标签系统

### 4.1 用途分类

| 用途 | 标识 | 典型场景 | 推荐样式特征 |
|------|------|----------|--------------|
| 标题 | `TITLE` | 视频开头主标题 | 大字号、醒目、动画强 |
| 章节步骤标题 | `CHAPTER_TITLE` | 教程步骤分隔 | 中等字号、编号、简洁 |
| 操作指引 | `GUIDE` | 操作提示、引导文字 | 清晰、箭头/图标装饰 |
| 强调特写 | `EMPHASIS` | 重点内容强调 | 动态、闪烁、震动效果 |
| 人物介绍 | `PERSON_INTRO` | 人物出场介绍 | 姓名+头衔布局 |
| 对话字幕 | `DIALOGUE` | 对话内容展示 | 对话气泡、居中 |
| 旁白注释 | `ANNOTATION` | 补充说明文字 | 小字号、边角位置 |
| 互动引导 | `CALL_TO_ACTION` | 点赞关注提示 | 活泼、引导箭头 |

### 4.2 用途标签筛选

```typescript
interface UsageTagFilter {
  dimension: 'USAGE'
  multiple: true // 支持多选
  options: UsageTag[]
  
  // 联动逻辑：选择用途后自动推荐匹配的模版
  onSelect: (selectedTags: UsageTag[]) => {
    filterTemplates: true
    sortBy: 'relevance'
    highlightRecommended: true
  }
}
```

---

## 五、收藏功能

### 5.1 数据模型

```typescript
interface UserFavorite {
  id: string
  userId: string
  targetId: string
  targetType: 'MEDIA' | 'TEMPLATE'
  createdAt: Date
  
  // 用户自定义分组（可选）
  collectionId?: string
}

interface FavoriteCollection {
  id: string
  userId: string
  name: string
  description?: string
  coverImage?: string
  itemCount: number
  createdAt: Date
  updatedAt: Date
}
```

### 5.2 收藏交互

```typescript
interface FavoriteInteraction {
  // 添加收藏
  addToFavorite: {
    trigger: 'click-heart-icon' | 'long-press' | 'context-menu'
    feedback: 'heart-fill-animation'
    toast: '已添加到收藏'
  }
  
  // 取消收藏
  removeFromFavorite: {
    trigger: 'click-filled-heart' | 'context-menu'
    confirm: false // 无需确认
    feedback: 'heart-unfill-animation'
    toast: '已取消收藏'
  }
  
  // 批量管理
  batchManage: {
    selectMode: 'checkbox'
    actions: ['移动到收藏夹', '取消收藏']
  }
}
```

---

## 六、表情素材管理

### 6.1 表情包结构

```typescript
interface StickerPack {
  id: string
  name: string
  thumbnail: string
  source: 'SYSTEM' | 'USER' | 'IMPORTED'
  
  stickers: Array<{
    id: string
    name: string
    url: string
    format: 'gif' | 'png' | 'apng' | 'lottie' | 'webp'
    tags: string[]
    width: number
    height: number
    duration?: number // 动图时长
  }>
  
  // 表情包元数据
  metadata: {
    author?: string
    version?: string
    license?: string
    importedFrom?: string // 导入来源URL
  }
}
```

### 6.2 表情包导入

```typescript
interface StickerImportFlow {
  // 支持的导入方式
  importMethods: [
    {
      type: 'file-upload'
      accepts: ['.zip', '.gif', '.png', '.apng', '.json']
      maxSize: '50MB'
      description: '上传表情包压缩包或单个表情'
    },
    {
      type: 'url-import'
      placeholder: '粘贴表情包链接'
      supportedSources: ['微信表情', '豆包表情', 'Giphy', '自定义URL']
    },
    {
      type: 'clipboard-paste'
      description: '直接粘贴图片'
    }
  ]
  
  // 导入后处理
  postProcess: {
    autoGenerateThumbnail: true
    autoDetectFormat: true
    autoExtractTags: true // AI 自动打标签
    duplicateCheck: true
  }
}
```

---

## 七、素材与模版的关系

### 7.1 从模版生成素材

```typescript
interface TemplateToAssetFlow {
  // 流程描述
  flow: [
    '1. 用户选择模版',
    '2. 调整可控参数',
    '3. 实时预览效果',
    '4. 点击确认生成',
    '5. 渲染生成素材文件',
    '6. 自动保存到用户素材库'
  ]
  
  // 生成配置
  generateConfig: {
    outputFormat: {
      video: 'mp4'
      image: 'png'
      fancyText: 'mp4' | 'png-sequence' | 'webm'
    }
    quality: 'high' | 'medium' | 'draft'
    autoSaveToLibrary: true
    inheritTemplateTags: true
  }
}
```

### 7.2 模版函数调用接口

> **关键需求**：所有模版必须预留标准化的函数调用接口，供系统自动批量生成素材。

```typescript
interface TemplateRenderAPI {
  /**
   * 渲染花字模版
   * @param templateId - 模版ID
   * @param params - 渲染参数
   * @returns 渲染后的素材信息
   */
  renderFancyText(
    templateId: string,
    params: {
      text: string
      colorScheme?: ColorSchemeParams
      font?: string
      fontSize?: number
      entrance?: EntranceType
      loopAnimation?: LoopAnimationType
      exit?: ExitType
      decorations?: DecorationTypes[]
      soundEffect?: string | null
      rotation?: number
      duration?: DurationParams
      perCharacter?: PerCharacterParams[]
    }
  ): Promise<{
    assetId: string
    url: string
    thumbnailUrl: string
    duration: number
  }>
  
  /**
   * 批量渲染（用于章节标题、步骤指引等场景）
   */
  batchRenderFancyText(
    templateId: string,
    items: Array<{
      text: string
      params?: Partial<FancyTextParams>
    }>
  ): Promise<Array<RenderResult>>
  
  /**
   * 视频模版渲染
   */
  renderVideoTemplate(
    templateId: string,
    params: {
      personReplacements?: Array<{ regionId: string, sourceMedia: string }>
      backgroundReplacement?: { type: 'image' | 'video' | 'color', source: string }
      speedCurve?: SpeedCurveParams
    }
  ): Promise<RenderResult>
  
  /**
   * 图片模版渲染
   */
  renderImageTemplate(
    templateId: string,
    params: {
      personReplacements?: Array<{ regionId: string, sourceImage: string }>
      backgroundReplacement?: { type: 'image' | 'color' | 'gradient', source: string }
    }
  ): Promise<RenderResult>
}
```

### 7.3 典型应用场景

```typescript
// 场景1：自动生成教程步骤标题
const stepTitles = [
  '第一步：打开应用',
  '第二步：选择模版',
  '第三步：调整参数',
  '第四步：导出视频'
]

const assets = await templateAPI.batchRenderFancyText(
  'chapter-title-template-001',
  stepTitles.map(text => ({ text }))
)

// 场景2：强调特写文字
await templateAPI.renderFancyText('emphasis-template-001', {
  text: '重点！',
  colorScheme: { primary: '#FF0000' },
  entrance: 'explode',
  loopAnimation: 'neon-flicker'
})
```

---

## 八、AI 素材召唤

### 8.1 召唤流程

```typescript
interface AICrawlFlow {
  // 触发条件：系统预设素材无法满足需求
  trigger: {
    entryPoint: '素材库搜索无结果' | '点击AI召唤按钮'
    contextual: {
      currentMediaType: MediaType
      currentTags: string[]
      searchKeywords: string
    }
  }
  
  // 召唤请求
  request: {
    mediaType: MediaType
    tags: string[]
    keywords: string
    style?: string // 风格描述
    quantity: number // 期望数量，默认 20
  }
  
  // 召唤结果
  response: {
    status: 'crawling' | 'success' | 'partial' | 'failed'
    items: Array<{
      id: string
      sourceUrl: string
      previewUrl: string
      thumbnailUrl: string
      source: string // 来源网站
      license?: string
      metadata: Record<string, any>
    }>
    
    // 不存储到服务器，仅临时展示
    storage: 'temporary'
    expireAfter: '24h'
  }
  
  // 用户确认导入
  import: {
    trigger: 'user-click-confirm'
    actions: [
      '下载素材到服务器',
      '生成缩略图',
      'AI 自动打标签',
      '保存到用户素材库'
    ]
    result: {
      assetId: string
      source: 'AI_CRAWL'
    }
  }
}
```

### 8.2 爬取源配置

```typescript
interface CrawlSourceConfig {
  sources: [
    {
      name: 'Pexels'
      types: ['VIDEO', 'IMAGE']
      api: 'official'
      license: 'Pexels License'
    },
    {
      name: 'Pixabay'
      types: ['VIDEO', 'IMAGE', 'AUDIO']
      api: 'official'
      license: 'Pixabay License'
    },
    {
      name: 'Freesound'
      types: ['AUDIO', 'SOUND_EFFECT']
      api: 'official'
      license: 'CC'
    },
    {
      name: 'LottieFiles'
      types: ['EFFECT', 'STICKER']
      api: 'official'
      license: 'Lottie License'
    },
    {
      name: 'Giphy'
      types: ['STICKER']
      api: 'official'
      license: 'Giphy'
    }
  ]
  
  // 合规要求
  compliance: {
    respectLicense: true
    attributionRequired: true
    noWatermarkPreferred: true
    safeSearch: true
  }
}
```

---

## 九、AI 模版生成

### 9.1 生成流程

```typescript
interface AITemplateGenerateFlow {
  // 入口
  entry: {
    location: '模版库 > AI模版 Tab' | '模版库 > 灵感创意 Tab'
    mediaTypes: ['VIDEO', 'IMAGE', 'FANCY_TEXT']
  }
  
  // 视频/图片模版生成
  videoImageGeneration: {
    inputs: {
      referenceImage?: File // 参考图
      referenceVideo?: File // 参考视频
      prompt: string // 提示词描述
    }
    
    models: {
      video: {
        provider: 'Google'
        model: 'Veo 3.1'
        // 预留模型切换能力
        alternatives: ['Runway Gen-3', 'Pika Labs', 'Sora']
      }
      image: {
        provider: 'Google'
        model: 'Imagen 3' // Nano Banana 是 Imagen 的别称
        alternatives: ['DALL-E 3', 'Midjourney', 'Stable Diffusion']
      }
    }
    
    flow: [
      '1. 用户上传参考素材（可选）',
      '2. 用户输入提示词描述',
      '3. 调用 AI 模型生成',
      '4. 展示生成结果预览',
      '5. 用户确认满意',
      '6. 下载并导入用户模版库'
    ]
  }
  
  // 花字模版生成
  fancyTextGeneration: {
    inputs: FancyTextCreativeInput // 见下文 9.2
    
    flow: [
      '1. 用户填写灵感创意表单',
      '2. AI 解析需求生成模版脚本',
      '3. 实时渲染预览',
      '4. 用户可微调参数',
      '5. 确认后保存到用户模版库'
    ]
  }
}
```

### 9.2 花字灵感创意输入表单

```typescript
interface FancyTextCreativeInput {
  // 1. 文字内容（必填）
  text: {
    label: '文字内容'
    type: 'textarea'
    required: true
    placeholder: '输入你想展示的文字'
    maxLength: 100
  }
  
  // 2. 字体风格
  fontStyle: {
    label: '字体风格'
    type: 'select-with-preview'
    options: [
      { value: 'handwritten', label: '手写体', preview: '/previews/font-handwritten.png' },
      { value: 'pop', label: 'POP字', preview: '/previews/font-pop.png' },
      { value: 'variety-bold', label: '综艺感黑体', preview: '/previews/font-variety.png' },
      { value: 'fun-bold', label: '趣味粗体', preview: '/previews/font-fun.png' },
      { value: 'bouncy', label: 'Q弹体', preview: '/previews/font-bouncy.png' },
      { value: 'cyber-neon', label: '赛博霓虹', preview: '/previews/font-cyber.png' },
      { value: 'cute-round', label: '可爱圆体', preview: '/previews/font-cute.png' },
      { value: 'firework-brush', label: '烟花笔刷', preview: '/previews/font-firework.png' },
      { value: 'chalk', label: '粉笔体', preview: '/previews/font-chalk.png' },
      { value: 'custom', label: '自定义描述' }
    ]
    customInput: {
      show: "when value === 'custom'"
      placeholder: '描述你想要的字体风格...'
    }
  }
  
  // 3. 视觉风格
  visualStyle: {
    label: '视觉风格'
    type: 'multi-select-chips'
    options: [
      { value: 'funny', label: '搞怪', emoji: '🤪' },
      { value: 'dramatic', label: '戏精', emoji: '🎭' },
      { value: 'silly', label: '沙雕', emoji: '🤡' },
      { value: 'hilarious', label: '爆笑', emoji: '😂' },
      { value: 'inspiring', label: '励志', emoji: '💪' },
      { value: 'healing', label: '治愈', emoji: '🌸' },
      { value: 'glowing', label: '炫光', emoji: '✨' },
      { value: 'tech', label: '科技', emoji: '🤖' },
      { value: 'variety-show', label: '综艺感', emoji: '🎬' },
      { value: 'magic', label: '魔法', emoji: '🪄' },
      { value: 'fire', label: '火焰', emoji: '🔥' },
      { value: 'ink', label: '水墨', emoji: '🖌️' },
      { value: 'graffiti', label: '涂鸦', emoji: '🎨' }
    ]
    maxSelect: 3
  }
  
  // 4. 质感
  texture: {
    label: '质感'
    type: 'select-grid'
    columns: 4
    options: [
      { value: 'metallic', label: '金属', icon: '🔩' },
      { value: 'glass', label: '玻璃', icon: '🪟' },
      { value: 'neon', label: '霓虹', icon: '💡' },
      { value: 'gradient', label: '渐变', icon: '🌈' },
      { value: 'fluffy', label: '毛绒', icon: '🧸' },
      { value: 'cyber', label: '赛博', icon: '💾' },
      { value: 'film', label: '胶片', icon: '🎞️' },
      { value: 'spray-paint', label: '涂鸦喷漆', icon: '🎨' },
      { value: 'particle', label: '粒子', icon: '✨' },
      { value: '3d', label: '3D立体', icon: '🎲' }
    ]
  }
  
  // 5. 动画
  animation: {
    label: '动画效果'
    type: 'grouped-select'
    groups: [
      {
        name: '进入动画',
        key: 'entrance',
        options: [
          { value: 'scale-bounce', label: '放大弹跳' },
          { value: 'float-in', label: '飘入' },
          { value: 'flash', label: '闪现' },
          { value: 'explode-in', label: '爆炸入场' },
          { value: 'spring-shake', label: '弹簧抖动' }
        ]
      },
      {
        name: '循环动画',
        key: 'loop',
        options: [
          { value: 'breath-glow', label: '呼吸光' },
          { value: 'neon-flicker', label: '霓虹闪烁' },
          { value: 'border-flow', label: '边框流光' },
          { value: 'q-bounce', label: 'Q弹抖动' }
        ]
      },
      {
        name: '出场动画',
        key: 'exit',
        options: [
          { value: 'fade-out', label: '淡出' },
          { value: 'shrink', label: '缩回' },
          { value: 'flip-out', label: '翻转消失' }
        ]
      }
    ]
  }
  
  // 6. 时长
  duration: {
    label: '时长设置'
    type: 'duration-picker'
    fields: {
      entranceDuration: {
        label: '进入动画时长'
        min: 0.3
        max: 0.6
        default: 0.4
        step: 0.1
        unit: '秒'
      }
      totalDuration: {
        label: '总展示时长'
        min: 2
        max: 8
        default: 3
        step: 0.5
        unit: '秒'
      }
    }
  }
  
  // 7. 场景用途
  context: {
    label: '场景用途'
    type: 'select'
    options: [
      { value: 'variety-show', label: '综艺节目' },
      { value: 'vlog', label: 'Vlog' },
      { value: 'funny-video', label: '搞笑视频' },
      { value: 'reality-show', label: '真人秀' },
      { value: 'unboxing', label: '开箱' },
      { value: 'short-drama', label: '剧情短剧' },
      { value: 'tutorial', label: '教程' },
      { value: 'product-review', label: '产品测评' }
    ]
  }
  
  // 8. 附加要求
  extraRequirements: {
    label: '附加要求'
    type: 'multi-select-chips'
    options: [
      { value: 'vertical-fit', label: '适配竖屏' },
      { value: 'highlight-keyword', label: '高亮关键词' },
      { value: 'with-shadow', label: '带阴影' },
      { value: 'with-outline', label: '带描边' },
      { value: 'stronger-emotion', label: '情绪更强烈' },
      { value: 'cuter', label: '更可爱' },
      { value: 'minimalist', label: '简约风' },
      { value: 'retro', label: '复古风' }
    ]
    customInput: {
      enabled: true
      placeholder: '其他要求...'
    }
  }
}
```

### 9.3 AI 协议适配层

```typescript
interface AIAdapterProtocol {
  // 视频生成协议
  videoGeneration: {
    provider: string
    endpoint: string
    request: {
      prompt: string
      referenceImage?: string // base64 或 URL
      referenceVideo?: string
      duration: number
      aspectRatio: '16:9' | '9:16' | '1:1'
      style?: string
    }
    response: {
      videoUrl: string
      thumbnailUrl: string
      duration: number
      metadata: Record<string, any>
    }
  }
  
  // 图片生成协议
  imageGeneration: {
    provider: string
    endpoint: string
    request: {
      prompt: string
      referenceImage?: string
      size: { width: number, height: number }
      style?: string
      negativePrompt?: string
    }
    response: {
      imageUrl: string
      thumbnailUrl: string
      metadata: Record<string, any>
    }
  }
  
  // 花字脚本生成协议
  fancyTextScriptGeneration: {
    provider: string
    endpoint: string
    request: {
      input: FancyTextCreativeInput
      outputFormat: 'template-script'
    }
    response: {
      templateScript: FancyTextTemplate
      previewParams: FancyTextParams
    }
  }
}
```

---

## 十、统一标签系统

### 10.1 标签维度

| 维度 | 标识 | 说明 | 示例标签 |
|------|------|------|----------|
| 情绪 | `EMOTION` | 内容情绪基调 | 开心、悲伤、愤怒、惊讶、治愈 |
| 行业 | `INDUSTRY` | 适用行业/垂类 | 美食、旅游、科技、教育、美妆 |
| 风格 | `STYLE` | 视觉/内容风格 | 简约、复古、赛博朋克、自然 |
| 场景 | `SCENE` | 使用场景 | 开场、结尾、转场、高潮 |
| 平台 | `PLATFORM` | 适配平台 | 抖音、B站、小红书、快手 |
| 节奏 | `TEMPO` | 节奏/速度 | 快节奏、慢节奏、卡点 |
| 用途 | `USAGE` | 花字专用用途 | 标题、章节、指引、强调 |

### 10.2 标签强制策略

```typescript
interface TaggingPolicy {
  // 上传时
  onUpload: {
    required: ['EMOTION', 'STYLE'] // 至少选择情绪和风格
    aiSuggestion: true // AI 自动推荐标签
    userCanModify: true
  }
  
  // 模版创建时
  onTemplateCreate: {
    required: ['EMOTION', 'STYLE', 'USAGE'] // 花字模版必须有用途标签
    inheritFromSource: true // 从源素材继承标签
  }
  
  // AI 生成时
  onAIGenerate: {
    autoTag: true // 自动打标签
    confidence: true // 显示置信度
    userReview: true // 用户可确认/修改
  }
}
```

### 10.3 多维度检索

```typescript
interface MultiDimensionSearch {
  // 搜索接口
  search: {
    query?: string // 关键词搜索
    filters: {
      type?: MediaType[]
      source?: MediaSource[]
      emotion?: string[]
      industry?: string[]
      style?: string[]
      scene?: string[]
      platform?: string[]
      tempo?: string[]
      usage?: string[] // 花字用途
    }
    sort: 'relevance' | 'newest' | 'popular' | 'name'
    pagination: {
      page: number
      pageSize: number
    }
  }
  
  // 筛选 UI
  filterUI: {
    layout: 'sidebar' | 'top-bar' | 'drawer'
    showCount: true // 显示每个标签的素材数量
    multiSelect: true
    clearAll: true
    saveFilter: true // 保存常用筛选
  }
}
```

---

## 十一、技术实现要点

### 11.1 渲染引擎

```typescript
interface RenderEngine {
  // 花字渲染
  fancyTextRenderer: {
    technology: 'Canvas + WebGL'
    features: [
      '文字路径动画',
      '粒子效果',
      '3D 变换',
      '着色器效果',
      '序列帧导出'
    ]
    output: ['mp4', 'webm', 'png-sequence', 'gif']
  }
  
  // 视频模版渲染
  videoTemplateRenderer: {
    technology: 'FFmpeg + MediaPipe'
    features: [
      '人物分割抠图',
      '背景替换',
      '变速处理',
      '画质增强'
    ]
  }
  
  // 图片模版渲染
  imageTemplateRenderer: {
    technology: 'Canvas + AI Models'
    features: [
      '人物分割',
      '背景去除/替换',
      '智能融合'
    ]
  }
}
```

### 11.2 性能优化

```typescript
interface PerformanceOptimization {
  // 缩略图生成
  thumbnail: {
    lazyGenerate: true // 延迟生成
    cacheStrategy: 'CDN + LocalStorage'
    formats: ['webp', 'jpg'] // WebP 优先
  }
  
  // 预览优化
  preview: {
    videoPreload: 'metadata' // 仅预加载元数据
    hoverPreviewQuality: 'low' // 悬浮预览用低质量
    modalPreviewQuality: 'high' // 弹窗预览用高质量
  }
  
  // 列表虚拟化
  virtualization: {
    enabled: true
    itemHeight: 'dynamic'
    overscan: 5
  }
  
  // 渲染队列
  renderQueue: {
    maxConcurrent: 3
    priority: 'user-triggered-first'
    background: true
  }
}
```

### 11.3 数据库设计要点

```prisma
// 新增模型

model Template {
  id            String       @id @default(uuid())
  type          TemplateType // VIDEO_TEMPLATE, IMAGE_TEMPLATE, FANCY_TEXT_TEMPLATE
  name          String
  description   String?      @db.Text
  thumbnail     String
  previewUrl    String?
  
  // 可控参数 JSON
  parameters    Json         // 存储 TemplateParameters 结构
  
  // 元数据
  source        MediaSource  // SYSTEM, USER, AI_GENERATED
  userId        String?      // 用户创建时关联
  isPublic      Boolean      @default(false)
  usageCount    Int          @default(0)
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  // 关联
  tags          TemplateTag[]
  favorites     UserFavorite[]
}

model UserFavorite {
  id          String   @id @default(uuid())
  userId      String
  targetId    String
  targetType  String   // MEDIA | TEMPLATE
  
  createdAt   DateTime @default(now())
  
  @@unique([userId, targetId, targetType])
}

model StickerPack {
  id          String   @id @default(uuid())
  name        String
  thumbnail   String
  source      String   // SYSTEM, USER, IMPORTED
  userId      String?
  metadata    Json?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  stickers    Sticker[]
}

model Sticker {
  id          String      @id @default(uuid())
  packId      String
  name        String
  url         String
  format      String
  width       Int
  height      Int
  duration    Float?
  tags        String[]
  
  pack        StickerPack @relation(fields: [packId], references: [id])
}
```

---

## 十二、附录

### 12.1 术语表

| 术语 | 说明 |
|------|------|
| 素材 (Asset/Media) | 可直接使用的资源文件 |
| 模版 (Template) | 参数化的素材生成器 |
| 花字 (Fancy Text) | 带动画效果的装饰文字 |
| 表情包 (Sticker Pack) | 表情/贴纸集合 |
| AI 召唤 | 通过 AI 从网络实时获取素材 |
| 灵感创意 | 交互式 AI 花字模版生成 |

### 12.2 接口优先级

| 优先级 | 功能模块 |
|--------|----------|
| P0 | 素材库基础 CRUD、标签系统、收藏功能 |
| P0 | 花字模版系统（整体参数 + 逐字参数） |
| P1 | 模版渲染引擎（花字优先） |
| P1 | 首帧封面、悬浮预览、点击放大 |
| P1 | 表情包管理 |
| P2 | AI 召唤素材 |
| P2 | AI 生成模版（视频/图片） |
| P2 | 灵感创意（花字 AI 生成） |
| P3 | 视频模版（人物/背景替换） |
| P3 | 图片模版（人物/背景替换） |

---

*文档版本: v1.0*
*更新时间: 2024-12-11*
*作者: AutoCut Team*








