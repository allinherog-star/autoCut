/**
 * WebGL 3D 花字渲染器
 * 基于 React Three Fiber 的高性能 3D 渲染
 */

'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import * as React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { WebGLFancyTextScene } from './types'
import { ChineseText3D } from './components/ChineseText3D'

// ============================================
// 3D 文字组件
// ============================================

interface Text3DObjectProps {
  config: WebGLFancyTextScene
  currentTime: number
}

function Text3DObject({ config, currentTime }: Text3DObjectProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { text3D, textMaterial, textAnimation } = config

  // 计算动画进度
  const progress = useMemo(() => {
    if (!textAnimation) return 1  // 无动画时显示最终状态
    const p = Math.min(1, currentTime / textAnimation.duration)
    console.log('Animation progress:', p, 'currentTime:', currentTime)
    return p
  }, [currentTime, textAnimation])

  // 插值关键帧
  const animatedProps = useMemo(() => {
    if (!textAnimation || textAnimation.keyframes.length === 0) {
      return { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 }
    }

    const keyframes = textAnimation.keyframes

    // 找到当前进度对应的关键帧区间
    let startFrame = keyframes[0]
    let endFrame = keyframes[0]

    // 如果进度为0，返回第一帧
    if (progress === 0) {
      return {
        position: startFrame.position || [0, 0, 0],
        rotation: startFrame.rotation || [0, 0, 0],
        scale: startFrame.scale ?? 1,
      }
    }

    // 如果进度为1，返回最后一帧
    if (progress >= 1) {
      const lastFrame = keyframes[keyframes.length - 1]
      return {
        position: lastFrame.position || [0, 0, 0],
        rotation: lastFrame.rotation || [0, 0, 0],
        scale: lastFrame.scale ?? 1,
      }
    }

    // 找到进度所在的关键帧区间
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

    const result = {
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
      scale: lerp(
        typeof startFrame.scale === 'number' ? startFrame.scale : 1,
        typeof endFrame.scale === 'number' ? endFrame.scale : 1,
        segmentProgress
      ),
    }

    console.log('Animated props:', { progress, segmentProgress, result })
    return result
  }, [progress, textAnimation])

  // 创建材质
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: textMaterial.color || '#ffffff',
      metalness: textMaterial.metalness ?? 0.5,
      roughness: textMaterial.roughness ?? 0.5,
      emissive: textMaterial.emissive || '#000000',
      emissiveIntensity: textMaterial.emissiveIntensity ?? 0,
    })
  }, [textMaterial])

  // 调试信息
  useEffect(() => {
    console.log('Text3DObject mounted, text:', text3D.text)
    console.log('Material:', textMaterial)
    console.log('Animation:', textAnimation)
  }, [text3D.text, textMaterial, textAnimation])

  return (
    <Center>
      <group
        ref={groupRef}
        position={animatedProps.position as [number, number, number]}
        rotation={animatedProps.rotation as [number, number, number]}
        scale={animatedProps.scale}
      >
        <ChineseText3D
          text={text3D.text}
          fontSize={text3D.size}
          color={textMaterial.color || '#FFD700'}
          emissive={textMaterial.emissive || '#FFA500'}
          emissiveIntensity={textMaterial.emissiveIntensity ?? 1.5}
          metalness={textMaterial.metalness ?? 0.9}
          roughness={textMaterial.roughness ?? 0.1}
          outlineWidth={text3D.bevelEnabled ? text3D.bevelThickness * 0.5 : 0}
          outlineColor="#000000"
        />
      </group>
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
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
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
                return <React.Fragment key={index} />
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

  // 当场景改变时，重新开始动画
  useEffect(() => {
    console.log('Scene changed, restarting animation')
    setCurrentTime(0)
    setIsPlaying(true)
  }, [scene])

  useEffect(() => {
    if (!isPlaying || !scene) return

    console.log('Starting animation, duration:', scene.duration, 'loop:', scene.loop)
    let startTime = Date.now()
    let animationFrameId: number

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const time = scene.loop ? elapsed % scene.duration : Math.min(elapsed, scene.duration)
      setCurrentTime(time)

      if (scene.loop || elapsed < scene.duration) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
        console.log('Animation ended')
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => {
      console.log('Cleaning up animation')
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPlaying, scene?.duration, scene?.loop])

  // 防御性检查
  if (!scene || !scene.renderConfig) {
    return (
      <div className={`webgl-fancy-text-renderer ${className}`}>
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`webgl-fancy-text-renderer ${className}`}>
      <div style={{ width: '100%', height: '600px', position: 'relative', background: '#0a0a0a', borderRadius: '8px', overflow: 'hidden' }}>
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
            height: '100%',
            display: 'block',
          }}
        >
          <Scene config={scene} currentTime={currentTime} />
        </Canvas>
      </div>

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
        <div className="flex-1"></div>
        <span className="text-xs text-gray-500">
          💡 鼠标拖动旋转 | 滚轮缩放
        </span>
      </div>
    </div>
  )
}

export default WebGLFancyTextRenderer
