<template>
  <Dialog modelValue='true' width='500' @close='onClose'>
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
      <div class='flex items-center gap-2 mb-1'>
        <span>座位：</span>
        <span class='text-gray-500'>{{ calculation }}</span>
      </div>
      <div class='flex flex-wrap gap-1'>
        <div v-for='seat in seats' class='w-15 text-center p-1 border border-gray-400 rounded-md' :key='seat.text'>{{seat.text}}</div>
      </div>
      <div class='mt-2 font-bold'>總計：NT${{ total }}</div>
    </div>
    <template #footer-action v-if='canSubmit'>
      <Button
        color='primary'
        variant='elevated'
        class='bg-primary'
        @click="onSubmit"
      >
        <div class='text-white'>送出</div>
      </Button>
    </template>
  </Dialog>
</template>

<script lang="ts">
import { ref, PropType, computed } from 'vue'
import Dialog from '@/components/common/dialog.vue'
import Button from '@/components/common/button.vue'
import DatePicker from '@/components/common/date-picker.vue'
import type { Seat } from '@/components/seat-map/types'

export default {
  components: {
    Dialog,
    Button,
    DatePicker,
  },
  props: {
    seats: {
      type: Array as PropType<Seat[]>,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
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
      'max-h-50 p-2': canSubmit.value,
      'transition-all duration-300': true,
    }))

    const calculation = computed(() => {
      const result = props.seats.reduce((acc, seat) => {
        if (!acc[seat.price]) {
          acc[seat.price] = []
        }
        acc[seat.price].push(seat)
        return acc
      }, {} as Record<number, Seat[]>)

      const priceCount = Object.entries(result).reduce((acc, [price, seats]) => {
        acc[Number(price)] = seats.length
        return acc
      }, {} as Record<number, number>)

      return Object.entries(priceCount).map(([price, count]) => `${price}x${count}`).join(', ')
    })

    const onDateUpdate = (value: Date) => {
      date.value = value
    }

    return {
      userName,
      date,
      account,
      canSubmit,
      rules,
      drawerClass,
      calculation,
      onClose,
      onSubmit,
      onDateUpdate,
    }
  },
}
</script>