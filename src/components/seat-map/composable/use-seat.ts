// src/composables/useSeat.js
import { ref, computed, onMounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { Seat } from '@/components/seat-map/types'
import { DefaultEventsMap } from '@socket.io/component-emitter'
import { discountConfig, type OrderSummary, type PriceBreakdown } from '@/config/discount'

let socket: Socket<DefaultEventsMap, DefaultEventsMap>

export function useSeat() {
  const seats = ref<Seat[]>([])
  const selected = ref<Set<string>>(new Set())
  const programBookCount = ref(0)
  const isMember = ref(true)

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
      isMember: isMember.value,
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

  // 計算座位折扣
  function calculateSeatDiscount(price: number, quantity: number): PriceBreakdown {
    let finalPrice = price
    let discountType: 'member' | 'group' | 'both' | undefined
    let discountRate = 1

    // 團員折扣
    const memberDiscountApplies = isMember.value && 
      discountConfig.memberDiscount.eligiblePrices.includes(price)
    
    if (memberDiscountApplies) {
      finalPrice = price * discountConfig.memberDiscount.discountRate
      discountType = 'member'
      discountRate = discountConfig.memberDiscount.discountRate
    }

    // 團購折扣 (有期限限制)
    const isGroupDiscountActive = () => {
      const now = new Date()
      const taipeiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }))
      const deadline = new Date(discountConfig.groupDiscount.deadline)
      return taipeiTime <= deadline
    }

    const groupDiscount = discountConfig.groupDiscount[price]
    if (groupDiscount && quantity >= groupDiscount.minQuantity && isGroupDiscountActive()) {
      const groupDiscountPrice = price * groupDiscount.discountRate
      
      if (!memberDiscountApplies || groupDiscountPrice < finalPrice) {
        finalPrice = groupDiscountPrice
        discountType = memberDiscountApplies ? 'both' : 'group'
        discountRate = groupDiscount.discountRate
      }
    }

    return {
      originalPrice: price,
      discountedPrice: finalPrice,
      discountType,
      discountRate,
      savings: price - finalPrice
    }
  }

  // 計算節目冊折扣
  function calculateProgramBookDiscount(): PriceBreakdown {
    const originalPrice = discountConfig.programBook.originalPrice
    const finalPrice = isMember.value 
      ? discountConfig.programBook.memberPrice 
      : originalPrice
    
    return {
      originalPrice,
      discountedPrice: finalPrice,
      discountType: isMember.value ? 'member' : undefined,
      discountRate: isMember.value ? (finalPrice / originalPrice) : 1,
      savings: originalPrice - finalPrice
    }
  }

  // 訂單詳細計算
  const orderSummary = computed<OrderSummary>(() => {
    // 按價格分組座位
    const seatsByPrice = selectedSeats.value.reduce((acc, seat) => {
      const price = seat.price || 0
      if (!acc[price]) {
        acc[price] = []
      }
      acc[price].push(seat)
      return acc
    }, {} as Record<number, Seat[]>)

    // 計算每個價格組的折扣
    const seatsBreakdown: OrderSummary['seats'] = {}
    Object.entries(seatsByPrice).forEach(([priceStr, seatList]) => {
      const price = Number(priceStr)
      const quantity = seatList.length
      const breakdown = calculateSeatDiscount(price, quantity)
      
      seatsBreakdown[price] = {
        quantity,
        originalPrice: price * quantity,
        finalPrice: breakdown.discountedPrice * quantity,
        breakdown,
        seatNumbers: seatList.map(s => `${s.row}${s.col}`)
      }
    })

    // 計算節目冊
    const programBookBreakdown = calculateProgramBookDiscount()
    const programBooks = {
      quantity: programBookCount.value,
      originalPrice: programBookBreakdown.originalPrice * programBookCount.value,
      finalPrice: programBookBreakdown.discountedPrice * programBookCount.value,
      breakdown: programBookBreakdown
    }

    // 計算總計
    const seatsOriginalTotal = Object.values(seatsBreakdown)
      .reduce((sum, item) => sum + item.originalPrice, 0)
    const seatsFinalTotal = Object.values(seatsBreakdown)
      .reduce((sum, item) => sum + item.finalPrice, 0)
    
    const originalTotal = seatsOriginalTotal + programBooks.originalPrice
    const finalTotal = seatsFinalTotal + programBooks.finalPrice

    return {
      seats: seatsBreakdown,
      programBooks,
      totals: {
        originalTotal,
        finalTotal,
        totalSavings: originalTotal - finalTotal
      }
    }
  })

  // 保持舊的 computed 屬性以兼容現有代碼
  const seatsTotal = computed(() => orderSummary.value.totals.finalTotal - orderSummary.value.programBooks.finalPrice)
  const booksTotal = computed(() => orderSummary.value.programBooks.finalPrice)
  const grandTotal = computed(() => orderSummary.value.totals.finalTotal)

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
    isMember: computed({
      get: () => isMember.value,
      set: v => (isMember.value = v),
    }),
    orderSummary,
    seatsTotal,
    booksTotal,
    grandTotal,
    reserve,
    reset,
    editSelectedSeats,
  }
}
