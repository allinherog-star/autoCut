'use client'

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEditor } from '../../layout'

import { TimelineViewer } from '@/components/editor/timeline'
import { useTimelineStore } from '@/lib/timeline/store'
import { convertVEIRToTimeline, applyChangeToVEIR } from '@/lib/timeline/veir-converter'
import type { VEIRProject } from '@/lib/veir/types'

import {
  MaterialList,
  MaterialOperations,
  AIChatPanel,
  UnifiedPreviewPanel,
} from '@/components/editor/edit'


import fullFeatureDemo from '@/lib/veir/test-projects/full-feature-edit-demo.json'
import { createDraft, getDraft } from '@/features/editor-drafts/idb'
import { createDraftAutosaver } from '@/features/editor-drafts/autosave'

type PageProps = { params: Promise<{ draftId: string }> }

function applyClipTransformToVEIR(
  veir: VEIRProject,
  clipId: string,
  patch: { xPercent?: number; yPercent?: number; scale?: number; rotation?: number }
): VEIRProject {
  const [w, h] = veir.meta.resolution

  const prev = veir.adjustments?.clipOverrides?.[clipId]?.video?.transform
  const prevOffset = prev?.offset

  const xPercent = typeof patch.xPercent === 'number' ? patch.xPercent : undefined
  const yPercent = typeof patch.yPercent === 'number' ? patch.yPercent : undefined
  const nextOffset =
    typeof xPercent === 'number' || typeof yPercent === 'number'
      ? ([
        typeof xPercent === 'number' ? (xPercent / 100) * w : (prevOffset?.[0] ?? w * 0.5),
        typeof yPercent === 'number' ? (yPercent / 100) * h : (prevOffset?.[1] ?? h * 0.5),
      ] as [number, number])
      : prevOffset

  // VEIR Transform.scale 语义：1 = 100%（ratio），UI 侧传入的是百分比（100=100%）
  const nextScale = typeof patch.scale === 'number' ? patch.scale / 100 : prev?.scale
  const nextRotation = typeof patch.rotation === 'number' ? patch.rotation : prev?.rotation

  return {
    ...veir,
    adjustments: {
      ...veir.adjustments,
      clipOverrides: {
        ...veir.adjustments?.clipOverrides,
        [clipId]: {
          ...veir.adjustments?.clipOverrides?.[clipId],
          video: {
            ...veir.adjustments?.clipOverrides?.[clipId]?.video,
            transform: {
              ...veir.adjustments?.clipOverrides?.[clipId]?.video?.transform,
              offset: nextOffset,
              scale: nextScale,
              rotation: nextRotation,
            },
          },
        },
      },
    },
  }
}

