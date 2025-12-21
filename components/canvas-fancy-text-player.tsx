'use client'

import { useEffect, useRef, useState } from 'react'
import { CanvasFancyTextRenderer } from '@/lib/canvas-fancy-text/renderer'
import type { CanvasFancyTextScene } from '@/lib/canvas-fancy-text/types'

interface CanvasFancyTextPlayerProps {
  scene: CanvasFancyTextScene
  autoPlay?: boolean
  loop?: boolean
  onComplete?: () => void
  className?: string
}

export function CanvasFancyTextPlayer({
  scene,
  autoPlay = true,
  loop = false,
  onComplete,
  className = '',
}: CanvasFancyTextPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<CanvasFancyTextRenderer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // 初始化渲染器
  useEffect(() => {
    if (!canvasRef.current) return

    const renderer = new CanvasFancyTextRenderer()
    renderer.init(canvasRef.current, scene.renderConfig)
    renderer.loadScene({ ...scene, loop })
    rendererRef.current = renderer

    if (autoPlay) {
      renderer.play()
      setIsPlaying(true)
    }

    return () => {
      renderer.destroy()
    }
  }, [scene, loop, autoPlay])

  // 播放控制
  const play = () => {
    rendererRef.current?.play()
    setIsPlaying(true)
  }

  const pause = () => {
    rendererRef.current?.pause()
    setIsPlaying(false)
  }

  const stop = () => {
    rendererRef.current?.stop()
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const seek = (time: number) => {
    rendererRef.current?.seek(time)
    setCurrentTime(time)
  }

  return (
    <div className={`canvas-fancy-text-player ${className}`}>
      {/* Canvas 画布 */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{
          maxWidth: scene.renderConfig.width,
          aspectRatio: `${scene.renderConfig.width} / ${scene.renderConfig.height}`,
        }}
      />
      
      {/* 播放控制器 */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={isPlaying ? pause : play}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
        </button>
        
        <button
          onClick={stop}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ⏹️ 停止
        </button>
        
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={scene.duration}
            step={0.01}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <span className="text-sm text-gray-600">
          {currentTime.toFixed(2)}s / {scene.duration.toFixed(2)}s
        </span>
      </div>
      
      {/* 场景信息 */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold text-lg">{scene.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{scene.description}</p>
        <div className="mt-2 flex gap-2 flex-wrap">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {scene.renderConfig.width}x{scene.renderConfig.height}
          </span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            {scene.renderConfig.fps}fps
          </span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
            {scene.layers.length} 图层
          </span>
        </div>
      </div>
    </div>
  )
}



