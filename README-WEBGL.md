# WebGL 3D 花字系统 - 快速开始

## 🎉 系统概览

我们的花字系统现在拥有 **三大渲染引擎**，从轻量级到专业级全覆盖：

1. **CSS + Framer Motion** - 轻量级 2D 动画 (150+ 预设)
2. **Canvas 2D** - 高性能 2D 特效（综艺主标题）
3. **WebGL (Three.js)** - 真 3D + 最强视觉 ⭐ 新增

---

## 🚀 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问测试页面

打开浏览器访问以下页面：

#### 🎬 Canvas 综艺主标题
```
http://localhost:3000/test/canvas-variety-title
```
- "一见你就笑"片头效果
- 爆炸底板 + 速度线 + 彩纸粒子
- 多层描边 + 发光

#### 🌟 WebGL 3D 花字
```
http://localhost:3000/test/webgl-fancy-text
```
- 金属光泽特效
- 霓虹发光特效
- 真 3D 文字 + PBR 材质
- 可交互（鼠标拖动旋转）

---

## 💻 使用方式

### WebGL 3D 花字（推荐）

#### 金属光泽效果

```tsx
import { WebGLFancyTextRenderer, createMetallicShine } from '@/lib/webgl-fancy-text'

export default function MyPage() {
  const scene = createMetallicShine('一见你就笑')
  
  return (
    <WebGLFancyTextRenderer
      scene={scene}
      autoPlay={true}
    />
  )
}
```

#### 霓虹发光效果

```tsx
import { createNeonGlow } from '@/lib/webgl-fancy-text'

const scene = createNeonGlow('赛博朋克', '#00FFFF')

<WebGLFancyTextRenderer scene={scene} />
```

### Canvas 2D 花字

```tsx
import { CanvasFancyTextPlayer } from '@/components/canvas-fancy-text-player'
import { createVarietyMainTitle } from '@/lib/canvas-fancy-text/presets/variety-main-title'

const scene = createVarietyMainTitle('一见你就笑')

<CanvasFancyTextPlayer
  scene={scene}
  autoPlay={true}
  loop={true}
/>
```

### CSS 花字（基础）

```tsx
import { VarietyTextSystem } from '@/components/variety-text-system'

<VarietyTextSystem
  type="main-title"
  text="一见你就笑"
  scale={1}
/>
```

---

## 📊 技术对比

| 特性 | CSS | Canvas 2D | WebGL 3D |
|-----|-----|-----------|----------|
| **渲染性能** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ |
| **视觉质量** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ |
| **3D 能力** | ❌ | ❌ | ✅ 真 3D |
| **光照系统** | ❌ | ⚠️ 伪光照 | ✅ PBR |
| **后期处理** | ❌ | ⚠️ 有限 | ✅ 完整 |
| **开发难度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ | ⭐⭐⭐☆☆ |
| **浏览器要求** | 所有 | 现代浏览器 | 现代浏览器 + GPU |
| **文件体积** | 小 | 中 | 大 |

---

## 🎨 已实现的预设

### WebGL 3D 预设

#### 1. 金属光泽 (Metallic Shine)
- 🌟 金色金属质感
- ✨ 自发光效果
- 💎 多点光源照射
- ⭐ 500 个粒子
- 💫 强烈辉光

**适用:** 片头主标题、获奖公告、高端品牌

#### 2. 霓虹发光 (Neon Glow)
- 🌃 赛博朋克风格
- 💡 强烈自发光
- 🎨 多色混合光源
- ✨ 1000 个粒子
- 💥 超强辉光 + 色差

**适用:** 科技主题、游戏频道、潮流内容

### Canvas 2D 预设

#### 综艺主标题
- 💥 爆炸形状底板
- ⚡ 放射线 + 速度线
- 🎊 彩纸粒子
- 😂 表情装饰
- 🎨 多层描边

**适用:** 综艺片头、搞笑节目

### CSS 预设

- 150+ 情绪化预设
- 涵盖 10 大情绪类型
- 中文网络用语

---

## 🛠️ 技术栈

### WebGL 系统
- **Three.js** (r160+) - WebGL 3D 库
- **React Three Fiber** - React 声明式 3D
- **@react-three/drei** - 实用工具（Text3D、相机控制）
- **@react-three/postprocessing** - 后期特效

### Canvas 系统
- **Canvas 2D API** - 原生渲染
- **自定义渲染引擎** - 多层合成

### CSS 系统
- **Framer Motion** - 声明式动画
- **CSS 动画** - 原生动画

---

## 🎯 推荐使用场景

