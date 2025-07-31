<template>
  <div class='fixed bottom-0 left-0 right-0 bg-white p-4 z-2 max-h-50 overflow-y-auto'>
    <div v-if='selectedSeats.length'>
      <div>已選擇：</div>
      <div class='flex flex-wrap gap-1'>
        <div v-for='seat in selectedSeats' :key='seat.text' :class='`${SEAT_PRICE_COLOR[seat.price][seat.status]} w-16 p-1`'>{{seat.text}}</div>
      </div>
    </div>
    <div v-if="mode === 'edit' && selectedSeats.length" class='flex flex-wrap items-center gap-2 mt-4'>
      <div class='w-25 flex items-center gap-4'>
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
      
      <div class='w-25 flex items-center gap-4'>
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

    <!-- Program Book Section -->
    <div v-if="mode === 'book'">
      <div class='flex items-center justify-between'>
        <div class='flex items-center gap-2'>
          <span>節目冊 (NT$200/本)：</span>
          <div class='flex items-center gap-2'>
            <Button
              prepend-icon="mdi-minus"
              size="x-small"
              color='red'
              variant="outlined"
              :disabled="programBookCount <= 0"
              @click="onProgramBookChange(programBookCount - 1)"
            />
            <span class='w-8 text-center'>{{ programBookCount }}</span>
            <Button
              prepend-icon="mdi-plus"
              size="x-small"
              color='primary'
              variant="outlined"
              @click="onProgramBookChange(programBookCount + 1)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class='relative mt-4'>
      <div v-if="mode === 'book' && grandTotal" class='font-bold'>總計：NT${{ grandTotal }}</div>
      <Button
        v-if='selectedSeats.length || (mode === "book" && programBookCount > 0)'
        color='primary'
        variant='elevated'
        class='!absolute right-0 bottom-0'
        @click="onSubmit"
      >
        <div class='text-white'>{{ mode === 'edit' ? '更新座位' : '下一步' }}</div>
      </Button>
    </div>
  </div>
</template>

<script>
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
    },
    setup(props, { emit }) {
      const onSubmit = () => {
        emit('submit')
      }

      const onEditPropertyChange = (value) => {
        emit('update:editPropertyName', value)
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
        onSubmit,
        onEditPropertyChange,
        onEditValueChange,
        onProgramBookChange,
      }
    }
  }
</script>