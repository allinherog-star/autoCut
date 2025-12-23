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
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'fabric' | 'anime' | 'compose'>('fabric');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Fabric.js 演示
  const [fabricEngine, setFabricEngine] = useState<any>(null);
  const fabricEngineRef = useRef<any>(null); // 用于 cleanup

  // Anime.js 演示
  const [animeType, setAnimeType] = useState('fade-in');

  // MediaBunny 演示
  const [videoFormat, setVideoFormat] = useState<'mp4' | 'webm'>('mp4');
  const [videoQuality, setVideoQuality] = useState<'high' | 'medium' | 'low'>('high');

  // 初始化 Fabric 画布
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    if (activeTab === 'fabric' && containerRef.current && !fabricEngine && !isInitialized) {
      // 延迟初始化，确保 DOM 完全挂载
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          initFabricDemo();
        }
      }, 100);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [activeTab, fabricEngine, isInitialized]);

  // Cleanup: 组件卸载时销毁 FabricEngine (单独的 useEffect)
  useEffect(() => {
    return () => {
      if (fabricEngineRef.current) {
        try {
          fabricEngineRef.current.destroy();
        } catch (e) {
          console.warn('FabricEngine cleanup error:', e);
        }
        fabricEngineRef.current = null;
      }
    };
  }, []);

  const initFabricDemo = async () => {
    try {
      setIsInitialized(true);
      const { FabricEngine } = await import('@/lib/modern-composer/fabric');

      // 先销毁之前的实例，防止 "already initialized" 错误
      if (fabricEngineRef.current) {
        try {
          fabricEngineRef.current.destroy();
        } catch (e) {
          console.warn('Previous engine cleanup error:', e);
        }
        fabricEngineRef.current = null;
        setFabricEngine(null);
      }

      // 使用容器 ref 获取容器
      const container = containerRef.current;
      if (!container) {
        throw new Error('Canvas container ref is not available');
      }

      // 清除容器中的旧 canvas
      container.innerHTML = '';

      // 创建新的 canvas 元素并添加到 DOM（Fabric.js v7 要求 canvas 已挂载）
      const newCanvas = document.createElement('canvas');
      newCanvas.width = 800;
      newCanvas.height = 450;
      newCanvas.className = 'rounded-lg shadow-2xl';
      newCanvas.style.cssText = 'max-width: 100%; height: auto;';
      // 必须先添加到 DOM，Fabric.js 才能正确初始化
      container.appendChild(newCanvas);

      // 确保 DOM 已更新
      await new Promise(resolve => requestAnimationFrame(resolve));

      // 使用已挂载的 canvas 初始化 FabricEngine
      const engine = new FabricEngine({
        width: 800,
        height: 450,
        backgroundColor: '#1a1a2e',
        canvas: newCanvas,
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

      fabricEngineRef.current = engine; // 保存到 ref 供 cleanup 使用
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
      // Anime.js v4 使用 animate 和 createTimeline API
      const { animate, createTimeline } = await import('animejs');

      // 重置元素状态
      fabricEngine.applyRenderState('title-text', {
        x: 400,
        y: 180,
        opacity: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        angle: 0,
      });

      fabricEngine.applyRenderState('subtitle-text', {
        x: 400,
        y: 240,
        opacity: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        angle: 0,
      });

      fabricEngine.render();

      // 创建动画状态对象 - 使用普通对象作为动画目标
      const titleState = { opacity: 0, y: 0, scale: 0.5, rotate: 0, x: 0 };
      const subtitleState = { opacity: 0, y: 0, scale: 0.5, rotate: 0, x: 0 };

      // 根据动画类型设置目标值
      let titleTarget: any = { opacity: 1, scale: 1, y: 0 };
      let subtitleTarget: any = { opacity: 1, scale: 1, y: 0 };

      switch (animeType) {
        case 'fade-in':
          titleTarget = { opacity: 1, scale: 1 };
          subtitleTarget = { opacity: 1, scale: 1 };
          break;
        case 'zoom-in':
          titleTarget = { opacity: 1, scale: 1 };
          subtitleTarget = { opacity: 1, scale: 1 };
          break;
        case 'slide-up':
          titleState.y = 50;
          subtitleState.y = 50;
          titleTarget = { opacity: 1, scale: 1, y: 0 };
          subtitleTarget = { opacity: 1, scale: 1, y: 0 };
          break;
        case 'bounce-in':
          titleState.y = 80;
          subtitleState.y = 80;
          titleState.scale = 0.3;
          subtitleState.scale = 0.3;
          titleTarget = { opacity: 1, scale: 1, y: 0 };
          subtitleTarget = { opacity: 1, scale: 1, y: 0 };
          break;
        case 'rotate-in':
          titleState.rotate = -180;
          subtitleState.rotate = -180;
          titleTarget = { opacity: 1, scale: 1, rotate: 0 };
          subtitleTarget = { opacity: 1, scale: 1, rotate: 0 };
          break;
        case 'blur-in':
          titleTarget = { opacity: 1, scale: 1 };
          subtitleTarget = { opacity: 1, scale: 1 };
          break;
        case 'elastic-in':
          titleState.scale = 0;
          subtitleState.scale = 0;
          titleTarget = { opacity: 1, scale: 1 };
          subtitleTarget = { opacity: 1, scale: 1 };
          break;
        case 'pop':
          titleState.opacity = 1;
          titleState.scale = 1;
          subtitleState.opacity = 1;
          subtitleState.scale = 1;
          titleTarget = { scale: [1, 1.2, 1] };
          subtitleTarget = { scale: [1, 1.2, 1] };
          break;
        case 'shake':
          titleState.opacity = 1;
          titleState.scale = 1;
          subtitleState.opacity = 1;
          subtitleState.scale = 1;
          titleTarget = { x: [0, -10, 10, -10, 10, 0] };
          subtitleTarget = { x: [0, -10, 10, -10, 10, 0] };
          break;
        case 'swing':
          titleState.opacity = 1;
          titleState.scale = 1;
          subtitleState.opacity = 1;
          subtitleState.scale = 1;
          titleTarget = { rotate: [0, 15, -10, 5, -5, 0] };
          subtitleTarget = { rotate: [0, 15, -10, 5, -5, 0] };
          break;
        case 'pulse':
          titleState.opacity = 1;
          titleState.scale = 1;
          subtitleState.opacity = 1;
          subtitleState.scale = 1;
          titleTarget = { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] };
          subtitleTarget = { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] };
          break;
        default:
          titleTarget = { opacity: 1, scale: 1 };
          subtitleTarget = { opacity: 1, scale: 1 };
      }

      // 更新 Fabric 渲染的函数
      const updateFabric = () => {
        fabricEngine.applyRenderState('title-text', {
          x: 400 + (titleState.x || 0),
          y: 180 + (titleState.y || 0),
          opacity: titleState.opacity,
          scaleX: titleState.scale,
          scaleY: titleState.scale,
          angle: titleState.rotate || 0,
        });

        fabricEngine.applyRenderState('subtitle-text', {
          x: 400 + (subtitleState.x || 0),
          y: 240 + (subtitleState.y || 0),
          opacity: subtitleState.opacity,
          scaleX: subtitleState.scale,
          scaleY: subtitleState.scale,
          angle: subtitleState.rotate || 0,
        });

        fabricEngine.render();
      };

      // 使用 Anime.js v4 的 animate API 驱动动画
      // 先为标题创建动画
      const titleAnim = animate(titleState, {
        ...titleTarget,
        duration: 1000,
        ease: 'outExpo',
        onUpdate: updateFabric,
      });

      // 延迟 200ms 后为副标题创建动画
      setTimeout(() => {
        animate(subtitleState, {
          ...subtitleTarget,
          duration: 1000,
          ease: 'outExpo',
          onUpdate: updateFabric,
          onComplete: () => {
            setIsPlaying(false);
            setMessage('动画完成');
          },
        });
      }, 200);

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
      const enterDuration = 0.8; // 入场动画持续时间（秒）

      console.log('[composeVideo] 使用动画类型:', animeType);

      const result = await composeFromCanvas({
        canvas,
        duration,
        frameRate,
        format: videoFormat,
        quality: videoQuality,
        renderFrame: async (time, frameIndex) => {
          // 动态渲染每一帧 - 使用用户选择的动画类型
          const progress = time / duration;
          const enterProgress = Math.min(1, time / enterDuration);
          const easedEnter = 1 - Math.pow(1 - enterProgress, 3); // easeOut

          // 根据动画类型计算标题状态
          let titleState = { x: 400, y: 180, opacity: 1, scaleX: 1, scaleY: 1, angle: 0 };
          let subtitleState = { x: 400, y: 240, opacity: 1, scaleX: 1, scaleY: 1, angle: 0 };

          // 副标题延迟
          const subtitleDelay = 0.2;
          const subtitleTime = Math.max(0, time - subtitleDelay);
          const subtitleEnterProgress = Math.min(1, subtitleTime / enterDuration);
          const subtitleEasedEnter = 1 - Math.pow(1 - subtitleEnterProgress, 3);

          switch (animeType) {
            case 'fade-in':
              titleState.opacity = easedEnter;
              subtitleState.opacity = subtitleEasedEnter;
              break;

            case 'zoom-in':
              titleState.opacity = easedEnter;
              titleState.scaleX = titleState.scaleY = 0.5 + 0.5 * easedEnter;
              subtitleState.opacity = subtitleEasedEnter;
              subtitleState.scaleX = subtitleState.scaleY = 0.5 + 0.5 * subtitleEasedEnter;
              break;

            case 'slide-up':
              titleState.opacity = easedEnter;
              titleState.y = 180 + 50 * (1 - easedEnter);
              subtitleState.opacity = subtitleEasedEnter;
              subtitleState.y = 240 + 50 * (1 - subtitleEasedEnter);
              break;

            case 'bounce-in':
              titleState.opacity = easedEnter;
              titleState.y = 180 + 80 * (1 - easedEnter);
              titleState.scaleX = titleState.scaleY = 0.3 + 0.7 * easedEnter;
              subtitleState.opacity = subtitleEasedEnter;
              subtitleState.y = 240 + 80 * (1 - subtitleEasedEnter);
              subtitleState.scaleX = subtitleState.scaleY = 0.3 + 0.7 * subtitleEasedEnter;
              break;

            case 'rotate-in':
              titleState.opacity = easedEnter;
              titleState.angle = -180 * (1 - easedEnter);
              titleState.scaleX = titleState.scaleY = 0.5 + 0.5 * easedEnter;
              subtitleState.opacity = subtitleEasedEnter;
              subtitleState.angle = -180 * (1 - subtitleEasedEnter);
              subtitleState.scaleX = subtitleState.scaleY = 0.5 + 0.5 * subtitleEasedEnter;
              break;

            case 'elastic-in':
              const elasticT = easedEnter;
              titleState.opacity = elasticT;
              titleState.scaleX = titleState.scaleY = elasticT * (1 + Math.sin(elasticT * Math.PI * 3) * 0.1 * (1 - elasticT));
              const subtitleElasticT = subtitleEasedEnter;
              subtitleState.opacity = subtitleElasticT;
              subtitleState.scaleX = subtitleState.scaleY = subtitleElasticT * (1 + Math.sin(subtitleElasticT * Math.PI * 3) * 0.1 * (1 - subtitleElasticT));
              break;

            case 'pop':
              // pop: 先入场，然后弹出效果
              if (enterProgress < 1) {
                titleState.opacity = easedEnter;
                titleState.scaleX = titleState.scaleY = easedEnter;
              } else {
                const popTime = time - enterDuration;
                const popCycle = Math.sin(popTime * 5) * 0.2;
                titleState.scaleX = titleState.scaleY = 1 + popCycle;
              }
              if (subtitleEnterProgress < 1) {
                subtitleState.opacity = subtitleEasedEnter;
                subtitleState.scaleX = subtitleState.scaleY = subtitleEasedEnter;
              } else {
                const subPopTime = subtitleTime - enterDuration;
                const subPopCycle = Math.sin(subPopTime * 5) * 0.2;
                subtitleState.scaleX = subtitleState.scaleY = 1 + subPopCycle;
              }
              break;

            case 'shake':
              // shake: 入场后持续抖动
              if (enterProgress < 1) {
                titleState.opacity = easedEnter;
              } else {
                // 持续抖动效果
                const shakeTime = time * 30;
                titleState.x = 400 + Math.sin(shakeTime) * 10;
              }
              if (subtitleEnterProgress < 1) {
                subtitleState.opacity = subtitleEasedEnter;
              } else {
                const subShakeTime = subtitleTime * 30;
                subtitleState.x = 400 + Math.sin(subShakeTime) * 10;
              }
              break;

            case 'swing':
              // swing: 入场后摇摆
              if (enterProgress < 1) {
                titleState.opacity = easedEnter;
              } else {
                const swingTime = (time - enterDuration) * 8;
                titleState.angle = Math.sin(swingTime) * 15 * Math.exp(-(time - enterDuration) * 0.5);
              }
              if (subtitleEnterProgress < 1) {
                subtitleState.opacity = subtitleEasedEnter;
              } else {
                const subSwingTime = (subtitleTime - enterDuration) * 8;
                subtitleState.angle = Math.sin(subSwingTime) * 15 * Math.exp(-(subtitleTime - enterDuration) * 0.5);
              }
              break;

            case 'pulse':
              // pulse: 入场后脉冲
              if (enterProgress < 1) {
                titleState.opacity = easedEnter;
              } else {
                const pulseTime = (time - enterDuration) * 6;
                const pulseScale = 1 + Math.sin(pulseTime) * 0.1;
                titleState.scaleX = titleState.scaleY = pulseScale;
                titleState.opacity = 0.8 + Math.sin(pulseTime) * 0.2;
              }
              if (subtitleEnterProgress < 1) {
                subtitleState.opacity = subtitleEasedEnter;
              } else {
                const subPulseTime = (subtitleTime - enterDuration) * 6;
                const subPulseScale = 1 + Math.sin(subPulseTime) * 0.1;
                subtitleState.scaleX = subtitleState.scaleY = subPulseScale;
                subtitleState.opacity = 0.8 + Math.sin(subPulseTime) * 0.2;
              }
              break;

            default:
              // 默认淡入
              titleState.opacity = easedEnter;
              subtitleState.opacity = subtitleEasedEnter;
          }

          // 应用状态到 Fabric 引擎
          fabricEngine.applyRenderState('title-text', {
            x: titleState.x,
            y: titleState.y,
            opacity: titleState.opacity,
            scaleX: titleState.scaleX,
            scaleY: titleState.scaleY,
            angle: titleState.angle,
          });

          fabricEngine.applyRenderState('subtitle-text', {
            x: subtitleState.x,
            y: subtitleState.y,
            opacity: subtitleState.opacity,
            scaleX: subtitleState.scaleX,
            scaleY: subtitleState.scaleY,
            angle: subtitleState.angle,
          });

          // 背景微旋转
          fabricEngine.applyRenderState('bg-rect', {
            angle: progress * 5,
          });

          fabricEngine.render();
        },
        onProgress: (prog, stage, msg) => {
          setProgress(Math.round(prog));
          setMessage(`${stage}: ${msg}`);
        },
      });

      setVideoUrl(result.downloadUrl);
      setMessage(`视频合成完成！大小: ${(result.size / 1024 / 1024).toFixed(2)} MB，动画类型: ${animeType}`);
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
                <div
                  ref={containerRef}
                  style={{ width: 800, height: 450, maxWidth: '100%' }}
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

