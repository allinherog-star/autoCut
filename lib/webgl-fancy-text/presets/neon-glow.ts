/**
 * WebGL 预设: 霓虹发光
 * 赛博朋克霓虹效果，适合现代感、科技感内容
 */

import type { WebGLFancyTextScene } from '../types'

export const NEON_GLOW_PRESET: WebGLFancyTextScene = {
  id: 'webgl-neon-glow',
  name: '霓虹发光 - 赛博朋克',
  description: '霓虹灯发光效果，强烈的色彩对比和辉光，适合科技、游戏、潮流主题',
  
  renderConfig: {
    width: 1920,
    height: 1080,
    antialias: true,
    alpha: true,
    pixelRatio: 2,
    shadowMap: false,
    toneMapping: 'aces',
  },
  
  camera: {
    type: 'perspective',
    fov: 60,
    position: [0, 0, 8],
    lookAt: [0, 0, 0],
  },
  
  environment: {
    background: 'color',
    backgroundColor: '#0a0a0a',
    fog: {
      enabled: true,
      color: '#1a0033',
      near: 3,
      far: 20,
    },
  },
  
  text3D: {
    text: '赛博朋克',
    fontUrl: '/fonts/Noto_Sans_SC_Black_Regular.json',
    size: 2.5,
    height: 0.3,
    curveSegments: 16,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.03,
    bevelSegments: 5,
  },
  
  textMaterial: {
    type: 'standard',
    color: '#000000',
    metalness: 0.1,
    roughness: 0.8,
    emissive: '#00FFFF',
    emissiveIntensity: 2,
  },
  
  textAnimation: {
    duration: 4,
    keyframes: [
      { 
        time: 0, 
        position: [0, 0, -5],
        scale: 0,
        opacity: 0,
      },
      { 
        time: 0.3, 
        position: [0, 0, 0],
        scale: 1.1,
        opacity: 1,
        easing: 'elastic',
      },
      { 
        time: 0.6, 
        scale: 0.98,
      },
      { 
        time: 1, 
        position: [0, 0, 0],
        rotation: [0, Math.PI * 2, 0],
        scale: 1,
      },
    ],
    loop: true,
  },
  
  lights: [
    {
      type: 'ambient',
      color: '#1a1a2e',
      intensity: 0.3,
    },
    {
      type: 'point',
      color: '#00FFFF',
      intensity: 3,
      position: [0, 5, 3],
    },
    {
      type: 'point',
      color: '#FF00FF',
      intensity: 2,
      position: [-5, -2, 5],
    },
    {
      type: 'point',
      color: '#FFFF00',
      intensity: 2,
      position: [5, 0, 5],
    },
  ],
  
  particles: [
    {
      count: 1000,
      size: 0.03,
      colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
      spread: 20,
      speed: 0.5,
      life: 3,
      shape: 'sphere',
    },
  ],
  
  postProcessing: {
    enabled: true,
    effects: [
      {
        type: 'bloom',
        strength: 2.5,
      },
      {
        type: 'chromaticAberration',
        strength: 0.003,
      },
      {
        type: 'vignette',
        strength: 0.7,
      },
    ],
  },
  
  duration: 4,
  loop: true,
}

export function createNeonGlow(text: string, color: string = '#00FFFF'): WebGLFancyTextScene {
  return {
    ...NEON_GLOW_PRESET,
    text3D: {
      ...NEON_GLOW_PRESET.text3D,
      text,
    },
    textMaterial: {
      ...NEON_GLOW_PRESET.textMaterial,
      emissive: color,
    },
  }
}

