import { ref, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import { useAdminAuth } from '@/composables/useAdminAuth'

export interface Concert {
  tag: string
  name?: string
  hasSheetWebhook: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateConcertBody {
  tag: string
  name?: string
  sheetWebhook?: string
}

export interface UpdateConcertBody {
  name?: string
  sheetWebhook?: string | null
}

export type ApiError = Error & { status?: number }

export const SHEET_WEBHOOK_PREFIX = 'https://script.google.com/macros/'

// API calls only; safe to use in any component (no fetch on mount, no socket)
export function useConcertApi() {
  const { adminFetch } = useAdminAuth()

  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await adminFetch(path, init)
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      const error: ApiError = new Error(result.message || `HTTP ${response.status}`)
      error.status = response.status
      throw error
    }
    return result
  }

  const getConcerts = () =>
    request<{ activeTag: string, concerts: Concert[] }>('/api/concerts')

  const createConcert = (body: CreateConcertBody) =>
    request<{ activeTag: string, bookingOpen: boolean, seatCount: number, concert: Concert }>('/api/concerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

  const updateConcert = (tag: string, body: UpdateConcertBody) =>
    request<{ concert: Concert }>(`/api/concerts/${encodeURIComponent(tag)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

  return {
    getConcerts,
    createConcert,
    updateConcert
  }
}

// Concert list (newest first) kept in sync through the concertChanged event
export function useConcerts() {
  const concerts = ref<Concert[]>([])
  const activeTag = ref<string | null>(null)
  // Starts true: the list is fetched as soon as the component mounts
  const loading = ref(true)
  const { getConcerts } = useConcertApi()
  let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null

  const fetchConcerts = async () => {
    loading.value = true
    try {
      const result = await getConcerts()
      activeTag.value = result.activeTag
      concerts.value = result.concerts
    } catch (error) {
      console.error('Failed to fetch concerts:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchConcerts()

    socket = io(import.meta.env.VITE_API_BASE_URL)
    socket.on('concertChanged', fetchConcerts)
  })

  onUnmounted(() => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  })

  return {
    concerts,
    activeTag,
    loading,
    fetchConcerts
  }
}
