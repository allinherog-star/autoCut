'use client';

/**
 * VEIR 视频合成测试页面
 * 测试基于 VEIR DSL 的视频合成导出功能
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Download,
  FileVideo,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  RefreshCw,
  Eye,
  Code,
  Layers,
  Clock,
  Film,
  Sparkles,
} from 'lucide-react';

import type { VEIRProject } from '@/lib/veir/types';

// 测试项目数据
import complexDemo from '@/lib/veir/test-projects/complex-demo.json';
import multiTrackDemo from '@/lib/veir/test-projects/multi-track-demo.json';
import advancedMotionDemo from '@/lib/veir/test-projects/advanced-motion-demo.json';
import timeWarpDemo from '@/lib/veir/test-projects/timewarp-demo.json';
import exampleProject from '@/lib/veir/example-project.json';

// ============================================
// 类型定义
// ============================================

type CompositionStage = 'idle' | 'parsing' | 'loading' | 'rendering' | 'encoding' | 'complete' | 'error';

interface TestProject {
  id: string;
  name: string;
  description: string;
  data: VEIRProject;
  badge?: string;
}

// 测试项目列表
const testProjects: TestProject[] = [
  {
    id: 'complex-demo',
    name: '🎬 复杂演示',
    description: '多轨道、多动画、滤镜效果综合测试',
    data: complexDemo as unknown as VEIRProject,
    badge: '推荐',
  },
  {
    id: 'timewarp-demo',
    name: '⏱️ TimeWarp 变速',
    description: 'adjustments.video.timeWarp（恒定变速）演示',
    data: timeWarpDemo as unknown as VEIRProject,
    badge: '新',
  },
  {
    id: 'advanced-motion',
    name: '🎥 高级动画',
    description: '关键帧运动、缓动函数、弹簧物理动画',
    data: advancedMotionDemo as unknown as VEIRProject,
    badge: '新',
  },
  {
    id: 'multi-track',
    name: '📊 多轨道测试',
    description: '6 轨道并行，步骤计数器叠加效果',
    data: multiTrackDemo as unknown as VEIRProject,
  },
  {
    id: 'example',
    name: '📝 基础示例',
    description: 'VEIR 规范基础示例项目',
    data: exampleProject as unknown as VEIRProject,
  },
];

// ============================================
// 工具函数
// ============================================

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// 组件
// ============================================

// 项目统计卡片
function StatsCard({ project }: { project: VEIRProject }) {
  const stats = {
    tracks: project.timeline.tracks.length,
    clips: project.timeline.tracks.reduce((sum, t) => sum + t.clips.length, 0),
    assets: Object.keys(project.assets.assets).length,
    duration: project.meta.duration,
    resolution: project.meta.resolution,
    fps: project.meta.fps,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Layers className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{stats.tracks}</div>
          <div className="text-xs text-gray-400">轨道</div>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Film className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{stats.clips}</div>
          <div className="text-xs text-gray-400">片段</div>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{stats.duration}s</div>
          <div className="text-xs text-gray-400">时长</div>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3 col-span-2 md:col-span-1">
        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">
            {stats.resolution[0]}×{stats.resolution[1]}
          </div>
          <div className="text-xs text-gray-400">{stats.fps} FPS</div>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3 col-span-2">
        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{stats.assets} 个素材</div>
          <div className="text-xs text-gray-400">
            {Object.keys(project.vocabulary.expressions).length} 动画 · 
            {Object.keys(project.vocabulary.presets).length} 预设
          </div>
        </div>
      </div>
    </div>
  );
}

// 时间轴预览
function TimelinePreview({ project }: { project: VEIRProject }) {
  const { tracks } = project.timeline;
  const duration = project.meta.duration;

  const getTrackColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-500';
      case 'audio': return 'bg-green-500';
      case 'text': return 'bg-yellow-500';
      case 'pip': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div key={track.id} className="flex items-center gap-2">
          <div className="w-20 text-xs text-gray-400 truncate">{track.type}</div>
          <div className="flex-1 h-6 bg-gray-800 rounded relative">
            {track.clips.map((clip) => {
              const left = (clip.time.start / duration) * 100;
              const width = ((clip.time.end - clip.time.start) / duration) * 100;
              return (
                <div
                  key={clip.id}
                  className={`absolute top-0.5 bottom-0.5 rounded ${getTrackColor(track.type)} opacity-80`}
                  style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
                  title={`${clip.asset}: ${clip.time.start}s - ${clip.time.end}s`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// 进度指示器
function ProgressIndicator({
  stage,
  progress,
  message,
}: {
  stage: CompositionStage;
  progress: number;
  message: string;
}) {
  const getStageInfo = () => {
    switch (stage) {
      case 'parsing': return { label: '解析项目', color: 'bg-blue-500' };
      case 'loading': return { label: '加载资源', color: 'bg-purple-500' };
      case 'rendering': return { label: '渲染帧', color: 'bg-yellow-500' };
      case 'encoding': return { label: '编码视频', color: 'bg-green-500' };
      case 'complete': return { label: '完成', color: 'bg-emerald-500' };
      case 'error': return { label: '错误', color: 'bg-red-500' };
      default: return { label: '就绪', color: 'bg-gray-500' };
    }
  };

  const info = getStageInfo();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{info.label}</span>
        <span className="text-white font-mono">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${info.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}

// ============================================
// 主页面
// ============================================

export default function VEIRComposerTestPage() {
  const [selectedProject, setSelectedProject] = useState<TestProject>(testProjects[0]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [compositionStage, setCompositionStage] = useState<CompositionStage>('idle');
  const [compositionProgress, setCompositionProgress] = useState(0);
  const [compositionMessage, setCompositionMessage] = useState('');
  const [result, setResult] = useState<{ url: string; size: number; duration: number; format: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // 验证项目（客户端简化版）
  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    setValidationResult(null);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 500));
      
      // 客户端简化验证
      const project = selectedProject.data;
      const errors: string[] = [];
      
      if (!project.meta) errors.push('缺少 meta 配置');
      if (!project.assets?.assets) errors.push('缺少 assets 配置');
      if (!project.timeline?.tracks?.length) errors.push('缺少 timeline 轨道');
      if (!project.vocabulary) errors.push('缺少 vocabulary 配置');
      
      // 检查时间轴引用
      project.timeline?.tracks?.forEach(track => {
        track.clips?.forEach(clip => {
          if (!project.assets?.assets?.[clip.asset]) {
            errors.push(`片段 ${clip.id} 引用了不存在的素材: ${clip.asset}`);
          }
        });
      });

      setValidationResult({
        valid: errors.length === 0,
        message: errors.length === 0 
          ? '✅ 验证通过！VEIR 项目结构完整。'
          : `❌ 验证失败！发现 ${errors.length} 个问题:\n${errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')}`,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsValidating(false);
    }
  }, [selectedProject]);

  // 开始合成
  const handleCompose = useCallback(async () => {
    setIsComposing(true);
    setCompositionStage('idle');
    setCompositionProgress(0);
    setResult(null);
    setError(null);

    try {
      // 动态导入合成器（仅客户端）
      const { VEIRComposer, downloadComposition } = await import('@/lib/veir/composer');

      const composer = new VEIRComposer(selectedProject.data);

      const compositionResult = await composer.compose(
        { format: 'webm', videoBitrate: 4000000 },
        (stage, progress, message) => {
          setCompositionStage(stage);
          setCompositionProgress(progress);
          setCompositionMessage(message);
        }
      );

      setResult({
        url: compositionResult.downloadUrl,
        size: compositionResult.size,
        duration: compositionResult.duration,
        format: compositionResult.format,
      });

      setCompositionStage('complete');
      composer.destroy();
    } catch (err) {
      console.error('Composition error:', err);
      setError((err as Error).message);
      setCompositionStage('error');
    } finally {
      setIsComposing(false);
    }
  }, [selectedProject]);

  // 下载视频
  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `veir-export-${Date.now()}.${result.format}`;
    link.click();
  }, [result]);

  // 切换项目时重置状态
  useEffect(() => {
    setValidationResult(null);
    setResult(null);
    setError(null);
    setCompositionStage('idle');
  }, [selectedProject]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            VEIR 视频合成器
          </motion.h1>
          <motion.p
            className="text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            基于 VEIR DSL 规范的视频合成导出测试
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：项目选择和配置 */}
          <div className="space-y-6">
            {/* 项目选择器 */}
            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileVideo className="w-5 h-5 text-blue-400" />
                选择测试项目
              </h2>

              {/* 下拉选择器 */}
              <div className="relative mb-4">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedProject.name.split(' ')[0]}</span>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {selectedProject.name.slice(2)}
                        {selectedProject.badge && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {selectedProject.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{selectedProject.description}</div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-20 shadow-xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {testProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition-colors ${
                            project.id === selectedProject.id ? 'bg-gray-700' : ''
                          }`}
                        >
                          <span className="text-2xl">{project.name.split(' ')[0]}</span>
                          <div className="text-left">
                            <div className="text-white font-medium flex items-center gap-2">
                              {project.name.slice(2)}
                              {project.badge && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                  {project.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{project.description}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 项目统计 */}
              <StatsCard project={selectedProject.data} />
            </motion.div>

            {/* 时间轴预览 */}
            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  时间轴预览
                </h2>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  {showCode ? '隐藏 JSON' : '查看 JSON'}
                </button>
              </div>

              {showCode ? (
                <pre className="bg-gray-950 rounded-lg p-4 text-xs text-gray-300 overflow-auto max-h-64 font-mono">
                  {JSON.stringify(selectedProject.data, null, 2)}
                </pre>
              ) : (
                <TimelinePreview project={selectedProject.data} />
              )}
            </motion.div>

            {/* 操作按钮 */}
            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex gap-3">
                <button
                  onClick={handleValidate}
                  disabled={isValidating || isComposing}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {isValidating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  验证项目
                </button>
                <button
                  onClick={handleCompose}
                  disabled={isComposing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-blue-500/25"
                >
                  {isComposing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  开始合成
                </button>
              </div>

              {/* 验证结果 */}
              {validationResult && (
                <motion.div
                  className={`mt-4 p-4 rounded-xl ${
                    validationResult.valid
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2">
                    {validationResult.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={validationResult.valid ? 'text-green-400' : 'text-red-400'}>
                      {validationResult.valid ? '验证通过' : '验证失败'}
                    </span>
                  </div>
                  <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap">
                    {validationResult.message}
                  </pre>
                </motion.div>
              )}

              {/* 错误信息 */}
              {error && (
                <motion.div
                  className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>合成错误</span>
                  </div>
                  <p className="mt-2 text-sm text-red-300">{error}</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* 右侧：预览和结果 */}
          <div className="space-y-6">
            {/* 预览区域 */}
            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" />
                预览 / 结果
              </h2>

              <div
                className="relative bg-black rounded-xl overflow-hidden"
                style={{ aspectRatio: '9/16', maxHeight: '500px' }}
              >
                {result ? (
                  <video
                    ref={videoRef}
                    src={result.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    {isComposing ? (
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
                        <p className="text-white font-medium">合成中...</p>
                      </div>
                    ) : (
                      <>
                        <FileVideo className="w-16 h-16 mb-4 opacity-30" />
                        <p>点击"开始合成"生成视频</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 进度条 */}
              {isComposing && compositionStage !== 'idle' && (
                <div className="mt-4">
                  <ProgressIndicator
                    stage={compositionStage}
                    progress={compositionProgress}
                    message={compositionMessage}
                  />
                </div>
              )}

              {/* 结果信息 */}
              {result && (
                <motion.div
                  className="mt-4 p-4 bg-gray-800/50 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">{formatDuration(result.duration)}</div>
                      <div className="text-xs text-gray-400">时长</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{formatBytes(result.size)}</div>
                      <div className="text-xs text-gray-400">大小</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white uppercase">{result.format}</div>
                      <div className="text-xs text-gray-400">格式</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleDownload}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
                    >
                      <Download className="w-4 h-4" />
                      下载视频
                    </button>
                    <button
                      onClick={handleCompose}
                      className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      重新合成
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* 说明 */}
            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">💡 说明</h2>
              <div className="space-y-3 text-sm text-gray-400">
                <p>
                  本测试页面展示了基于 <code className="px-1.5 py-0.5 bg-gray-800 rounded">VEIR DSL</code> 规范的视频合成能力：
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>支持多轨道时间轴渲染（视频、音频、文本、画中画）</li>
                  <li>支持多种动画效果（弹跳、滑入、缩放、渐变等）</li>
                  <li>支持文字样式预设（综艺、信息、科技、强调等）</li>
                  <li>支持视频滤镜（暖色调、复古、提亮等）</li>
                  <li>基于 Canvas + MediaRecorder 实现浏览器端渲染</li>
                </ul>
                <p className="text-gray-500 text-xs mt-4">
                  ⚠️ 注意：首次合成可能需要较长时间加载资源，请耐心等待。
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