### 选择 WebGL 3D
- ✅ 需要真 3D 效果
- ✅ 高端视觉要求
- ✅ 金属、发光等特殊材质
- ✅ 观众设备性能较好

### 选择 Canvas 2D
- ✅ 复杂 2D 特效
- ✅ 综艺风格
- ✅ 需要视频导出
- ✅ 兼容性要求高

### 选择 CSS
- ✅ 简单动画
- ✅ 轻量级应用
- ✅ 快速开发
- ✅ 移动端优先

---

## 📖 API 文档

### WebGLFancyTextRenderer

```tsx
interface WebGLFancyTextRendererProps {
  scene: WebGLFancyTextScene  // 场景配置
  autoPlay?: boolean           // 自动播放（默认 true）
  className?: string           // 自定义类名
}
```

### 创建场景

```tsx
// 金属光泽
createMetallicShine(text: string): WebGLFancyTextScene

// 霓虹发光
createNeonGlow(text: string, color?: string): WebGLFancyTextScene
```

### 场景配置

```tsx
interface WebGLFancyTextScene {
  text3D: Text3DConfig          // 3D 文字配置
  textMaterial: MaterialConfig  // 材质配置
  textAnimation: Animation3D    // 动画配置
  lights: LightConfig[]         // 光源配置
  particles?: Particle3DConfig  // 粒子配置
  postProcessing?: PostProcessingConfig // 后期处理
  camera: CameraConfig          // 相机配置
  environment: EnvironmentConfig // 环境配置
}
```

---

## 🔧 自定义开发

### 创建自定义 WebGL 场景

```tsx
import type { WebGLFancyTextScene } from '@/lib/webgl-fancy-text/types'

export const MY_CUSTOM_PRESET: WebGLFancyTextScene = {
  id: 'my-custom',
  name: '自定义特效',
  description: '我的专属特效',
  
  text3D: {
    text: '自定义文字',
    size: 2,
    height: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.05,
    // ...
  },
  
  textMaterial: {
    type: 'standard',
    color: '#FFD700',
    metalness: 0.9,
    roughness: 0.2,
    // ...
  },
  
  // ... 其他配置
}
```

---

## 🐛 故障排查

### WebGL 无法加载

**可能原因:**
1. 浏览器不支持 WebGL
2. GPU 驱动问题
3. 浏览器硬件加速未开启

**解决方案:**
```bash
# 检查浏览器 WebGL 支持
# 访问: https://get.webgl.org/
```

### 性能问题

**优化建议:**
1. 降低粒子数量
2. 减少后期处理特效
3. 降低渲染分辨率
4. 使用 `pixelRatio: 1` 而不是 2

### 字体无法加载

**默认使用 Three.js 官方字体:**
```
https://threejs.org/examples/fonts/helvetiker_bold.typeface.json
```

**自定义字体需转换为 Three.js JSON 格式**

---

## 📦 项目结构

```
lib/
├── webgl-fancy-text/          # WebGL 3D 系统
│   ├── types.ts               # 类型定义
│   ├── renderer.tsx           # 渲染器
│   ├── presets/               # 预设库
│   │   ├── metallic-shine.ts
│   │   └── neon-glow.ts
│   └── index.ts
├── canvas-fancy-text/         # Canvas 2D 系统
│   ├── types.ts
│   ├── renderer.ts
│   └── presets/
└── fancy-text/                # CSS 系统
    ├── types.ts
    ├── animations.ts
    └── presets.ts

app/test/
├── webgl-fancy-text/          # WebGL 测试页面
└── canvas-variety-title/      # Canvas 测试页面
```

---

## 🎓 学习资源

### Three.js
- [Three.js 官方文档](https://threejs.org/docs/)
- [React Three Fiber 文档](https://docs.pmnd.rs/react-three-fiber/)
- [drei 组件库](https://github.com/pmndrs/drei)

### Canvas
- [Canvas API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [HTML5 Canvas 教程](https://www.html5canvastutorials.com/)

### Framer Motion
- [Framer Motion 文档](https://www.framer.com/motion/)

---

## 🤝 贡献指南

欢迎贡献新的预设模板和功能！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-effect`)
3. 提交更改 (`git commit -m 'Add amazing effect'`)
4. 推送到分支 (`git push origin feature/amazing-effect`)
5. 打开 Pull Request

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- **Three.js** - 强大的 WebGL 库
- **React Three Fiber** - React 与 Three.js 的完美结合
- **pmndrs 团队** - drei 和 postprocessing 库
- **Framer** - Framer Motion 动画库

---

**版本**: v2.0  
**最后更新**: 2025-12-12  
**作者**: AI Assistant








