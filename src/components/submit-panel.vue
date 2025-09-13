<template>
  <Dialog modelValue='true' width='500' :fullscreen='isMobile' @close='onClose'>
    <template #title>
      <div>明細確認</div>
    </template>
    <div class='flex flex-col gap-3'>
      <v-text-field
        :rules="rules.name"
        hide-details="auto"
        label="名字"
        variant="solo-filled"
        flat
        v-model="userName"
      ></v-text-field>
      <date-picker
        :rules="rules.date"
        label="預計匯款日期"
        @update='onDateUpdate'
      ></date-picker>
      <v-text-field
        :rules="rules.account"
        hide-details="auto"
        label="帳號末五碼"
        variant="solo-filled"
        flat
        v-model="account"
      ></v-text-field>
    </div>
    <div :class='drawerClass' class='mt-8'>
      <!-- Using Order Summary -->
      <div v-if="orderSummary">
        <!-- Seats Breakdown -->
        <div v-if="Object.keys(orderSummary.seats).length > 0" class='mb-3'>
          <div class='font-medium mb-2'>明細：</div>
          <div v-for="[price, item] in Object.entries(orderSummary.seats)" :key="price" class='mb-2'>
            <div class='flex items-center justify-between'>
              <div>
                <div class='text-sm'>座位 {{ item.seatNumbers.join(', ') }}</div>
                <div class='text-gray-500 text-xs'>NT${{ price }} × {{ item.quantity }}</div>
              </div>
              <div class='text-right flex-shrink-0'>
                <div v-if="item.breakdown.savings > 0" class='flex items-center gap-2'>
                  <span class='text-gray-400 line-through text-sm'>NT${{ item.originalPrice }}</span>
                  <span class='font-medium'>NT${{ item.finalPrice }}</span>
                </div>
                <div v-else class='font-medium'>NT${{ item.finalPrice }}</div>
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

        <!-- Program Books - Purchased -->
        <div v-if='programBookCount > 0' class='mb-3'>
          <div class='flex items-center justify-between'>
            <div>
              <div class='text-sm'>節目冊 × {{ programBookCount }}</div>
            </div>
            <div class='text-right'>
              <div v-if="orderSummary.programBooks.breakdown.savings > 0" class='flex items-center gap-2'>
                <span class='text-gray-400 line-through text-sm'>
                  NT${{ orderSummary.programBooks.originalPrice }}
                </span>
                <span class='font-medium'>NT${{ orderSummary.programBooks.finalPrice }}</span>
              </div>
              <div v-else class='font-medium'>NT${{ orderSummary.programBooks.finalPrice }}</div>
              <div v-if="orderSummary.programBooks.breakdown.discountType === 'member'" 
                   class='text-xs text-green-600'>
                團員價
              </div>
            </div>
          </div>
        </div>

        <!-- Program Books - Free Gift -->
        <div v-if="orderSummary?.seats?.['1200']" class='mb-3'>
          <div class='flex items-center justify-between'>
            <div>
              <div class='text-sm flex items-center gap-2'>
                贈送節目冊 × {{ orderSummary.seats[1200].quantity }}
              </div>
            </div>
            <div class='text-right'>
              <div class='font-medium text-green-600'>免費</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Fallback to old display if no orderSummary -->
      <div v-else>
        <div v-if="seats.length" class='mb-2'>
          <div v-for='seat in Object.values(formattedSeats)' :key='seat.price' class='mb-1'>
            <div>座位 {{ seat.seats.join(', ') }}</div>
            <div class='text-gray-500'>{{ seat.price }}x{{ seat.count }}</div>
          </div>
        </div>
        <div v-if='programBookCount > 0' class='flex items-center gap-2 mb-1'>
          <span>節目冊：</span>
          <DiscountPrice :originalPrice='150' :discountPrice='120' />×{{ programBookCount }}
        </div>
        <div v-else-if="!seats.length" class='text-gray-500 mb-2'>僅購買節目冊，無座位預訂</div>
      </div>
    </div>
    
    <template #footer-action v-if='canSubmit'>
      <!-- Total and Button in Dialog Footer -->
      <div class='flex items-center justify-between w-full bg-white px-3 py-2'>
        <!-- Total Display -->
        <div class='flex flex-col'>
          <div v-if="orderSummary" class='font-bold text-lg'>
            <div class='flex items-center gap-2'>
              <span>總計：</span>
              <div class='flex items-center gap-2'>
                <span v-if="orderSummary.totals.totalSavings > 0" 
                      class='text-gray-400 line-through text-base'>
                  NT${{ orderSummary.totals.originalTotal }}
                </span>
                <span>NT${{ orderSummary.totals.finalTotal }}</span>
              </div>
            </div>
            <div v-if="orderSummary.totals.totalSavings > 0" 
                 class='text-green-600 text-sm font-normal'>
              已節省 NT${{ orderSummary.totals.totalSavings }}
            </div>
          </div>
          <div v-else class='font-bold text-lg'>
            總計：NT${{ total }}
          </div>
        </div>
        
        <!-- Submit Button -->
        <Button
          color='primary'
          variant='elevated'
          class='bg-primary'
          @click="onSubmit"
        >
          <div class='text-white'>送出</div>
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts">
import { ref, PropType, computed, watch, watchEffect } from 'vue'
import Dialog from '@/components/common/dialog.vue'
import Button from '@/components/common/button.vue'
import DatePicker from '@/components/common/date-picker.vue'
import DiscountPrice from '@/components/common/discount-price.vue'
  import { useWindowSize } from '@/composables/useWindowSize'
