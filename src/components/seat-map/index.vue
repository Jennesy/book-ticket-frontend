<template>
  <div v-if='isLoading' class='fixed inset-0 bg-black/50 z-3 text-white text-xl grid place-items-center transition-all duration-200'>Loading...</div>
  <BottomPanel 
    v-if='!isViewMode' 
    :selected-seats='formattedSelectedSeats' 
    :grandTotal='grandTotal' 
    :mode='mode'
    :orderSummary='orderSummary'
    :isMember='isMember'
    v-model:editPropertyName='editPropertyName'
    v-model:editNewValue='editNewValue'
    v-model:programBookCount='programBookCount'
    @submit='onSubmit' 
  />
  <div class="overflow-scroll bg-gray-700 m-2 mb-50">
    <div class="p-8 w-fit">
      <div class="grid scale-80 mobile:scale-100" :class="$style.seats">
        <div :class='$style.legend' class='rounded-xl relative'>
          <div class='text-sm text-gray-400 absolute -bottom-5 right-4'>*折扣前價格</div>
          <div v-for='tag in Object.keys(legend)' :key='tag' class='flex items-center gap-2'>
            <div :class='`${legend[tag]} aspect-square rounded-full w-3`'></div>
            <div class='text-white'>{{ tag }}</div>
          </div>
        </div>
        <template v-for="(sectionSeats, section) in sections" :key="section">
          <div :class="$style[section]">
            <template v-for="(seat, index) in sectionSeats" :key="seat.text || `${section}-${index}`">
              <SeatItem
                v-if="seat.row && seat.col"
                :seat="seat"
                :mode="mode"
                :is-selected="selectedSeatLabels.includes(`${seat.row}${seat.col}`)"
                :index="index"
                @click="onToggleSeat"
              />
              <div 
                v-else
                class="seat"
                :class="seat.class"
              />
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>

  <SubmitPanel v-if="isSubmitPanelVisible" :seats='formattedSelectedSeats' :total='grandTotal' :programBookCount='programBookCount' :orderSummary='orderSummary' @submit="onReserve" @close="onSubmitPanelClose" />
  <SuccessPanel v-if="isSuccessPanelVisible" @close="onSuccessPanelClose" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, PropType } from 'vue'
import { useSeat } from './composable/use-seat'
import { SECTIONS, INDENT_ROWS, SEAT_STATUS, SEAT_COLOR, SEAT_PRICE_COLOR } from './constants'
import type { Seat, SeatSection, SectionRow, SeatPriceColor, SeatMapMode } from './types'
import SubmitPanel from '@/components/submit-panel.vue'
import SuccessPanel from '@/components/success-panel.vue'
import BottomPanel from './components/bottom-panel.vue'
import SeatItem from './components/seat-item.vue'

