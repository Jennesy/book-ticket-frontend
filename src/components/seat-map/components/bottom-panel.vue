<template>
  <div class='fixed bottom-0 left-0 right-0 bg-white p-4 z-2 max-h-50 overflow-y-auto'>
    <div v-if='selectedSeats.length'>
      <div>已選擇：</div>
      <div class='flex flex-wrap gap-1'>
        <div v-for='seat in selectedSeats' :key='seat.text' :class='`${SEAT_PRICE_COLOR[seat.price][seat.status]} w-16 p-1`'>{{seat.text}}</div>
      </div>
    </div>
    <div class='relative mt-4'>
      <div class='font-bold'>總計：NT${{ grandTotal }}</div>
      <Button
        v-if='selectedSeats.length'
        color='primary'
        variant='elevated'
        class='!absolute right-0 bottom-0'
        @click="onSubmit"
      >
        <div class='text-white'>下一步</div>
      </Button>
    </div>
  </div>
</template>

<script>
  import { SEAT_PRICE_COLOR } from '@/components/seat-map/constants'
  import Button from '@/components/common/button.vue'

  export default {
    components: {
      Button,
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
    },
    setup(_, { emit }) {
      const onSubmit = () => {
        emit('submit')
      }
      return {
        SEAT_PRICE_COLOR,
        onSubmit,
      }
    }
  }
</script>