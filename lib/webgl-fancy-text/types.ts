/**
 * WebGL 3D 花字渲染类型定义
 * 基于 Three.js 的高性能 3D 渲染系统
 */

import type * as THREE from 'three'

// ============================================
// 3D 渲染配置
// ============================================

export interface WebGLRenderConfig {
  width: number
  height: number
  antialias: boolean
  alpha: boolean
  pixelRatio: number
  shadowMap: boolean
  toneMapping: 'none' | 'linear' | 'reinhard' | 'cineon' | 'aces'
}

// ============================================
// 3D 文字配置
// ============================================

export interface Text3DConfig {
  text: string
  fontUrl: string
  size: number
  height: number // 挤出厚度
  curveSegments: number
  bevelEnabled: boolean
  bevelThickness: number
  bevelSize: number
  bevelSegments: number
}

// ============================================
// 材质配置
// ============================================

export type MaterialType = 
  | 'standard'      // 标准 PBR 材质
  | 'phong'         // Phong 光照
  | 'toon'          // 卡通着色
  | 'matcap'        // MatCap 材质
  | 'holographic'   // 全息材质
  | 'glass'         // 玻璃材质
  | 'metallic'      // 金属材质
  | 'neon'          // 霓虹发光

export interface MaterialConfig {
  type: MaterialType
  
  // 基础属性
  color?: string
  emissive?: string
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
  
  // 纹理
  map?: string
  normalMap?: string
  roughnessMap?: string
  metalnessMap?: string
  envMap?: THREE.Texture
  
  // 透明
  transparent?: boolean
  opacity?: number
  
  // 特殊效果
  wireframe?: boolean
  flatShading?: boolean
}

// ============================================
// 光源配置
// ============================================

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere'
  color: string
  intensity: number
  position?: [number, number, number]
  target?: [number, number, number]
  castShadow?: boolean
  shadowMapSize?: number
}

// ============================================
// 粒子系统（3D）
// ============================================

export interface Particle3DConfig {
  count: number
  size: number
  colors: string[]
  spread: number
  speed: number
  life: number
  shape: 'sphere' | 'star' | 'spark'
  texture?: string
}

// ============================================
// 后期处理效果
// ============================================

export type PostProcessingEffect = 
  | 'bloom'           // 辉光
  | 'glitch'          // 故障
  | 'chromaticAberration' // 色差
  | 'vignette'        // 晕影
  | 'filmGrain'       // 胶片颗粒
  | 'motionBlur'      // 运动模糊
  | 'dof'             // 景深
  | 'outline'         // 轮廓

export interface PostProcessingConfig {
  enabled: boolean
  effects: {
    type: PostProcessingEffect
    strength?: number
    [key: string]: any
  }[]
}

// ============================================
// 动画配置（3D）
// ============================================

export interface Animation3DKeyframe {
  time: number // 0-1
  position?: [number, number, number]
  rotation?: [number, number, number] // 欧拉角
  scale?: [number, number, number] | number
  opacity?: number
  easing?: string
}

export interface Animation3D {
  duration: number
  keyframes: Animation3DKeyframe[]
  loop?: boolean
  yoyo?: boolean
}

// ============================================
// 相机配置
// ============================================

export interface CameraConfig {
  type: 'perspective' | 'orthographic'
  fov?: number
  position: [number, number, number]
  lookAt: [number, number, number]
  animation?: Animation3D
}

// ============================================
// 环境配置
// ============================================

export interface EnvironmentConfig {
  background: 'color' | 'gradient' | 'texture' | 'skybox'
  backgroundColor?: string
  backgroundGradient?: {
    topColor: string
    bottomColor: string
  }
  fog?: {
    enabled: boolean
    color: string
    near: number
    far: number
  }
}

// ============================================
// 完整 3D 场景
// ============================================

export interface WebGLFancyTextScene {
  id: string
  name: string
  description: string
  
  // 渲染配置
  renderConfig: WebGLRenderConfig
  
  // 相机
  camera: CameraConfig
  
  // 环境
  environment: EnvironmentConfig
  
  // 文字对象
  text3D: Text3DConfig
  textMaterial: MaterialConfig
  textAnimation: Animation3D
  
  // 光源
  lights: LightConfig[]
  
  // 粒子系统
  particles?: Particle3DConfig[]
  
  // 后期处理
  postProcessing?: PostProcessingConfig
  
  // 时长
  duration: number
  loop: boolean
}

// ============================================
// 预设类型
// ============================================

export type WebGLPresetType = 
  | 'metallic-shine'      // 金属光泽
  | 'neon-glow'          // 霓虹发光
  | 'glass-refraction'   // 玻璃折射
  | 'holographic'        // 全息投影
  | 'particle-explosion' // 粒子爆炸
  | 'glitch-cyberpunk'   // 故障赛博朋克
  | 'golden-luxury'      // 金色奢华
  | 'ice-crystal'        // 冰晶质感
  | 'fire-trail'         // 火焰轨迹
  | 'magic-portal'       // 魔法传送门








