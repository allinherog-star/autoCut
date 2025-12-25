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

import type { VEIRProject } from '@/lib/veir/types'
import type { VeirDraftRecord } from './types'

const DB_NAME = 'autocut'
const DB_VERSION = 1
const STORE_DRAFTS = 'drafts'

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB drafts store is only available in the browser')
  }
}

function openDraftsDb(): Promise<IDBDatabase> {
  assertBrowser()

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'))
  })
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'))
    tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction error'))
  })
}

function idbGet<T>(store: IDBObjectStore, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error || new Error('IndexedDB get failed'))
  })
}

function idbPut(store: IDBObjectStore, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.put(value)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error || new Error('IndexedDB put failed'))
  })
}

export async function getDraft(draftId: string): Promise<VeirDraftRecord | null> {
  const db = await openDraftsDb()
  const tx = db.transaction(STORE_DRAFTS, 'readonly')
  const store = tx.objectStore(STORE_DRAFTS)
  const record = await idbGet<VeirDraftRecord>(store, draftId)
  await txDone(tx)
  db.close()
  return record ?? null
}

export async function putDraft(input: {
  id: string
  veir: VEIRProject
  expectedRevision?: number
  name?: string
}): Promise<VeirDraftRecord> {
  const now = Date.now()
  const db = await openDraftsDb()
  const tx = db.transaction(STORE_DRAFTS, 'readwrite')
  const store = tx.objectStore(STORE_DRAFTS)

  const prev = await idbGet<VeirDraftRecord>(store, input.id)
  if (typeof input.expectedRevision === 'number' && prev && prev.revision !== input.expectedRevision) {
    tx.abort()
    db.close()
    throw new Error(`Draft revision conflict: expected ${input.expectedRevision}, got ${prev.revision}`)
  }

  const next: VeirDraftRecord = {
    id: input.id,
    veir: input.veir,
    revision: (prev?.revision ?? 0) + 1,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    name: input.name ?? prev?.name,
  }

  await idbPut(store, next)
  await txDone(tx)
  db.close()
  return next
}

export async function createDraft(input: {
  id: string
  initialVeir: VEIRProject
  name?: string
}): Promise<VeirDraftRecord> {
  const existing = await getDraft(input.id)
  if (existing) return existing
  // expectedRevision undefined -> allow create
  const created = await putDraft({ id: input.id, veir: input.initialVeir, expectedRevision: undefined, name: input.name })
  // putDraft increments from 0; so created.revision=1
  return created
}


