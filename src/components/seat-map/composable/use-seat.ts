// src/composables/useSeat.js
import { ref, computed, onMounted } from 'vue'
import { io } from 'socket.io-client'
import type { Seat } from '@/components/seat-map/types'

let socket

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

  async function syncToSheet(userInfo: { userName: string, date: Date, account: string }) {
    const selectedSeatLabelsByPrice = selectedSeats.value.reduce((acc, seat) => {
      acc[seat.price] = acc[seat.price] || []
      acc[seat.price].push(`${seat.row}${seat.col}`)
      return acc
    }, {})
    const payload = {
      selectedSeatLabelsByPrice,
      totalPrice: grandTotal.value,
      programBookCount: programBookCount.value,
      ...userInfo,
      name: userInfo.userName,
      date: userInfo.date.toLocaleDateString(),
    }
    try {
      await fetch(import.meta.env.VITE_GSHEET_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify(payload),
      })
      console.log('同步到試算表成功');
    } catch (e) {
      console.error('同步到試算表失敗', e);
    }
  }

  async function reserve(data: { userName: string , date: Date, account: string }) {
    const payload = {
      ...data,
      totalPrice: grandTotal.value,
      seatLabels: selectedSeats.value.map(s => `${s.row}${s.col}`),
      programBookCount: programBookCount.value,
    }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await syncToSheet(payload)
    return res.json()
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
  }
}
