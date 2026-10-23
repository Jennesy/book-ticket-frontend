import { ref, readonly } from 'vue'
import { io, Socket } from 'socket.io-client'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import type { Concert } from '@/composables/useConcerts'

// Shared by every component that shows the current concert's info (OPENTIX, transfer account…),
// so the concert is fetched once and the socket lives as long as the app
const activeTag = ref<string | null>(null)
const activeConcert = ref<Concert | null>(null)
let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null

const fetchJson = async (path: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

const fetchConcert = async () => {
  if (!activeTag.value) return
  try {
    const { concert } = await fetchJson(`/api/concerts/${encodeURIComponent(activeTag.value)}`)
    activeConcert.value = concert
  } catch (error) {
    console.error('Failed to fetch active concert:', error)
  }
}

const fetchActiveConcert = async () => {
  try {
    const status = await fetchJson('/api/settings/booking-status')
    activeTag.value = status.activeTag ?? null
  } catch (error) {
    console.error('Failed to fetch active tag:', error)
    return
  }
  await fetchConcert()
}

const init = () => {
  if (socket) return

  socket = io(import.meta.env.VITE_API_BASE_URL)
  // Fires on every (re)connection: the backend may still be waking up on first load,
  // and events missed while disconnected are caught up this way
  socket.on('connect', fetchActiveConcert)
  socket.on('concertChanged', fetchActiveConcert)
  // Fired for any concert; archived ones don't concern the booking page
  socket.on('concertUpdated', ({ tag }: { tag: string }) => {
    if (tag === activeTag.value) fetchConcert()
  })
}

export function useActiveConcert() {
  init()

  return {
    activeTag: readonly(activeTag),
    activeConcert: readonly(activeConcert),
    fetchActiveConcert
  }
}
