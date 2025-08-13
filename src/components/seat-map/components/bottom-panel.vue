<template>
  <!-- Edit Mode - No Expand/Collapse, Always Show Content -->
  <div v-if="mode === 'edit' && selectedSeats.length" class='fixed bottom-0 left-0 right-0 bg-white z-2 border-t'>
    <!-- Edit Mode Content -->
    <div class='p-4'>
      <div class='mb-4'>
        <div class='text-sm font-medium text-gray-700 mb-2'>已選擇座位</div>
        <div class='flex flex-wrap gap-1'>
          <span v-for="seat in selectedSeats" :key="seat.text" 
                class='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md'>
            {{ seat.text }}
          </span>
        </div>
      </div>

      <div class='flex flex-wrap items-center gap-2 mt-4'>
        <div class='w-full mobile:w-[49%] tablet:w-[25%] flex items-center gap-4'>
          <Select 
            :model-value="editPropertyName"
            @update:model-value="onEditPropertyChange"
            :items="[
              { title: '狀態', value: 'status' },
              { title: '價格', value: 'price' }
            ]"
            label="屬性"
            density="compact"
            hideDetails
          />
        </div>
        
        <div class='w-full mobile:w-[49%] tablet:w-[25%] flex items-center gap-4'>
          <Select 
            v-if="editPropertyName === 'status'"
            :model-value="editNewValue"
            @update:model-value="onEditValueChange"
            :items="Object.values(SEAT_STATUS).filter(value => value !== 'BOOKED').map(value => ({ title: value, value }))"
            label="選擇狀態"
            density="compact"
            class="flex-1"
            hideDetails
          />
          <Select 
            v-else-if="editPropertyName === 'price'"
            :model-value="editNewValue"
            @update:model-value="onEditValueChange"
            :items="Object.values(SEAT_PRICE).map(value => ({ title: `NT$${value}`, value }))"
            label="選擇價格"
            density="compact"
            class="flex-1"
            hideDetails
          />
        </div>
      </div>
    </div>

    <!-- Edit Mode Footer -->
    <div class='p-3 bg-white border-t flex justify-end'>
      <Button
        color='primary'
        variant='elevated'
        :disabled="!editNewValue"
        @click="onSubmit"
      >
        <div class='text-white'>更新座位</div>
      </Button>
    </div>
  </div>

  <!-- Book Mode - With Expand/Collapse -->
  <div v-else-if="mode === 'book'" class='fixed bottom-0 left-0 right-0 bg-white z-2 flex flex-col transition-all duration-300' 
       :class="isExpanded ? 'max-h-full' : 'max-h-20'">
    <!-- Book Mode Compact Header -->
    <div class='flex items-center justify-between p-3 border-b cursor-pointer' 
         @click="toggleExpanded" v-if="!isExpanded">
      <div class='flex items-center gap-3'>
        <div v-if='selectedSeats.length' class='flex items-center gap-2'>
          <span class='text-sm font-medium'>已選 {{ selectedSeats.length }} 座位</span>
          <div class='flex gap-1'>
            <span v-for="seat in selectedSeats.slice(0, 5)" :key="seat.text" 
                  class='px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded'>
              {{ seat.text }}
            </span>
            <span v-if="selectedSeats.length > 3" class='text-xs text-gray-500'>...</span>
          </div>
        </div>
        <div v-if='programBookCount > 0' class='text-sm text-gray-600'>
          節目冊 {{ programBookCount }}
        </div>
      </div>
      <div class='flex items-center gap-2'>
        <span v-if='!programBookCount' class='text-sm text-gray-600'>展開購買節目冊</span>
        <v-icon>mdi-chevron-up</v-icon>
      </div>
    </div>

    <!-- Book Mode Expanded Content -->
    <div v-if="isExpanded" class='flex-1 overflow-y-auto p-4 pb-2'>
      <!-- Program Book Section -->
      <div v-if="orderSummary" class='mb-4'>
        <div class='text-sm font-medium text-gray-700 mb-2'>節目冊</div>
        <div class='bg-gray-50 rounded-lg p-3'>
          <div class='flex items-center justify-between'>
            <div class='flex items-center gap-3'>
              <div
                class='w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-50 rounded-full border border-red-200 transition-colors'
                :class="{ 'opacity-30 cursor-not-allowed': programBookCount <= 0 }"
                @click="programBookCount > 0 && onProgramBookChange(programBookCount - 1)"
              >
                <v-icon size="18">mdi-minus</v-icon>
              </div>
              <span class='w-8 text-center font-medium'>{{ programBookCount }}</span>
              <div
                class='w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-blue-50 rounded-full border border-blue-200 transition-colors'
                @click="onProgramBookChange(programBookCount + 1)"
              >
                <v-icon size="18">mdi-plus</v-icon>
              </div>
            </div>
            <div v-if="programBookCount && orderSummary" class='text-right'>
              <div class='flex items-center gap-2'>
                <span v-if="orderSummary.programBooks.breakdown.savings > 0" 
                      class='text-gray-400 line-through text-xs'>
                  NT${{ orderSummary.programBooks.originalPrice }}
                </span>
                <span class='font-medium'>NT${{ orderSummary.programBooks.finalPrice }}</span>
              </div>
              <span v-if="isMember" class='text-green-600 text-xs'>團員價</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Seats Breakdown -->
      <div v-if="orderSummary && Object.keys(orderSummary.seats).length > 0" class='mb-4'>
        <div class='text-sm font-medium text-gray-700 mb-2'>座位明細</div>
        <div class='space-y-2'>
          <div v-for="[price, item] in Object.entries(orderSummary.seats)" :key="price" 
               class='bg-gray-50 rounded-lg p-3'>
            <div class='flex items-center justify-between flex-shrink-1'>
              <div class='text-sm'>
                <div class='font-medium'>NT${{ price }} × {{ item.quantity }}</div>
                <div class='text-gray-500 text-xs'>{{ item.seatNumbers.join(', ') }}</div>
              </div>
              <div class='text-right flex-shrink-0'>
                <div class='flex items-center gap-2'>
                  <span v-if="item.breakdown.savings > 0" class='text-gray-400 line-through text-xs'>
                    NT${{ item.originalPrice }}
                  </span>
                  <span class='font-medium'>NT${{ item.finalPrice }}</span>
                </div>
                <div v-if="item.breakdown.discountType" class='text-xs'>
                  <span v-if="item.breakdown.discountType === 'member'" class='text-green-600'>團員85折</span>
                  <span v-else-if="item.breakdown.discountType === 'group'" class='text-blue-600'>
                    團購{{ Math.round((1 - item.breakdown.discountRate) * 100) }}%OFF
                  </span>
                  <span v-else-if="item.breakdown.discountType === 'both'" class='text-blue-600'>
                    團購{{ Math.round((1 - item.breakdown.discountRate) * 100) }}%OFF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Book Mode Collapse Button -->
    <div v-if="isExpanded" class='flex items-center justify-center p-2 border-t cursor-pointer' 
         @click.stop="toggleExpanded">
      <v-icon>mdi-chevron-down</v-icon>
    </div>

    <!-- Book Mode Footer -->
    <div v-if='selectedSeats.length || programBookCount > 0' 
         class='p-3 bg-white border-t flex-shrink-0 flex items-center justify-between min-h-[60px]'
         :class="{ 'hidden': !isExpanded }">
      <!-- Total Display -->
      <div class='flex flex-col'>
        <div v-if="orderSummary" class='font-bold'>
          <div class='flex items-center gap-2'>
            <span>總計：</span>
            <div class='flex items-center gap-2'>
              <span v-if="orderSummary.totals.totalSavings > 0" 
                    class='text-gray-400 line-through text-sm'>
                NT${{ orderSummary.totals.originalTotal }}
              </span>
              <span class='text-lg'>NT${{ orderSummary.totals.finalTotal }}</span>
            </div>
          </div>
          <div v-if="orderSummary.totals.totalSavings > 0" 
               class='text-green-600 text-sm'>
            已節省 NT${{ orderSummary.totals.totalSavings }}
          </div>
        </div>
        <div v-else-if="grandTotal" class='font-bold'>
          總計：NT${{ grandTotal }}
        </div>
      </div>
      
      <!-- Next Button -->
      <Button
        color='primary'
        variant='elevated'
        @click="onSubmit"
      >
        <div class='text-white'>下一步</div>
      </Button>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue'
  import { SEAT_PRICE_COLOR, SEAT_STATUS, SEAT_PRICE } from '@/components/seat-map/constants'
  import Button from '@/components/common/button.vue'
  import Select from '@/components/common/select.vue'

  export default {
    components: {
      Button,
      Select,
    },
    props: {
      selectedSeats: {
        type: Array,
        default: () => [],
      },
      grandTotal: {
        type: Number,
        default: 0,
      },
      mode: {
        type: String,
        default: 'book',
      },
      editPropertyName: {
        type: String,
        default: 'status',
      },
      editNewValue: {
        type: [String, Number],
        default: '',
      },
      programBookCount: {
        type: Number,
        default: 0,
      },
      isMember: {
        type: Boolean,
        default: false,
      },
      orderSummary: {
        type: Object,
        default: null,
      },
    },
    setup(_, { emit }) {
      const isExpanded = ref(false)

      const toggleExpanded = () => {
        isExpanded.value = !isExpanded.value
      }

      const onSubmit = () => {
        emit('submit')
      }

      const onEditPropertyChange = (value) => {
        emit('update:editPropertyName', value)
        emit('update:editNewValue', '')
      }

      const onEditValueChange = (value) => {
        emit('update:editNewValue', value)
      }

      const onProgramBookChange = (value) => {
        emit('update:programBookCount', Math.max(0, value))
      }

      return {
        SEAT_PRICE_COLOR,
        SEAT_STATUS,
        SEAT_PRICE,
        isExpanded,
        toggleExpanded,
        onSubmit,
        onEditPropertyChange,
        onEditValueChange,
        onProgramBookChange,
      }
    }
  }
</script>