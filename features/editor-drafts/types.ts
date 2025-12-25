import type { VEIRProject } from '@/lib/veir/types'

export interface VeirDraftRecord {
  id: string
  veir: VEIRProject
  revision: number
  createdAt: number
  updatedAt: number
  name?: string
}


