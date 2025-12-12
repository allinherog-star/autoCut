'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

function AnimatedText() {
  const groupRef = useRef<THREE.Group>(null)
  const [scale, setScale] = useState(0)
  
  // 创建 Canvas 纹理
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    
    canvas.width = 2048
    canvas.height = 512
    
    context.font = 'bold 150px "PingFang SC", "Microsoft YaHei", sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    // 描边
    context.strokeStyle = '#000000'
    context.lineWidth = 10
    context.lineJoin = 'round'
    context.strokeText('笑死我了', canvas.width / 2, canvas.height / 2)
    
    // 填充
    context.fillStyle = '#FFD700'
    context.fillText('笑死我了', canvas.width / 2, canvas.height / 2)
    
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [])
  
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      color: '#ffffff',
      emissive: new THREE.Color('#FFA500'),
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.1,
    })
  }, [texture])
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      const newScale = Math.sin(time * 2) * 0.3 + 1
      groupRef.current.scale.set(newScale, newScale, newScale)
      groupRef.current.rotation.y = time * 0.5
      setScale(newScale)
    }
  })
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, 5, 5]} color="#FFD700" intensity={2} />
      
      <group ref={groupRef}>
        <mesh material={material}>
          <planeGeometry args={[4, 1]} />
        </mesh>
      </group>
      
      <OrbitControls />
      
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </>
  )
}

export default function WebGLSimpleTest() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">WebGL 动画测试（简化版）</h1>
        <p className="text-gray-400 mb-8">如果这个页面的文字有动画，说明 WebGL 系统本身是正常的</p>
        
        <div style={{ 
          width: '100%', 
          height: '600px', 
          background: '#0a0a0a',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            gl={{ antialias: true }}
          >
            <AnimatedText />
          </Canvas>
        </div>
        
        <div className="mt-4 text-gray-400">
          <p>✅ 预期效果：文字应该持续旋转和缩放</p>
          <p>💡 鼠标拖动可以旋转视角</p>
        </div>
      </div>
    </div>
  )
}