export default function DraftEditPage({ params }: PageProps) {
  const { draftId: routeDraftId } = use(params)
  const { setVeirProject, hideBottomBar, targetDevice, deviceConfig, markStepCompleted, currentStep, goToNextStep } =
    useEditor()

  const { data, playback, loadData, _tick } = useTimelineStore()

  const [veirProject, setLocalVeirProject] = useState<VEIRProject | null>(null)
  const [draftRevision, setDraftRevision] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 播放动画循环（沿用现有时间轴 store 的 tick）
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // 选中状态
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  // autosave
  const autosaver = useMemo(() => {
    if (!routeDraftId) return null
    return createDraftAutosaver({
      draftId: routeDraftId,
      debounceMs: 800,
      onSaved: (record) => setDraftRevision(record.revision),
      onError: (e) => setError(e.message),
    })
  }, [routeDraftId])

  // 加载/创建草稿
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const id = routeDraftId
        const existing = await getDraft(id)
        const record =
          existing ??
          (await createDraft({
            id,
            initialVeir: fullFeatureDemo as unknown as VEIRProject,
            name: '未命名草稿',
          }))

        if (cancelled) return
        setLocalVeirProject(record.veir)
        setDraftRevision(record.revision)
        setVeirProject(record.veir)
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [routeDraftId, setVeirProject])

  // 初始化时间轴数据（从 VEIR → Timeline UI）
  useEffect(() => {
    if (!veirProject) return
    loadData(convertVEIRToTimeline(veirProject))
  }, [loadData, veirProject])

  // 把 VEIR 写入 EditorLayout context（供其他页面使用）
  useEffect(() => {
    setVeirProject(veirProject)
    // 关键：不要在本页面 unmount 时清空 veirProject
    // 否则从 /editor/[draftId]/edit 跳转到 /editor/[draftId]/export 时，
    // export 页面会读到 null 并回退到 demo 项目，导致“导出与预览不一致”。
    // 草稿数据本身由 autosave 写入 IndexedDB；EditorLayout context 负责跨步骤传递同一份 veirProject。
    return () => {}
  }, [setVeirProject, veirProject])

  // 自动保存：VEIR 变更后防抖写入 IndexedDB
  useEffect(() => {
    if (!autosaver) return
    if (!veirProject) return
    autosaver.schedule({ veir: veirProject, expectedRevision: draftRevision ?? undefined })
  }, [autosaver, veirProject, draftRevision])

  useEffect(() => {
    return () => autosaver?.destroy()
  }, [autosaver])

  // 订阅时间轴事件，将 UI 操作写回 VEIR（patch/delta）
  useEffect(() => {
    if (!veirProject) return

    const unsubscribe = useTimelineStore.getState().subscribe((event) => {
      setLocalVeirProject((prev) => {
        if (!prev) return prev
        const next = (() => {
          switch (event.type) {
            case 'track:added':
              return applyChangeToVEIR(prev, { type: 'track:added', track: event.track })
            case 'track:removed':
              return applyChangeToVEIR(prev, { type: 'track:removed', trackId: event.trackId })
            case 'clip:added':
              return applyChangeToVEIR(prev, { type: 'clip:added', trackId: event.trackId, clip: event.clip })
            case 'clip:removed':
              return applyChangeToVEIR(prev, { type: 'clip:removed', trackId: event.trackId, clipId: event.clipId })
            case 'clip:updated':
              return applyChangeToVEIR(prev, {
                type: 'clip:updated',
                trackId: event.trackId,
                clipId: event.clipId,
                updates: event.updates,
              })
            case 'clip:moved':
              return applyChangeToVEIR(prev, {
                type: 'clip:moved',
                clipId: event.clipId,
                fromTrackId: event.fromTrackId,
                toTrackId: event.toTrackId,
                newTime: event.newTime,
              })
            default:
              return prev
          }
        })()
        setVeirProject(next)
        return next
      })
    })

    return () => unsubscribe()
  }, [setVeirProject, veirProject])

  // 播放动画循环
  useEffect(() => {
    if (!playback.isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const deltaTime = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time
      _tick(deltaTime)
      animationRef.current = requestAnimationFrame(animate)
    }

    lastTimeRef.current = 0
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [playback.isPlaying, _tick])

  // 隐藏 layout 的底部操作栏（本页面自带底部栏）
  useEffect(() => {
    hideBottomBar()
    return () => hideBottomBar()
  }, [hideBottomBar])

  const handleFinishEdit = useCallback(() => {
    markStepCompleted(currentStep)
    goToNextStep()
  }, [markStepCompleted, currentStep, goToNextStep])

  const handleSelectClip = useCallback((clipId: string, trackId: string) => {
    setSelectedClipId(clipId)
    setSelectedTrackId(trackId)
  }, [])

  const handleClipTransformChange = useCallback(
    (clipId: string, patch: { xPercent?: number; yPercent?: number; scale?: number; rotation?: number }) => {
      setLocalVeirProject((prev) => {
        if (!prev) return prev
        const next = applyClipTransformToVEIR(prev, clipId, patch)
        setVeirProject(next)
        return next
      })
    },
    [setVeirProject]
  )

  const trackCount = data.tracks.length
  const clipCount = data.tracks.reduce((acc, t) => acc + t.clips.length, 0)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (isLoading) {
    return <div className="absolute inset-0 bg-[#0f0f12]" />
  }

  if (!veirProject) {
    return (
      <div className="p-6 text-surface-200">
        <p className="text-sm text-red-400">加载草稿失败：{error ?? '未知错误'}</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0f0f12]">
      <div className="flex-1 flex min-h-0">
        <div className="w-64 flex-shrink-0 border-r border-[#2a2a2e] bg-[#141417]">
          <MaterialList
            selectedClipId={selectedClipId}
            onSelectClip={handleSelectClip}
            veirProject={veirProject}
            className="h-full"
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-[260px] flex-shrink-0 border-b border-[#2a2a2e] bg-[#141417]">
            <MaterialOperations
              selectedClipId={selectedClipId}
              selectedTrackId={selectedTrackId}
              veirProject={veirProject}
              className="h-full"
            />
          </div>
          <div className="flex-1 min-h-0">
            <AIChatPanel
              selectedClipId={selectedClipId}
              selectedTrackId={selectedTrackId}
              veirProject={veirProject}
              className="h-full"
            />
          </div>
        </div>

        <div className="w-[480px] flex-shrink-0 border-l border-[#2a2a2e]">
          <UnifiedPreviewPanel
            selectedClipId={selectedClipId}
            selectedTrackId={selectedTrackId}
            veirProject={veirProject}
            targetDevice={targetDevice}
            deviceConfig={deviceConfig}
            onClipTransformChange={handleClipTransformChange}
            onSelectClip={handleSelectClip}
            className="h-full"
          />
        </div>
      </div>

      <TimelineViewer className="h-[180px] flex-shrink-0" />

      <div className="h-14 px-6 flex items-center justify-between bg-[#1a1a1e] border-t border-[#2a2a2e] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <span className="text-amber-400">✨</span>
          </div>
          <div>
            <p className="font-medium text-sm text-[#eee]">草稿：{routeDraftId}</p>
            <p className="text-xs text-[#888]">
              总时长 {formatTime(playback.duration)} · {trackCount} 轨道 · {clipCount} 片段 · rev{' '}
              {draftRevision ?? '-'}
            </p>
          </div>
        </div>
        <button
          onClick={handleFinishEdit}
          className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-[#111] font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-amber-400/20"
        >
          完成编辑，导出视频
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}


