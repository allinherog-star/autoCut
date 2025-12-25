'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { VEIRProject } from '@/lib/veir/types'
import fullFeatureDemo from '@/lib/veir/test-projects/full-feature-edit-demo.json'
import { createDraft } from '@/features/editor-drafts/idb'

/**
 * 新建创作会话（本地草稿）
 * - 创建 draftId + 初始 VEIRProject
 * - 跳转到 /editor/[draftId]/edit
 */
export default function NewEditorDraftPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const record = await createDraft({
        initialVeir: fullFeatureDemo as unknown as VEIRProject,
        name: '未命名草稿',
      })
      if (cancelled) return
      router.replace(`/editor/${record.id}/edit`)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [router])

  return <div className="min-h-screen bg-surface-950" />
}