export default defineComponent({
  name: 'SeatMap',
  components: {
    SubmitPanel,
    SuccessPanel,
    BottomPanel,
    SeatItem,
  },
  props: {
    mode: {
      type: String as PropType<SeatMapMode>,
      default: 'view',
    },
  },
  setup(props) {
    const isLoading = ref(false)
    const isSubmitPanelVisible = ref(false)
    const isSuccessPanelVisible = ref(false)
    const editPropertyName = ref<'status' | 'price'>('status')
    const editNewValue = ref<string | number>('')

    const isViewMode = computed(() => props.mode === 'view')

    const {
      seats,
      selectedSeats,
      programBookCount,
      seatsTotal,
      booksTotal,
      grandTotal,
      orderSummary,
      isMember,
      reserve,
      toggleSeat,
      reset,
      editSelectedSeats,
    } = useSeat()

    const selectedSeatLabels = computed(() => selectedSeats.value.map(s => `${s.row}${s.col}`))

    const getIsIndent = (seat: { row: string }, index: number): boolean => 
      INDENT_ROWS.includes(seat.row) && index === 0
    
    const sections = computed(() => {
      const result: Record<string, SeatSection[]> = {}
      if (!seats.value) return result

      Object.entries(SECTIONS).forEach(([section, rows]) => {
        result[section] = (rows as SectionRow[][]).flatMap(row => 
          row.map((target, index) => {
            const rawSeat = seats.value?.find(
              seat => seat.row === target.row && seat.col === target.col
            )
            const indentClass = getIsIndent(target, index) ? 'indent-seat' : ''

            if (!target.col) {
              return {
                class: `${indentClass} bg-gray-600`,
              }
            }

            if (!rawSeat) {
              return {
                ...target,
                text: `${target.row}${target.col}`,
                status: SEAT_STATUS.UNAVAILABLE,
                reservedBy: '',
              }
            }

            return {
              ...rawSeat,
              text: `${target.row}${target.col}`,
            }
          })
        )
      })
      return result
    })

    const formattedSelectedSeats = computed(() => {
      if (!selectedSeats.value.length) return []
      const formattedSeats = selectedSeats.value.map(seat => ({
          ...seat,
          text: `${seat.row}${seat.col}`,
        })).sort((a, b) => {
        if (a.price !== b.price) return a.price - b.price
        return a.text.localeCompare(b.text)
      })
      return formattedSeats
    })

    const onReserve = async (data: { userName: string, date: Date, account: string }) => {
      try {
        isLoading.value = true
        const res = await reserve(data)
        // Show success panel if reservation succeeded
        isSubmitPanelVisible.value = false
        isSuccessPanelVisible.value = true
      } catch (error) {
        console.error('預訂失敗:', error)
        // Show error message to user
        const errorMessage = error instanceof Error ? error.message : '預訂失敗，請稍後再試'
        alert(errorMessage)
        isSubmitPanelVisible.value = false
      } finally {
        // Reset selection regardless of success or failure
        reset()
        isLoading.value = false
      }
    }

    const onEdit = async () => {
      try {
        isLoading.value = true
        const updates: { status?: string; price?: number; reservedBy?: string } = {}
        if (editPropertyName.value === 'status') {
          updates.status = editNewValue.value as string
        } else if (editPropertyName.value === 'price') {
          updates.price = Number(editNewValue.value)
        }
        const result = await editSelectedSeats(updates)
        
        // Show skipped seat reasons if any
        if (result.skippedSeats && result.skippedSeats.length > 0) {
          const reasons = result.skippedSeats.map(seat => 
            `${seat.row}${seat.col}: ${seat.reason}`
          ).join('\n')
          alert(`跳過的座位:\n${reasons}`)
        }
      } catch (error) {
        console.error('編輯失敗:', error)
      } finally {
        reset()
        editPropertyName.value = 'status'
        editNewValue.value = ''
        isLoading.value = false
      }
    }

    const onToggleSeat = (seat: Seat) => {
      if (props.mode === 'view') return
      if (props.mode === 'book' && seat.status !== SEAT_STATUS.AVAILABLE) return
      toggleSeat(seat)
    }

    const onSubmit = () => {
      if (props.mode === 'edit') {
        onEdit()
      }
      if (props.mode === 'book') {
        isSubmitPanelVisible.value = true
      } 
      return
    }
    const onSubmitPanelClose = () => isSubmitPanelVisible.value = false
    const onSuccessPanelClose = () => isSuccessPanelVisible.value = false

    const legend = {
      ...Object.keys(SEAT_PRICE_COLOR).reduce((acc, price) => {
        acc[price] = SEAT_PRICE_COLOR[price].AVAILABLE
        return acc
      }, {}),
      [SEAT_STATUS.VIP_0]: SEAT_COLOR[SEAT_STATUS.VIP_0],
      [SEAT_STATUS.VIP_10]: SEAT_COLOR[SEAT_STATUS.VIP_10],
    }

    return {
      legend,
      seats,
      selectedSeats,
      selectedSeatLabels,
      formattedSelectedSeats,
      programBookCount,
      seatsTotal,
      booksTotal,
      grandTotal,
      orderSummary,
      isMember,
      onSubmit,
      onSubmitPanelClose,
      onSuccessPanelClose,
      onReserve,
      sections,
      isLoading,
      onToggleSeat,
      SEAT_PRICE_COLOR,
      isSubmitPanelVisible,
      isSuccessPanelVisible,
      isViewMode,
      editPropertyName,
      editNewValue,
    }
  },
})
</script>

<style lang="scss" module>
$gap: 4px;
$cell-size: 30px;
$seat-size: $cell-size * 2 + $gap;

@mixin section-grid($columns, $rows) {
  display: grid;
  gap: $gap;
  grid-template-columns: repeat($columns, $cell-size);
  grid-template-rows: repeat($rows, $cell-size);
}

.seats {
  grid-template-columns: repeat(68, $cell-size);
  grid-template-rows: repeat(24, $cell-size);
  gap: $gap;

  :global(.seat) {
    display: flex;
    padding-inline: 2px;
    align-items: center;
    grid-column-start: span 2;
  }

  :global(.indent-seat) {
    grid-column-start: 2;
    grid-column-end: 4;
  }

  :global(.w-seat) {
    grid-column-start: span 4;
  }
}

.legend {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  grid-row: 1 / 5;
  grid-column: 1 / 7;
  display: grid;
  grid-auto-flow: column;
  row-gap: 8px;
  column-gap: 12px;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.leftFrontWing {
  grid-column: 9 / 21;
  grid-row: 1 / 12;
  @include section-grid(12, 11);
}

.leftBackWing {
  grid-column: 9 / 21;
  grid-row: 13 / 18;
  @include section-grid(12, 5);
}

.frontCenter {
  grid-column: 23 / 47;
  grid-row: 1 / 12;
  @include section-grid(24, 11);
}

.backCenter {
  grid-column: 23 / 47;
  grid-row: 13 / 18;
  @include section-grid(24, 5);
}

.rightFrontWing {
  grid-column: 49 / 61;
  grid-row: 1 / 12;
  @include section-grid(12, 11);
}

.rightBackWing {
  grid-column: 49 / 61;
  grid-row: 13 / 18;
  @include section-grid(12, 5);
}

.aboveLeft {
  grid-column: 1 / 3;
  grid-row: 6 / 18;
  @include section-grid(2, 12);
}

.aboveRight {
  grid-column: 67 / 69;
  grid-row: 6 / 18;
  @include section-grid(2, 12);
}

.aboveBackLeft {
  grid-column: 2 / 18;
  grid-row: 20 / 25;
  @include section-grid(16, 5);
}

.aboveBackMiddle {
  grid-column: 20 / 50;
  grid-row: 20 / 25;
  @include section-grid(30, 5);
}

.aboveBackRight {
  grid-column: 52 / 68;
  grid-row: 20 / 25;
  @include section-grid(16, 5);
}
</style>
