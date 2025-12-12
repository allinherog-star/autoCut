/**
 * WebGL 3D 花字渲染器
 * 基于 React Three Fiber 的高性能 3D 渲染
 */

'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import * as React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text3D, Center, Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { WebGLFancyTextScene } from './types'

// ============================================
// 3D 文字组件
// ============================================

interface Text3DObjectProps {
  config: WebGLFancyTextScene
  currentTime: number
}

function Text3DObject({ config, currentTime }: Text3DObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { text3D, textMaterial, textAnimation } = config

  // 计算动画进度
  const progress = useMemo(() => {
    if (!textAnimation) return 0
    return Math.min(1, currentTime / textAnimation.duration)
  }, [currentTime, textAnimation])

  // 插值关键帧
  const animatedProps = useMemo(() => {
    if (!textAnimation || textAnimation.keyframes.length === 0) {
      return { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 }
    }

    const keyframes = textAnimation.keyframes
    let startFrame = keyframes[0]
    let endFrame = keyframes[keyframes.length - 1]

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
        startFrame = keyframes[i]
        endFrame = keyframes[i + 1]
        break
      }
    }

    const segmentDuration = endFrame.time - startFrame.time
    const segmentProgress = segmentDuration === 0 ? 0 : (progress - startFrame.time) / segmentDuration

    // 插值
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    return {
      position: [
        lerp(startFrame.position?.[0] ?? 0, endFrame.position?.[0] ?? 0, segmentProgress),
        lerp(startFrame.position?.[1] ?? 0, endFrame.position?.[1] ?? 0, segmentProgress),
        lerp(startFrame.position?.[2] ?? 0, endFrame.position?.[2] ?? 0, segmentProgress),
      ],
      rotation: [
        lerp(startFrame.rotation?.[0] ?? 0, endFrame.rotation?.[0] ?? 0, segmentProgress),
        lerp(startFrame.rotation?.[1] ?? 0, endFrame.rotation?.[1] ?? 0, segmentProgress),
        lerp(startFrame.rotation?.[2] ?? 0, endFrame.rotation?.[2] ?? 0, segmentProgress),
      ],
      scale: typeof endFrame.scale === 'number'
        ? lerp(typeof startFrame.scale === 'number' ? startFrame.scale : 1, endFrame.scale, segmentProgress)
        : 1,
    }
  }, [progress, textAnimation])

  // 创建材质
  const material = useMemo(() => {
    switch (textMaterial.type) {
      case 'standard':
        return new THREE.MeshStandardMaterial({
          color: textMaterial.color || '#ffffff',
          metalness: textMaterial.metalness ?? 0.5,
          roughness: textMaterial.roughness ?? 0.5,
          emissive: textMaterial.emissive || '#000000',
          emissiveIntensity: textMaterial.emissiveIntensity ?? 0,
        })
      case 'phong':
        return new THREE.MeshPhongMaterial({
          color: textMaterial.color || '#ffffff',
          emissive: textMaterial.emissive || '#000000',
          specular: '#ffffff',
          shininess: 100,
        })
      case 'toon':
        return new THREE.MeshToonMaterial({
          color: textMaterial.color || '#ffffff',
        })
      default:
        return new THREE.MeshStandardMaterial({
          color: textMaterial.color || '#ffffff',
        })
    }
  }, [textMaterial])

  return (
    <Center>
      <Text3D
        ref={meshRef}
        font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
        size={text3D.size}
        height={text3D.height}
        curveSegments={text3D.curveSegments}
        bevelEnabled={text3D.bevelEnabled}
        bevelThickness={text3D.bevelThickness}
        bevelSize={text3D.bevelSize}
        bevelSegments={text3D.bevelSegments}
        position={animatedProps.position as [number, number, number]}
        rotation={animatedProps.rotation as [number, number, number]}
        scale={animatedProps.scale}
      >
        {config.text3D.text}
        <primitive object={material} attach="material" />
      </Text3D>
    </Center>
  )
}

// ============================================
// 粒子系统
// ============================================

