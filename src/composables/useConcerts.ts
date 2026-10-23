import { ref, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import { useAdminAuth } from '@/composables/useAdminAuth'

// Per-concert info shown to buyers; every field is null until set.
// Date-times come back as UTC ISO strings
export interface ConcertInfo {
  opentixUrl: string | null
  opentixOpenAt: string | null
  discountCode: string | null
  groupDiscountDeadline: string | null
  orderListUrl: string | null
  transferBankName: string | null
  transferBankCode: string | null
  transferBranchName: string | null
  transferBranchCode: string | null
  transferAccountNumber: string | null
  transferAccountName: string | null
}

export interface Concert extends ConcertInfo {
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

// null clears a field; empty strings are rejected by the API
export interface UpdateConcertBody extends Partial<ConcertInfo> {
  name?: string
  sheetWebhook?: string | null
}

// missingFields: required fields the backend found unset when opening booking
// or about to be cleared while booking is open
export type ApiError = Error & { status?: number, missingFields?: (keyof ConcertInfo)[] }

const INFO_FIELD_LABELS: Record<keyof ConcertInfo, string> = {
  opentixUrl: 'OPENTIX 購票連結',
  opentixOpenAt: 'OPENTIX 開放時間',
  discountCode: '折扣碼',
  groupDiscountDeadline: '團購截止日期',
  orderListUrl: '訂單列表連結',
  transferBankName: '銀行名稱',
  transferBankCode: '銀行代碼',
  transferBranchName: '分行名稱',
  transferBranchCode: '分行代碼',
  transferAccountNumber: '帳號',
  transferAccountName: '戶名'
}

export const formatInfoFields = (fields: (keyof ConcertInfo)[]) =>
  fields.map(field => INFO_FIELD_LABELS[field] ?? field).join('、')

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
      error.missingFields = result.missingFields
      throw error
    }
    return result
  }

  const getConcert = (tag: string) =>
    request<{ concert: Concert }>(`/api/concerts/${encodeURIComponent(tag)}`)

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
    getConcert,
    getConcerts,
    createConcert,
    updateConcert
  }
}

// Concert list (newest first) kept in sync through the concertChanged and concertUpdated events
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
    socket.on('concertUpdated', fetchConcerts)
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
