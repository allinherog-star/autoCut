/**
 * WebGL 预设: 金属光泽
 * 金色奢华特效，适合片头、获奖、重要公告
 */

import type { WebGLFancyTextScene } from '../types'

export const METALLIC_SHINE_PRESET: WebGLFancyTextScene = {
  id: 'webgl-metallic-shine',
  name: '金属光泽 - 奢华登场',
  description: '金色金属质感，带光泽反射和辉光效果，适合片头主标题、获奖公告',
  
  renderConfig: {
    width: 1920,
    height: 1080,
    antialias: true,
    alpha: true,
    pixelRatio: 2,
    shadowMap: true,
    toneMapping: 'aces',
  },
  
  camera: {
    type: 'perspective',
    fov: 50,
    position: [0, 0, 10],
    lookAt: [0, 0, 0],
    animation: {
      duration: 3,
      keyframes: [
        { time: 0, position: [0, 0, 15] },
        { time: 0.5, position: [0, 0, 10], easing: 'easeOut' },
        { time: 1, position: [0, 0, 10] },
      ],
    },
  },
  
  environment: {
    background: 'gradient',
    backgroundGradient: {
      topColor: '#1a0033',
      bottomColor: '#000011',
    },
    fog: {
      enabled: true,
      color: '#000033',
      near: 5,
      far: 30,
    },
  },
  
  text3D: {
    text: '一见你就笑',
    fontUrl: '/fonts/Noto_Sans_SC_Black_Regular.json',
    size: 2,
    height: 0.5,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.05,
    bevelSegments: 8,
  },
  
  textMaterial: {
    type: 'standard',
    color: '#FFD700',
    metalness: 0.95,
    roughness: 0.15,
    emissive: '#FFA500',
    emissiveIntensity: 0.3,
  },
  
  textAnimation: {
    duration: 3,
    keyframes: [
      { 
        time: 0, 
        position: [0, 0, 0],
        rotation: [0, -Math.PI * 0.5, 0],
        scale: 0,
      },
      { 
        time: 0.4, 
        position: [0, 0, 0],
        rotation: [0, Math.PI * 0.1, 0],
        scale: 1.2,
        easing: 'spring',
      },
      { 
        time: 0.7, 
        rotation: [0, -Math.PI * 0.05, 0],
        scale: 0.95,
      },
      { 
        time: 1, 
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
      },
    ],
    loop: true,
    yoyo: false,
  },
  
  lights: [
    {
      type: 'ambient',
      color: '#404040',
      intensity: 0.5,
    },
    {
      type: 'directional',
      color: '#ffffff',
      intensity: 1.5,
      position: [5, 10, 7],
      castShadow: true,
    },
    {
      type: 'point',
      color: '#FFD700',
      intensity: 2,
      position: [-5, 5, 5],
    },
    {
      type: 'point',
      color: '#FFA500',
      intensity: 1.5,
      position: [5, -3, 8],
    },
  ],
  
  particles: [
    {
      count: 500,
      size: 0.05,
      colors: ['#FFD700', '#FFA500', '#FFFFFF'],
      spread: 15,
      speed: 0.2,
      life: 5,
      shape: 'star',
    },
  ],
  
  postProcessing: {
    enabled: true,
    effects: [
      {
        type: 'bloom',
        strength: 1.5,
      },
      {
        type: 'chromaticAberration',
        strength: 0.001,
      },
    ],
  },
  
  duration: 3,
  loop: true,
}

export function createMetallicShine(text: string): WebGLFancyTextScene {
  return {
    ...METALLIC_SHINE_PRESET,
    text3D: {
      ...METALLIC_SHINE_PRESET.text3D,
      text,
    },
  }
}

