import { ref, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import { DefaultEventsMap } from '@socket.io/component-emitter'

interface TicketingStatus {
  open: boolean
  updatedAt: string | null
}

export function useTicketingStatus() {
  const ticketingStatus = ref<TicketingStatus>({
    open: false,
    updatedAt: null
  })

  const loading = ref(false)
  let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null

  const fetchTicketingStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings/booking-status`)
      if (response.ok) {
        const result = await response.json()
        ticketingStatus.value = result
        return result
      }
    } catch (error) {
      console.error('Failed to fetch ticketing status:', error)
    }
    return null
  }

  const updateTicketingStatus = async (open: boolean) => {
    try {
      loading.value = true
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings/booking-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open })
      })
      
      if (response.ok) {
        const result = await response.json()
        ticketingStatus.value = result
        return result
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to update ticketing status:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const initSocket = () => {
    if (socket) return
    
    socket = io(import.meta.env.VITE_API_BASE_URL)
    
    socket.on('bookingStatusChanged', (newStatus: TicketingStatus) => {
      console.log('Ticketing status changed:', newStatus)
      ticketingStatus.value = newStatus
    })
  }

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  onMounted(() => {
    fetchTicketingStatus()
    initSocket()
  })

  onUnmounted(() => {
    disconnectSocket()
  })

  return {
    ticketingStatus,
    loading,
    fetchTicketingStatus,
    updateTicketingStatus,
    initSocket,
    disconnectSocket
  }
}