/**
 * 素材 API 客户端
 */

export type MediaType = 
  | 'VIDEO' 
  | 'IMAGE' 
  | 'AUDIO' 
  | 'SOUND_EFFECT'
  | 'FANCY_TEXT' 
  | 'FONT' 
  | 'STICKER' 
  | 'EFFECT' 
  | 'TRANSITION'
  | 'TEMPLATE'

export interface Media {
  id: string
  name: string
  filename: string
  type: MediaType
  mimeType: string
  size: number
  path: string
  duration: number | null
  width: number | null
  height: number | null
  thumbnailPath: string | null
  createdAt: string
  updatedAt: string
}

export interface MediaListResponse {
  items: Media[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

/**
 * 上传素材
 */
export async function uploadMedia(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<Media>> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    // 使用 XMLHttpRequest 来获取上传进度
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      }

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch {
          reject(new Error('Failed to parse response'))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error'))
      }

      xhr.open('POST', '/api/media')
      xhr.send(formData)
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      code: 'UPLOAD_ERROR',
    }
  }
}

// 素材来源类型
export type MediaSource = 'all' | 'system' | 'user'

/**
 * 获取素材列表
 */
export async function getMediaList(params?: {
  page?: number
  limit?: number
  type?: MediaType
  search?: string
  categories?: string[] // 分类标签 ID 列表
  source?: MediaSource // 素材来源：全部/系统/用户
}): Promise<ApiResponse<MediaListResponse>> {
  try {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.type) searchParams.set('type', params.type)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.categories && params.categories.length > 0) {
      searchParams.set('categories', params.categories.join(','))
    }
    if (params?.source && params.source !== 'all') {
      searchParams.set('source', params.source)
    }

    const url = `/api/media${searchParams.toString() ? `?${searchParams}` : ''}`
    const response = await fetch(url)
    return response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch media',
      code: 'FETCH_ERROR',
    }
  }
}

/**
 * 获取单个素材
 */
export async function getMedia(id: string): Promise<ApiResponse<Media>> {
  try {
    const response = await fetch(`/api/media/${id}`)
    return response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch media',
      code: 'FETCH_ERROR',
    }
  }
}

/**
 * 删除素材
 */
export async function deleteMedia(id: string): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
  try {
    const response = await fetch(`/api/media/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete media',
      code: 'DELETE_ERROR',
    }
  }
}

/**
 * 更新素材信息
 */
export async function updateMedia(
  id: string,
  data: Partial<Pick<Media, 'name' | 'duration' | 'width' | 'height'>>
): Promise<ApiResponse<Media>> {
  try {
    const response = await fetch(`/api/media/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update media',
      code: 'UPDATE_ERROR',
    }
  }
}

