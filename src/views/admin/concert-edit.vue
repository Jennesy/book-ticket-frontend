<template>
  <div>
    <div class="mb-4">
      <Button variant="text" prepend-icon="mdi-arrow-left" @click="goBack">返回場次列表</Button>
    </div>

    <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg">

      <div v-if="!concert" class="text-gray-500 py-8 text-center">
        載入場次中...
      </div>

      <div v-else class="flex flex-col gap-6">
        <section class="flex flex-col gap-4">
          <h2 class="text-lg font-bold">基本資料</h2>
          <v-text-field
            :model-value="formatTag(concert.tag)"
            label="日期"
            variant="outlined"
            readonly
            hide-details="auto"
            hint="建立後不可修改"
            persistent-hint
          />
          <v-text-field
            v-model="name"
            label="名稱"
            variant="outlined"
            hide-details="auto"
          />
          <div>
            <!-- Once something is typed, the field's own label is enough -->
            <div v-if="!sheetWebhook.trim()" class="flex items-center gap-1 text-sm text-gray-600 mb-1">
              訂單列表 Webhook：
              <span :class="hasWebhook ? 'text-green-600' : 'text-amber-700'">
                {{ hasWebhook ? '已設定' : '未設定' }}
              </span>
              <template v-if="hasWebhook">
                <!-- mousedown.prevent keeps the input focused, so its blur doesn't collapse it before the toggle -->
                <span>
                  <Button
                    size="x-small"
                    variant="text"
                    icon="mdi-pencil"
                    aria-label="編輯"
                    @mousedown.prevent
                    @click="toggleWebhookInput"
                  />
                  <Button
                    size="x-small"
                    variant="text"
                    color="error"
                    icon="mdi-delete"
                    aria-label="刪除"
                    @click="onRemoveWebhook"
                  />
                </span>
              </template>
            </div>
            <v-text-field
              v-if="!hasWebhook || isWebhookInputOpen"
              ref="webhookInput"
              v-model="sheetWebhook"
              :label="hasWebhook ? '新的訂單列表 Webhook' : '訂單列表 Webhook（留空表示不設定）'"
              :placeholder="SHEET_WEBHOOK_PREFIX"
              variant="outlined"
              hide-details="auto"
              :error-messages="webhookError"
              @blur="onWebhookBlur"
            />
          </div>
        </section>

        <section class="flex flex-col gap-4">
          <h2 class="text-lg font-bold">OPENTIX 線上購票</h2>
          <!-- Date and time apart: the native datetime picker uses 上午/下午 and 上午 12:00 is midnight -->
          <div class="grid grid-cols-2 gap-4">
            <v-text-field
              v-model="opentixOpenDate"
              type="date"
              label="開放日期"
              variant="outlined"
              hide-details="auto"
              :error-messages="errors.opentixOpenDate"
            />
            <v-text-field
              v-model="opentixOpenTime"
              label="開放時間"
              placeholder="例如 12:00"
              inputmode="numeric"
              variant="outlined"
              hide-details="auto"
              :error-messages="errors.opentixOpenTime"
            />
          </div>
          <v-text-field
            v-model="info.opentixUrl"
            label="購票連結"
            placeholder="https://"
            variant="outlined"
            hide-details="auto"
            :error-messages="errors.opentixUrl"
          />
          <v-text-field
            v-model="info.discountCode"
            label="團內親友折扣碼"
            variant="outlined"
            hide-details="auto"
            :error-messages="errors.discountCode"
          />
        </section>

        <section class="flex flex-col gap-4">
          <h2 class="text-lg font-bold">團購優惠</h2>
          <v-text-field
            v-model="info.groupDiscountDeadline"
            type="date"
            label="截止日期"
            hint="留白表示不提供團購優惠"
            persistent-hint
            variant="outlined"
            hide-details="auto"
          />
        </section>

        <section class="flex flex-col gap-4">
          <h2 class="text-lg font-bold">匯款資訊</h2>
          <v-text-field
            v-model="info.orderListUrl"
            label="訂單列表連結"
            placeholder="https://"
            variant="outlined"
            hide-details="auto"
            :error-messages="errors.orderListUrl"
          />
          <div class="grid grid-cols-2 gap-4">
            <v-text-field
              v-model="info.transferBankName"
              label="銀行名稱"
              placeholder="例如 永豐銀行"
              variant="outlined"
              hide-details="auto"
              :error-messages="errors.transferBankName"
            />
            <v-text-field
              v-model="info.transferBankCode"
              label="銀行代碼"
              inputmode="numeric"
              variant="outlined"
              hide-details="auto"
              :error-messages="errors.transferBankCode"
            />
            <v-text-field
              v-model="info.transferBranchName"
              label="分行名稱"
              placeholder="例如 德惠分行"
              variant="outlined"
              hide-details="auto"
              :error-messages="errors.transferBranchName"
            />
            <v-text-field
              v-model="info.transferBranchCode"
              label="分行代碼"
              inputmode="numeric"
              variant="outlined"
              hide-details="auto"
              :error-messages="errors.transferBranchCode"
            />
          </div>
          <v-text-field
            v-model="info.transferAccountNumber"
            label="帳號"
            inputmode="numeric"
            variant="outlined"
            hide-details="auto"
            :error-messages="errors.transferAccountNumber"
          />
          <v-text-field
            v-model="info.transferAccountName"
            label="戶名"
            variant="outlined"
            hide-details="auto"
            :error-messages="errors.transferAccountName"
          />
        </section>

        <div v-if="submitError" class="text-sm text-red-600">{{ submitError }}</div>

        <div class="flex justify-end gap-2">
          <Button variant="text" @click="goBack">取消</Button>
          <Button color="primary" :disabled="!canSave" :loading="submitting" @click="onSubmit">儲存</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/common/button.vue'
