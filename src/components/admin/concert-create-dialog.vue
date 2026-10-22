<template>
  <Dialog :model-value="modelValue" width="520" @update:model-value="$emit('update:modelValue', $event)">
    <template #title>{{ step === 'form' ? '建立新場次' : '確認建立場次' }}</template>

    <div v-if="step === 'form'" class="flex flex-col gap-4 pt-2">
      <DatePicker
        v-model="date"
        label="日期"
        :min="today"
        :error-messages="dateError"
      />
      <v-text-field
        v-model="name"
        label="名稱（選填）"
        variant="solo-filled"
        flat
        hide-details="auto"
      />
      <v-text-field
        v-model="sheetWebhook"
        label="試算表 Webhook（選填）"
        :placeholder="SHEET_WEBHOOK_PREFIX"
        variant="solo-filled"
        flat
        hide-details="auto"
        :error-messages="webhookError"
      />
      <div v-if="!sheetWebhook.trim()" class="text-sm text-amber-700">
        沒有設定 Webhook 時，訂票仍會成功，但不會寫進試算表。
      </div>
    </div>

    <div v-else class="flex flex-col gap-3 pt-2">
      <div
        v-if="isBookingOpen"
        class="p-3 rounded-lg bg-red-50 border border-red-500 text-red-700 font-medium"
      >
        目前訂票開放中，建立後會立刻關閉訂票，正在訂票的使用者會被中斷。
      </div>
      <div>建立後會立刻發生：</div>
      <ul class="list-disc pl-5 flex flex-col gap-1">
        <li>
          <span class="font-medium">{{ newConcertLabel }}</span> 成為當前場次，
          <span v-if="activeConcertLabel" class="font-medium">{{ activeConcertLabel }}</span>
          <span v-else>目前的場次</span>
          會被封存，之後只能查看。
        </li>
        <li>新場次複製目前的座位配置（票價、不可售、VIP），已訂的座位全部釋出。</li>
        <li>訂票自動關閉。</li>
      </ul>
      <div class="text-sm text-gray-500">封存後無法切換回舊場次。</div>
      <div v-if="submitError" class="text-sm text-red-600">{{ submitError }}</div>
    </div>

    <template #footer-action>
      <div class="flex justify-end gap-2 w-full">
        <template v-if="step === 'form'">
          <Button variant="text" @click="$emit('update:modelValue', false)">取消</Button>
          <Button color="primary" :disabled="!canProceed" :loading="checkingStatus" @click="onNext">下一步</Button>
        </template>
        <template v-else>
          <Button variant="text" :disabled="submitting" @click="step = 'form'">返回</Button>
          <Button color="error" :loading="submitting" @click="onSubmit">確認建立</Button>
        </template>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from '@/components/common/dialog.vue'
import Button from '@/components/common/button.vue'
import DatePicker from '@/components/common/date-picker.vue'
import { useAdminAuth } from '@/composables/useAdminAuth'
import { useConcertApi, SHEET_WEBHOOK_PREFIX, type Concert, type ApiError } from '@/composables/useConcerts'
import { dateToTag, formatTag } from '@/utils/concert-tag'
import { startOfToday } from '@/utils/date'

const props = defineProps<{
  modelValue: boolean
  concerts: Concert[]
  activeTag: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: [concert: Concert]
}>()

const { createConcert } = useConcertApi()
const { adminFetch } = useAdminAuth()

const step = ref<'form' | 'confirm'>('form')
const date = ref<Date | null>(null)
const name = ref('')
const sheetWebhook = ref('')
const serverDateError = ref('')
const submitError = ref('')
const isBookingOpen = ref(false)
const checkingStatus = ref(false)
const submitting = ref(false)
const today = ref(startOfToday())

const tag = computed(() => date.value ? dateToTag(date.value) : '')

const dateError = computed(() => {
  if (tag.value && props.concerts.some(concert => concert.tag === tag.value)) {
    return '這個日期已經有場次'
  }
  return serverDateError.value
})

const webhookError = computed(() => {
  const value = sheetWebhook.value.trim()
  if (value && !value.startsWith(SHEET_WEBHOOK_PREFIX)) {
    return `必須以 ${SHEET_WEBHOOK_PREFIX} 開頭`
  }
  return ''
})

const canProceed = computed(() => !!tag.value && !dateError.value && !webhookError.value)

const concertLabel = (tag: string, name?: string) =>
  name ? `${name}（${formatTag(tag)}）` : formatTag(tag)

const activeConcertLabel = computed(() => {
  const active = props.concerts.find(concert => concert.tag === props.activeTag)
  return active ? concertLabel(active.tag, active.name) : ''
})

const newConcertLabel = computed(() => concertLabel(tag.value, name.value.trim()))

watch(date, () => {
  serverDateError.value = ''
})

// Start from an empty form every time the dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) return
  step.value = 'form'
  date.value = null
  name.value = ''
  sheetWebhook.value = ''
  serverDateError.value = ''
  submitError.value = ''
  today.value = startOfToday()
})

const fetchIsBookingOpen = async () => {
  try {
    const response = await adminFetch('/api/settings/booking-status')
    if (response.ok) {
      const result = await response.json()
      return !!result.open
    }
  } catch (error) {
    console.error('Failed to fetch booking status:', error)
  }
  // Unknown: show the warning rather than hide it
  return true
}

const onNext = async () => {
  // The page may have stayed open past midnight since the date was picked
  if (!date.value || date.value < startOfToday()) {
    serverDateError.value = '日期不能早於今天'
    return
  }

  checkingStatus.value = true
  isBookingOpen.value = await fetchIsBookingOpen()
  checkingStatus.value = false

  submitError.value = ''
  step.value = 'confirm'
}

const onSubmit = async () => {
  if (submitting.value) return

  submitting.value = true
  submitError.value = ''
  try {
    const result = await createConcert({
      tag: tag.value,
      name: name.value.trim() || undefined,
      sheetWebhook: sheetWebhook.value.trim() || undefined,
    })
    emit('created', result.concert)
    emit('update:modelValue', false)
  } catch (error) {
    const { status, message } = error as ApiError
    if (status === 409) {
      serverDateError.value = '這個日期已經有場次'
      step.value = 'form'
    } else if (status !== 401) {
      submitError.value = message || '建立失敗，請稍後再試'
    }
  } finally {
    submitting.value = false
  }
}
</script>
