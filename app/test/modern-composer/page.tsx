'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Play, Download, Eye, Zap } from 'lucide-react';

/**
 * Modern Composer 预览页面
 * 展示 Fabric.js + Anime.js + MediaBunny 集成
 */
export default function ModernComposerPreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'fabric' | 'anime' | 'compose'>('fabric');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Fabric.js 演示
  const [fabricEngine, setFabricEngine] = useState<any>(null);

  // Anime.js 演示
  const [animeType, setAnimeType] = useState('fade-in');

  // MediaBunny 演示
  const [videoFormat, setVideoFormat] = useState<'mp4' | 'webm'>('mp4');
  const [videoQuality, setVideoQuality] = useState<'high' | 'medium' | 'low'>('high');

  // 初始化 Fabric 画布
  useEffect(() => {
    if (activeTab === 'fabric' && canvasRef.current && !fabricEngine) {
      initFabricDemo();
    }
  }, [activeTab]);

  const initFabricDemo = async () => {
    try {
      const { FabricEngine } = await import('@/lib/modern-composer/fabric');

      const engine = new FabricEngine({
        width: 800,
        height: 450,
        backgroundColor: '#1a1a2e',
      });

      // 添加背景矩形
      engine.addRect({
        id: 'bg-rect',
        type: 'rect',
        x: 400,
        y: 225,
        width: 700,
        height: 350,
        fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        rx: 20,
        ry: 20,
      });

      // 添加文本
      engine.addText({
        id: 'title-text',
        type: 'text',
        content: 'Modern Composer',
        x: 400,
        y: 180,
        fontSize: 48,
        fontWeight: 'bold',
        fill: '#ffffff',
        shadow: 'rgba(0,0,0,0.3) 0 4px 10px',
      });

      engine.addText({
        id: 'subtitle-text',
        type: 'text',
        content: 'Fabric.js + Anime.js + MediaBunny',
        x: 400,
        y: 240,
        fontSize: 20,
        fill: '#e0e0e0',
      });

      // 渲染
      engine.render();

      setFabricEngine(engine);
      setMessage('Fabric.js 画布已初始化');
    } catch (error) {
      console.error('Failed to initialize Fabric:', error);
      setMessage(`错误: ${error}`);
    }
  };

  const playAnimeDemo = async () => {
    if (!fabricEngine) {
      setMessage('请先初始化 Fabric 画布');
      return;
    }

    setIsPlaying(true);
    setMessage('播放动画...');

    try {
      // Anime.js v4 使用 createTimeline 代替 anime.timeline
      const { createTimeline } = await import('animejs');

      // 重置元素状态
      fabricEngine.applyRenderState('title-text', {
        x: 400,
        y: 180,
        opacity: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
      });

      fabricEngine.applyRenderState('subtitle-text', {
        x: 400,
        y: 240,
        opacity: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
      });

      fabricEngine.render();

      // 创建动画状态对象
      const titleState = { opacity: 0, y: 0, scale: 1, rotate: 0 };
      const subtitleState = { opacity: 0, y: 0, scale: 1, rotate: 0 };

      // 根据动画类型设置参数
      let animConfig: any = {};

      switch (animeType) {
        case 'fade-in':
          animConfig = { opacity: [0, 1] };
          break;
        case 'zoom-in':
          animConfig = { opacity: [0, 1], scale: [0.5, 1] };
          break;
        case 'slide-up':
          animConfig = { opacity: [0, 1], y: [50, 0] };
          break;
        case 'bounce-in':
          animConfig = { opacity: [0, 1], scale: [0.3, 1], y: [80, 0] };
          break;
        case 'rotate-in':
          animConfig = { opacity: [0, 1], rotate: [-180, 0], scale: [0.5, 1] };
          break;
        case 'blur-in':
          animConfig = { opacity: [0, 1] };
          break;
        case 'elastic-in':
          animConfig = { opacity: [0, 1], scale: [0, 1] };
          break;
        case 'pop':
          animConfig = { scale: [1, 1.2, 1] };
          break;
        case 'shake':
          animConfig = { x: [0, -10, 10, -10, 10, 0] };
          break;
        case 'swing':
          animConfig = { rotate: [0, 15, -10, 5, -5, 0] };
          break;
        case 'pulse':
          animConfig = { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] };
          break;
        default:
          animConfig = { opacity: [0, 1] };
      }

      // 更新 Fabric 渲染的函数
      const updateFabric = () => {
        fabricEngine.applyRenderState('title-text', {
          y: 180 + (titleState.y || 0),
          opacity: titleState.opacity,
          scaleX: titleState.scale,
          scaleY: titleState.scale,
          angle: titleState.rotate || 0,
        });

        fabricEngine.applyRenderState('subtitle-text', {
          y: 240 + (subtitleState.y || 0),
          opacity: subtitleState.opacity,
          scaleX: subtitleState.scale,
          scaleY: subtitleState.scale,
          angle: subtitleState.rotate || 0,
        });

        fabricEngine.render();
      };

      // 创建时间轴 (Anime.js v4 API)
      const timeline = createTimeline({
        defaults: {
          ease: 'outExpo',
        },
        onUpdate: updateFabric,
        onComplete: () => {
          setIsPlaying(false);
          setMessage('动画完成');
        },
      });

      // 添加标题动画
      timeline.add(titleState, {
        duration: 1000,
        ...animConfig,
      });

      // 添加副标题动画（延迟）
      timeline.add(subtitleState, {
        duration: 1000,
        ...animConfig,
      }, '-=800'); // 重叠 800ms

    } catch (error) {
      console.error('Animation failed:', error);
      setMessage(`错误: ${error}`);
      setIsPlaying(false);
    }
  };

  const composeVideo = async () => {
    if (!fabricEngine) {
      setMessage('请先初始化 Fabric 画布');
      return;
    }

    setIsPlaying(true);
    setProgress(0);
    setMessage('开始合成视频...');

    try {
      const { composeFromCanvas } = await import('@/lib/modern-composer/webcodecs');

      const canvas = fabricEngine.getCanvasElement();
      const duration = 3; // 3秒视频
      const frameRate = 30;

      const result = await composeFromCanvas({
        canvas,
        duration,
        frameRate,
        format: videoFormat,
        quality: videoQuality,
        renderFrame: async (time, frameIndex) => {
          // 动态渲染每一帧
          const progress = time / duration;

          // 标题动画
          fabricEngine.applyRenderState('title-text', {
            opacity: Math.min(progress * 2, 1),
            y: 180 - 50 * Math.max(0, 1 - progress * 2),
            scaleX: 0.5 + 0.5 * Math.min(progress * 2, 1),
            scaleY: 0.5 + 0.5 * Math.min(progress * 2, 1),
          });

          // 副标题动画（延迟0.2秒）
          const subtitleProgress = Math.max(0, (time - 0.2) / duration);
          fabricEngine.applyRenderState('subtitle-text', {
            opacity: Math.min(subtitleProgress * 2, 1),
            y: 240 - 50 * Math.max(0, 1 - subtitleProgress * 2),
          });

          // 背景旋转
          fabricEngine.applyRenderState('bg-rect', {
            angle: progress * 10,
          });

          fabricEngine.render();
        },
        onProgress: (prog, stage, msg) => {
          setProgress(Math.round(prog));
          setMessage(`${stage}: ${msg}`);
        },
      });

      setVideoUrl(result.downloadUrl);
      setMessage(`视频合成完成！大小: ${(result.size / 1024 / 1024).toFixed(2)} MB`);
      setIsPlaying(false);
    } catch (error) {
      console.error('Composition failed:', error);
      setMessage(`错误: ${error}`);
      setIsPlaying(false);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;

    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `modern-composer-demo.${videoFormat}`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Zap className="text-yellow-400" size={48} />
            Modern Composer 预览
          </h1>
          <p className="text-xl text-gray-300">
            基于 Fabric.js + Anime.js + MediaBunny 的现代化视频合成系统
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧: 画布预览 */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-slate-800/50 backdrop-blur border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Eye size={24} />
                  实时预览
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={initFabricDemo}
                    disabled={isPlaying}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    重置画布
                  </Button>
                </div>
              </div>

              {/* Canvas 容器 */}
              <div className="bg-slate-900 rounded-lg p-4 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={450}
                  className="rounded-lg shadow-2xl"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {/* 进度条 */}
              {isPlaying && progress > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                    <span>{message}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {!isPlaying && message && (
                <div className="mt-4 p-3 bg-slate-700 rounded-lg text-gray-300 text-sm">
                  {message}
                </div>
              )}
            </Card>

            {/* 视频预览 */}
            {videoUrl && (
              <Card className="mt-6 p-6 bg-slate-800/50 backdrop-blur border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4">视频输出</h2>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg shadow-2xl"
                />
                <Button
                  onClick={downloadVideo}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700"
                >
                  <Download size={20} className="mr-2" />
                  下载视频
                </Button>
              </Card>
            )}
          </div>

          {/* 右侧: 控制面板 */}
          <div className="space-y-6">
            {/* Fabric.js 控制 */}
            <Card className="p-6 bg-slate-800/50 backdrop-blur border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">🎨 Fabric.js 画布</h3>
              <p className="text-gray-300 text-sm mb-4">
                对象模型、SVG 解析、滤镜效果
              </p>
              <Button
                onClick={initFabricDemo}
                disabled={isPlaying}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500"
              >
                初始化画布
              </Button>
            </Card>

            {/* Anime.js 控制 */}
            <Card className="p-6 bg-slate-800/50 backdrop-blur border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">✨ Anime.js 动画</h3>
              <p className="text-gray-300 text-sm mb-4">
                关键帧、时间轴、30+ 缓动函数
              </p>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">动画类型</label>
                <select
                  value={animeType}
                  onChange={(e) => setAnimeType(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                >
                  <option value="fade-in">淡入</option>
                  <option value="zoom-in">缩放进入</option>
                  <option value="slide-up">上滑进入</option>
                  <option value="bounce-in">弹跳进入</option>
                  <option value="rotate-in">旋转进入</option>
                  <option value="blur-in">模糊进入</option>
                  <option value="elastic-in">弹性进入</option>
                  <option value="pop">弹出</option>
                  <option value="shake">抖动</option>
                  <option value="swing">摇摆</option>
                  <option value="pulse">脉冲</option>
                </select>
              </div>

              <Button
                onClick={playAnimeDemo}
                disabled={isPlaying || !fabricEngine}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                <Play size={20} className="mr-2" />
                播放动画
              </Button>
            </Card>

            {/* MediaBunny 控制 */}
            <Card className="p-6 bg-slate-800/50 backdrop-blur border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">🎬 MediaBunny 合成</h3>
              <p className="text-gray-300 text-sm mb-4">
                MP4/WebM、硬件加速、帧级控制
              </p>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">输出格式</label>
                <select
                  value={videoFormat}
                  onChange={(e) => setVideoFormat(e.target.value as any)}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                >
                  <option value="mp4">MP4 (H.264)</option>
                  <option value="webm">WebM (VP9)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">视频质量</label>
                <select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value as any)}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                >
                  <option value="high">高质量 (8 Mbps)</option>
                  <option value="medium">中质量 (4 Mbps)</option>
                  <option value="low">低质量 (2 Mbps)</option>
                </select>
              </div>

              <Button
                onClick={composeVideo}
                disabled={isPlaying || !fabricEngine}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500"
              >
                <Zap size={20} className="mr-2" />
                合成视频
              </Button>
            </Card>

            {/* 技术栈信息 */}
            <Card className="p-6 bg-slate-800/50 backdrop-blur border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">⚡ 技术栈</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Fabric.js</span>
                  <span className="text-green-400">v7.0.0</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Anime.js</span>
                  <span className="text-green-400">v4.2.2</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>MediaBunny</span>
                  <span className="text-green-400">v1.27.1</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>WebCodecs</span>
                  <span className="text-green-400">Native</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