import { useNotification } from '@/composables/useNotification'
import {
  useConcertApi,
  formatInfoFields,
  SHEET_WEBHOOK_PREFIX,
  type Concert,
  type ConcertInfo,
  type ApiError,
  type UpdateConcertBody
} from '@/composables/useConcerts'
import { formatTag } from '@/utils/concert-tag'
import { toTaipeiInputValue, fromTaipeiInputValue, toTaipeiDateInputValue, endOfTaipeiDay } from '@/utils/date'

type InfoField = keyof ConcertInfo

const DATE_TIME_FIELDS: InfoField[] = ['opentixOpenAt']
// Edited as a date only; stored as the end of that day in Taiwan
const END_OF_DAY_FIELDS: InfoField[] = ['groupDiscountDeadline']
const MAX_URL_LENGTH = 500

const route = useRoute()
const router = useRouter()
const { getConcert, updateConcert } = useConcertApi()
const { showNotification } = useNotification()

const tag = computed(() => route.params.tag as string)
const concert = ref<Concert | null>(null)

const name = ref('')
const sheetWebhook = ref('')
const removeWebhook = ref(false)
const isWebhookInputOpen = ref(false)
const webhookInput = ref<{ focus: () => void } | null>(null)
// Form values as entered; date-times in datetime-local format (Taiwan time)
const info = reactive<Record<InfoField, string>>({
  opentixUrl: '',
  opentixOpenAt: '',
  discountCode: '',
  groupDiscountDeadline: '',
  orderListUrl: '',
  transferBankName: '',
  transferBankCode: '',
  transferBranchName: '',
  transferBranchCode: '',
  transferAccountNumber: '',
  transferAccountName: ''
})
const submitError = ref('')
const submitting = ref(false)

const opentixOpenDate = ref('')
const opentixOpenTime = ref('')

// H:mm or HH:mm, 24-hour
const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/
const normalizeTime = (value: string) => {
  const match = value.match(TIME_PATTERN)
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : value
}

// Kept in datetime-local form (YYYY-MM-DDTHH:mm) like the other date-time fields
watch([opentixOpenDate, opentixOpenTime], ([date, time]) => {
  const trimmedDate = date.trim()
  const trimmedTime = time.trim()
  info.opentixOpenAt = trimmedDate || trimmedTime ? `${trimmedDate}T${normalizeTime(trimmedTime)}` : ''
})

const toFormValue = (field: InfoField, value: string | null) => {
  if (!value) return ''
  if (DATE_TIME_FIELDS.includes(field)) return toTaipeiInputValue(value)
  if (END_OF_DAY_FIELDS.includes(field)) return toTaipeiDateInputValue(value)
  return value
}

const toApiValue = (field: InfoField, value: string) => {
  if (DATE_TIME_FIELDS.includes(field)) return fromTaipeiInputValue(value)
  if (END_OF_DAY_FIELDS.includes(field)) return endOfTaipeiDay(value)
  return value
}

const fillForm = (value: Concert) => {
  concert.value = value
  name.value = value.name ?? ''
  // The API never returns the webhook URL, so the field starts empty and empty means "no change"
  sheetWebhook.value = ''
  removeWebhook.value = false
  isWebhookInputOpen.value = false
  for (const field of Object.keys(info) as InfoField[]) {
    info[field] = toFormValue(field, value[field])
  }
  const [openDate = '', openTime = ''] = info.opentixOpenAt ? info.opentixOpenAt.split('T') : []
  opentixOpenDate.value = openDate
  opentixOpenTime.value = openTime
}

const loadConcert = async () => {
  try {
    const { concert: value } = await getConcert(tag.value)
    fillForm(value)
  } catch (error) {
    const { status } = error as ApiError
    if (status === 404) {
      showNotification('場次不存在', 'error')
      goBack()
    } else if (status !== 401) {
      showNotification('無法載入場次，請稍後再試', 'error')
    }
  }
}

onMounted(loadConcert)

// After 刪除 the concert is shown as unset until saved
const hasWebhook = computed(() => !!concert.value?.hasSheetWebhook && !removeWebhook.value)