import type { Seat } from '@/components/seat-map/types'

export default {
  components: {
    Dialog,
    Button,
    DatePicker,
    DiscountPrice,
  },
  props: {
    seats: {
      type: Array as PropType<Seat[]>,
      required: true,
    },
    programBookCount: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderSummary: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const { isMobile } = useWindowSize()
    const userName = ref('')
    const date = ref(new Date())
    const account = ref('')

    const isDateValid = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(date);
      selected.setHours(0, 0, 0, 0);
      return selected >= today;
    }

    const rules = {
      name: [
        (value: string) => {
          if (value) return true
          return '必須輸入名字'
        },
      ],
      account: [
        (value: string) => {
          if (value.length === 5 && /^\d+$/.test(value)) return true
          return '必須輸入帳號末五碼'
        },
      ],
      date: [
        (value: Date) => {
          if (!value) return '必須輸入預計匯款日期'
          if (isDateValid(value)) return true
          return '匯款日期不能早於今天'
        },
      ],
    }

    const canSubmit = computed(() => {
      return userName.value
        && isDateValid(date.value)
        && account.value.length === 5 && /^\d+$/.test(account.value)
    })

    const onClose = () => {
      emit('close')
    }

    const onSubmit = () => {
      emit('submit', {
        userName: userName.value,
        date: date.value,
        account: account.value,
      })
      emit('close')
    }

    const drawerClass = computed(() => ({
      'max-h-0 overflow-hidden': !canSubmit.value,
      'max-h-50 p-2 mb-12': canSubmit.value,
      'transition-all duration-300': true,
    }))

    const formattedSeats = computed(() => {
      const seats: Record<number, { price: number; seats: string[]; count: number }> = {}
      props.seats.forEach(seat => {
        if (!seats[seat.price]) {
          seats[seat.price] = {
            price: seat.price,
            seats: [],
            count: 0
          }
        }
        seats[seat.price].seats.push(seat.text)
        seats[seat.price].count++
      })
      return seats
    })

    const onDateUpdate = (value: Date) => {
      date.value = value
    }

    watch(() => props.seats.length, () => {
      emit('close')
    })

    return {
      isMobile,
      userName,
      date,
      account,
      canSubmit,
      rules,
      drawerClass,
      formattedSeats,
      onClose,
      onSubmit,
      onDateUpdate,
    }
  },
}
</script>