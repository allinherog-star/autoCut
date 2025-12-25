/**
 * 草稿自动保存（防抖）
 * - 将 VEIRProject 写入 IndexedDB
 * - 维护 revision（单调递增）
 */

import type { VEIRProject } from '@/lib/veir/types'
import { upsertDraft, type DraftRecord } from './idb'

export function createDraftAutosaver(options: {
  draftId: string
  debounceMs: number
  onSaved?: (record: DraftRecord) => void
  onError?: (error: Error) => void
}) {
  let timer: number | null = null
  let destroyed = false
  let lastPayload: { veir: VEIRProject; expectedRevision?: number } | null = null

  const flush = async () => {
    if (destroyed) return
    const payload = lastPayload
    lastPayload = null
    if (!payload) return

    try {
      const record = await upsertDraft({
        id: options.draftId,
        veir: payload.veir,
        expectedRevision: payload.expectedRevision,
      })
      options.onSaved?.(record)
    } catch (e) {
      options.onError?.(e as Error)
    }
  }

  return {
    schedule(payload: { veir: VEIRProject; expectedRevision?: number }) {
      if (destroyed) return
      lastPayload = payload
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        timer = null
        void flush()
      }, options.debounceMs)
    },
    async saveNow(payload: { veir: VEIRProject; expectedRevision?: number }) {
      if (destroyed) return
      lastPayload = payload
      if (timer) {
        window.clearTimeout(timer)
        timer = null
      }
      await flush()
    },
    destroy() {
      destroyed = true
      if (timer) {
        window.clearTimeout(timer)
        timer = null
      }
      lastPayload = null
    },
  }
}