function ParticleSystem({ count = 1000, spread = 10 }: { count?: number; spread?: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread

      const color = new THREE.Color()
      color.setHSL(Math.random(), 0.8, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, colors }
  }, [count, spread])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} />
    </points>
  )
}

// ============================================
// 光源组件
// ============================================

function Lights({ config }: { config: WebGLFancyTextScene }) {
  return (
    <>
      {config.lights.map((light, index) => {
        switch (light.type) {
          case 'ambient':
            return <ambientLight key={index} color={light.color} intensity={light.intensity} />
          case 'directional':
            return (
              <directionalLight
                key={index}
                color={light.color}
                intensity={light.intensity}
                position={light.position || [5, 5, 5]}
                castShadow={light.castShadow}
              />
            )
          case 'point':
            return (
              <pointLight
                key={index}
                color={light.color}
                intensity={light.intensity}
                position={light.position || [0, 5, 0]}
                castShadow={light.castShadow}
              />
            )
          case 'spot':
            return (
              <spotLight
                key={index}
                color={light.color}
                intensity={light.intensity}
                position={light.position || [0, 10, 0]}
                castShadow={light.castShadow}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

// ============================================
// 场景组件
// ============================================

function Scene({ config, currentTime }: { config: WebGLFancyTextScene; currentTime: number }) {
  return (
    <>
      {/* 相机 */}
      <PerspectiveCamera
        makeDefault
        position={config.camera.position}
        fov={config.camera.fov || 75}
      />

      {/* 控制器 */}
      <OrbitControls enableDamping dampingFactor={0.05} />

      {/* 光源 */}
      <Lights config={config} />

      {/* 环境光 */}
      <Environment preset="sunset" />

      {/* 3D 文字 */}
      <Text3DObject config={config} currentTime={currentTime} />

      {/* 粒子系统 */}
      {config.particles && <ParticleSystem count={500} spread={15} />}

      {/* 后期处理 */}
      {config.postProcessing?.enabled && (
        <EffectComposer>
          {config.postProcessing.effects.map((effect, index) => {
            switch (effect.type) {
              case 'bloom':
                return (
                  <Bloom
                    key={index}
                    intensity={effect.strength || 1}
                    luminanceThreshold={0.2}
                    luminanceSmoothing={0.9}
                  />
                )
              case 'chromaticAberration':
                return (
                  <ChromaticAberration
                    key={index}
                    offset={[effect.strength || 0.002, effect.strength || 0.002] as [number, number]}
                  />
                )
              case 'vignette':
                return <Vignette key={index} darkness={effect.strength || 0.5} />
              default:
                return null
            }
          })}
        </EffectComposer>
      )}
    </>
  )
}

// ============================================
// 主渲染器组件
// ============================================

interface WebGLFancyTextRendererProps {
  scene: WebGLFancyTextScene
  autoPlay?: boolean
  className?: string
}

export function WebGLFancyTextRenderer({
  scene,
  autoPlay = true,
  className = '',
}: WebGLFancyTextRendererProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  useEffect(() => {
    if (!isPlaying) return

    let startTime = Date.now()
    let animationFrameId: number

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      setCurrentTime(elapsed % scene.duration)
      
      if (scene.loop || elapsed < scene.duration) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isPlaying, scene.duration, scene.loop])

  return (
    <div className={`webgl-fancy-text-renderer ${className}`}>
      <Canvas
        shadows
        camera={{ position: scene.camera.position, fov: scene.camera.fov || 75 }}
        gl={{
          antialias: scene.renderConfig.antialias,
          alpha: scene.renderConfig.alpha,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        style={{
          width: '100%',
          height: 600,
          background: scene.environment.backgroundColor || 'transparent',
        }}
      >
        <Scene config={scene} currentTime={currentTime} />
      </Canvas>

      {/* 控制器 */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
        </button>
        <span className="text-sm text-gray-400">
          {currentTime.toFixed(2)}s / {scene.duration.toFixed(2)}s
        </span>
      </div>
    </div>
  )
}

export default WebGLFancyTextRenderer
