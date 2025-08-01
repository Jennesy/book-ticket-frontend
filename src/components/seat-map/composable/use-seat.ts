// src/composables/useSeat.js
import { ref, computed, onMounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { Seat } from '@/components/seat-map/types'
import { DefaultEventsMap } from '@socket.io/component-emitter'

let socket: Socket<DefaultEventsMap, DefaultEventsMap>

export function useSeat() {
  const seats = ref<Seat[]>([])
  const selected = ref<Set<string>>(new Set())
  const programBookCount = ref(0)

  async function fetchSeats() {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/seats`)
    seats.value = await res.json()
  }

  function initSocket() {
    if (socket) return
    socket = io(import.meta.env.VITE_API_BASE_URL)
    socket.on('seatUpdated', (newSeats) => {
      seats.value = newSeats
    })
  }

  onMounted(() => {
    fetchSeats()
    initSocket()
  })

  function toggleSeat(seat: Seat) {
    const seatId = `${seat.row}${seat.col}`
    if (selected.value.has(seatId)) selected.value.delete(seatId)
    else selected.value.add(seatId)
  }

  async function reserve(data: { userName: string , date: Date, account: string }) {
    const payload = {
      ...data,
      totalPrice: grandTotal.value,
      seatLabels: selectedSeats.value.map(s => `${s.row}${s.col}`),
      programBookCount: programBookCount.value,
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        // Handle specific error format from backend
        const errorMessage = result.message || `HTTP ${res.status}: ${res.statusText}`
        const unavailableSeats = result.unavailable || []
        
        if (unavailableSeats.length > 0) {
          throw new Error(`${errorMessage}\n無法選擇的座位: ${unavailableSeats.join(', ')}`)
        } else {
          throw new Error(errorMessage)
        }
      }
      
      return result
    } catch (error) {
      console.error('Reservation failed:', error)
      throw error
    }
  }

  const selectedSeats = computed<Seat[]>(() => {
    return seats.value.filter(seat => selected.value.has(`${seat.row}${seat.col}`))
  })
  const seatsTotal = computed(() =>
    selectedSeats.value.reduce((sum, s) => sum + (s.price || 0), 0)
  )
  const booksTotal = computed(() => programBookCount.value * 200)
  const grandTotal = computed(() => seatsTotal.value + booksTotal.value)

  const reset = () => {
    selected.value.clear()
    programBookCount.value = 0
  }

  async function editSelectedSeats(updates: { price?: number; status?: string; reservedBy?: string }) {
    console.log('editSelectedSeats', updates)
    if (selectedSeats.value.length === 0) {
      throw new Error('No seats selected')
    }
    
    const seatsToUpdate = selectedSeats.value
      .filter(seat => seat._id)
      .map(seat => ({
        _id: seat._id,
        row: seat.row,
        col: seat.col,
        status: updates.status ?? seat.status,
        reservedBy: updates.reservedBy ?? seat.reservedBy,
        price: updates.price ?? seat.price
      }))
    
    if (seatsToUpdate.length === 0) {
      throw new Error('No valid seats to update')
    }
    
    const payload = { seats: seatsToUpdate }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/seats`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const result = await res.json()
      
      if (res.ok && result.updatedSeats?.length > 0) {
        result.updatedSeats.forEach(updatedSeat => {
          const seatIndex = seats.value.findIndex(s => s._id === updatedSeat._id)
          if (seatIndex !== -1) {
            Object.assign(seats.value[seatIndex], updatedSeat)
          }
        })
      }
      
      return result
    } catch (error) {
      console.error('Failed to edit selected seats:', error)
      throw error
    }
  }

  return {
    seats,
    selectedSeats,
    toggleSeat,
    programBookCount: computed({
      get: () => programBookCount.value,
      set: v => (programBookCount.value = v),
    }),
    seatsTotal,
    booksTotal,
    grandTotal,
    reserve,
    reset,
    editSelectedSeats,
  }
}
