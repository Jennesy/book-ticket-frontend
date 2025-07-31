<template>
  <div 
    :class="seatClasses"
    @click="handleClick"
    :title="seatTooltip"
    :aria-label="ariaLabel"
    role="button"
    :tabindex="isInteractive ? 0 : -1"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
  >
    <div>{{ seat.text }}</div>
    <div v-if="seat.reservedBy" class="ml-1 text-xs text-nowrap overflow-hidden">
      {{ seat.reservedBy }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { SEAT_STATUS, SEAT_COLOR, SEAT_PRICE_COLOR, INDENT_ROWS } from '../constants'
import type { Seat, SeatMapMode, SeatPriceColor } from '../types'

interface Props {
  seat: Seat
  mode: SeatMapMode
  isSelected: boolean
  index: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [seat: Seat]
}>()

const isInteractive = computed(() => {
  if (props.mode === 'view') return false
  if (props.mode === 'edit') return true
  return props.seat.status === SEAT_STATUS.AVAILABLE
})

const seatClasses = computed(() => {
  const classes = {
    'seat transition-all duration-200': true,
    [getSeatColor(props.seat)]: true,
    'cursor-not-allowed': !isInteractive.value,
    'cursor-pointer hover:saturate-500': isInteractive.value,
    'saturate-500 ring ring-offset-transparent ring-white ring-offset-op-50': props.isSelected,
    'indent-seat': INDENT_ROWS.includes(props.seat.row) && props.index === 0,
    'w-seat': props.seat.row === 'W',
  }
  
  const hasStatusColor = props.seat.status && SEAT_COLOR[props.seat.status]
  if (hasStatusColor) {
    classes[SEAT_COLOR[props.seat.status]] = true
  }
  
  return classes
})

const getSeatColor = (seat: Seat): string => {
  if (!seat.status) return 'bg-gray-200'
  if (!seat.price) return 'bg-gray-200'

  const priceStatusColorConfig = SEAT_PRICE_COLOR as SeatPriceColor
  const priceStatusColor = priceStatusColorConfig[String(seat.price)]?.[seat.status]
  const statusColor = SEAT_COLOR[seat.status]
  return priceStatusColor || statusColor || 'bg-gray-200'
}

const seatTooltip = computed(() => {
  const parts = [props.seat.text]
  
  if (props.seat.price) {
    parts.push(`NT$${props.seat.price}`)
  }
  
  if (props.seat.reservedBy) {
    parts.push(`預訂者: ${props.seat.reservedBy}`)
  }
  
  parts.push(getStatusText(props.seat.status))
  
  return parts.join(' - ')
})

const ariaLabel = computed(() => {
  const statusText = getStatusText(props.seat.status)
  const priceText = props.seat.price ? `價格 ${props.seat.price} 元` : ''
  const reservedText = props.seat.reservedBy ? `預訂者 ${props.seat.reservedBy}` : ''
  
  return [
    `座位 ${props.seat.text}`,
    priceText,
    statusText,
    reservedText
  ].filter(Boolean).join(', ')
})

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    [SEAT_STATUS.AVAILABLE]: '可預訂',
    [SEAT_STATUS.BOOKED]: '已預訂',
    [SEAT_STATUS.UNAVAILABLE]: '不可預訂',
    [SEAT_STATUS.VIP_0]: 'VIP 座位',
    [SEAT_STATUS.VIP_10]: 'VIP 座位'
  }
  
  return statusMap[status] || status
}

const handleClick = () => {
  if (!isInteractive.value) return
  emit('click', props.seat)
}
</script>