const toggleWebhookInput = async () => {
  isWebhookInputOpen.value = !isWebhookInputOpen.value
  if (isWebhookInputOpen.value) {
    await nextTick()
    webhookInput.value?.focus()
  } else {
    // Don't leave a hidden change behind
    sheetWebhook.value = ''
  }
}

// An empty input has nothing to keep open for
const onWebhookBlur = () => {
  if (!sheetWebhook.value.trim()) isWebhookInputOpen.value = false
}

const onRemoveWebhook = () => {
  removeWebhook.value = true
  isWebhookInputOpen.value = false
  sheetWebhook.value = ''
}

const webhookError = computed(() => {
  const value = sheetWebhook.value.trim()
  if (value && !value.startsWith(SHEET_WEBHOOK_PREFIX)) {
    return `必須以 ${SHEET_WEBHOOK_PREFIX} 開頭`
  }
  return ''
})

const urlError = (value: string) => {
  if (!value) return ''
  if (value.length > MAX_URL_LENGTH) return `最長 ${MAX_URL_LENGTH} 字`
  return /^https:\/\/\S+$/.test(value) ? '' : '必須是 https:// 開頭的網址'
}

const digitsError = (value: string, min: number, max: number) => {
  if (!value || new RegExp(`^\\d{${min},${max}}$`).test(value)) return ''
  return min === max ? `必須是 ${min} 位數字` : `必須是 ${min}–${max} 位數字`
}

const lengthError = (value: string, max: number) => (value.length > max ? `最長 ${max} 字` : '')

// Same limits as the API, so most mistakes are caught before saving
const errors = computed(() => {
  const value = (field: InfoField) => info[field].trim()
  const openDate = opentixOpenDate.value.trim()
  const openTime = opentixOpenTime.value.trim()
  const hasOpenAt = !!(openDate || openTime)
  // The booking page needs both open time and link to show either; flag only what is left empty
  const PAIR_ERROR = '開放時間和購票連結要一起填'
  const BOTH_ERROR = '日期和時間都要填'
  return {
    opentixUrl: urlError(value('opentixUrl')) || (hasOpenAt && !value('opentixUrl') ? PAIR_ERROR : ''),
    opentixOpenDate: openDate ? '' : openTime ? BOTH_ERROR : value('opentixUrl') ? PAIR_ERROR : '',
    opentixOpenTime: openTime && !TIME_PATTERN.test(openTime)
      ? '請用 24 小時制，例如 12:00'
      : !openTime && openDate ? BOTH_ERROR : '',
    discountCode: lengthError(value('discountCode'), 32),
    orderListUrl: urlError(value('orderListUrl')),
    transferBankName: lengthError(value('transferBankName'), 60),
    transferBankCode: digitsError(value('transferBankCode'), 3, 3),
    transferBranchName: lengthError(value('transferBranchName'), 60),
    transferBranchCode: digitsError(value('transferBranchCode'), 4, 4),
    transferAccountNumber: digitsError(value('transferAccountNumber'), 1, 20),
    transferAccountName: lengthError(value('transferAccountName'), 100)
  }
})

const hasErrors = computed(() => !!webhookError.value || Object.values(errors.value).some(Boolean))

// Only fields that changed are sent; a cleared field is sent as null, never ''
const changes = computed<UpdateConcertBody>(() => {
  const body: UpdateConcertBody = {}
  if (!concert.value) return body

  const trimmedName = name.value.trim()
  if (trimmedName !== (concert.value.name ?? '')) {
    body.name = trimmedName
  }
  // A new URL entered after 刪除 replaces the old one instead of clearing it
  if (sheetWebhook.value.trim()) {
    body.sheetWebhook = sheetWebhook.value.trim()
  } else if (removeWebhook.value) {
    body.sheetWebhook = null
  }

  for (const field of Object.keys(info) as InfoField[]) {
    const value = info[field].trim()
    if (value === toFormValue(field, concert.value[field])) continue
    if (!value) {
      body[field] = null
    } else {
      body[field] = toApiValue(field, value)
    }
  }
  return body
})

const canSave = computed(() => Object.keys(changes.value).length > 0 && !hasErrors.value)

const goBack = () => {
  router.push({ name: 'AdminConcerts' })
}

const onSubmit = async () => {
  if (!concert.value || submitting.value) return

  submitting.value = true
  submitError.value = ''
  try {
    await updateConcert(concert.value.tag, changes.value)
    showNotification('已更新場次', 'success')
    goBack()
  } catch (error) {
    const { status, message, missingFields } = error as ApiError
    if (status === 404) {
      showNotification('場次不存在', 'error')
      goBack()
    } else if (missingFields?.length) {
      submitError.value = `訂票開放中，不能清除：${formatInfoFields(missingFields)}。請先關閉售票`
    } else if (status !== 401) {
      submitError.value = message || '儲存失敗，請稍後再試'
    }
  } finally {
    submitting.value = false
  }
}
</script>
