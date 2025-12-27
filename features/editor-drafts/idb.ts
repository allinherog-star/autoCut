/**
 * 本地草稿存储（IndexedDB）
 * - 每个 draftId 对应一份 VEIRProject JSON（工程文件）
 * - 维护 revision（单调递增）用于并发保护/变更跟踪
 *
 * 说明：
 * - 该模块仅能在浏览器环境使用（IndexedDB）。
 */

import type { VEIRProject } from '@/lib/veir/types'
import { v4 as uuidv4 } from 'uuid'

const DB_NAME = 'autocut'
const DB_VERSION = 1
const STORE_NAME = 'veirDrafts'

export interface DraftRecord {
  id: string
  name: string
  veir: VEIRProject
  revision: number
  createdAt: number
  updatedAt: number
}

function assertBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('Draft storage is only available in the browser (IndexedDB).')
  }
}

function openDraftDB(): Promise<IDBDatabase> {
  assertBrowser()

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'))
  })
}

function makeId(provided?: string): string {
  if (provided && provided.trim()) return provided
  // 优先使用原生 randomUUID
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return uuidv4()
}

export async function getDraft(id: string): Promise<DraftRecord | null> {
  if (!id) return null
  try {
    const db = await openDraftDB()
    return await new Promise<DraftRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(id)
      req.onsuccess = () => resolve((req.result as DraftRecord | undefined) ?? null)
      req.onerror = () => reject(req.error ?? new Error('Failed to read draft'))
    })
  } catch {
    return null
  }
}

export async function createDraft(options: {
  id?: string
  name?: string
  initialVeir: VEIRProject
}): Promise<DraftRecord> {
  const id = makeId(options.id)
  const now = Date.now()
  const record: DraftRecord = {
    id,
    name: options.name ?? '未命名草稿',
    veir: options.initialVeir,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  }

  const db = await openDraftDB()
  return await new Promise<DraftRecord>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.add(record)
    req.onsuccess = () => resolve(record)
    req.onerror = () => reject(req.error ?? new Error('Failed to create draft'))
  })
}

export async function upsertDraft(options: {
  id: string
  veir: VEIRProject
  expectedRevision?: number
  name?: string
}): Promise<DraftRecord> {
  const { id, veir, expectedRevision, name } = options
  if (!id) throw new Error('draftId is required')

  assertBrowser()
  const db = await openDraftDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    const getReq = store.get(id)
    getReq.onerror = () => reject(getReq.error ?? new Error('Failed to read draft'))
    getReq.onsuccess = () => {
      const now = Date.now()
      const existing = (getReq.result as DraftRecord | undefined) ?? undefined

      if (existing && typeof expectedRevision === 'number' && existing.revision !== expectedRevision) {
        reject(
          new Error(
            `Draft revision conflict: expected ${expectedRevision}, got ${existing.revision}.`
          )
        )
        return
      }

      const next: DraftRecord = existing
        ? {
            ...existing,
            name: typeof name === 'string' ? name : existing.name,
            veir,
            revision: existing.revision + 1,
            updatedAt: now,
          }
        : {
            id,
            name: name ?? '未命名草稿',
            veir,
            revision: 1,
            createdAt: now,
            updatedAt: now,
          }

      const putReq = store.put(next)
      putReq.onerror = () => reject(putReq.error ?? new Error('Failed to write draft'))
      putReq.onsuccess = () => resolve(next)
    }
  })
}
