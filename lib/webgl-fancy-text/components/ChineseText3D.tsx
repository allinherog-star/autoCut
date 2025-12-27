/**
 * 支持中文的 3D 文字组件
 * 使用 Canvas 2D 纹理渲染中文
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ChineseText3DProps {
  text: string
  fontSize?: number
  color?: string
  emissive?: string
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
  outlineWidth?: number
  outlineColor?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export function ChineseText3D({
  text,
  fontSize = 1.5,
  color = '#FFD700',
  emissive = '#FFA500',
  emissiveIntensity = 1.5,
  metalness = 0.9,
  roughness = 0.1,
  outlineWidth = 0,
  outlineColor = '#000000',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: ChineseText3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // 创建 Canvas 纹理
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    
    // 设置画布大小
    canvas.width = 2048
    canvas.height = 512
    
    // 设置字体（使用系统中文字体）
    context.font = `bold ${fontSize * 100}px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    
    // 清空画布
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // 绘制描边
    if (outlineWidth > 0) {
      context.strokeStyle = outlineColor
      context.lineWidth = outlineWidth * 100
      context.lineJoin = 'round'
      context.strokeText(text, canvas.width / 2, canvas.height / 2)
    }
    
    // 绘制文字
    context.fillStyle = color
    context.fillText(text, canvas.width / 2, canvas.height / 2)
    
    // 创建纹理
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    
    return tex
  }, [text, fontSize, color, outlineWidth, outlineColor])
  
  // 创建材质
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      color: '#ffffff',
      emissive: new THREE.Color(emissive),
      emissiveIntensity,
      metalness,
      roughness,
    })
  }, [texture, emissive, emissiveIntensity, metalness, roughness])
  
  // 计算文字宽高比
  const aspect = text.length * 0.6 // 粗略估计中文字符宽度
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[scale * aspect, scale, scale]}
      material={material}
    >
      <planeGeometry args={[4, 1]} />
    </mesh>
  )
}

















