<template>
  <Dialog :model-value="modelValue" width="520" @update:model-value="$emit('update:modelValue', $event)">
    <template #title>編輯場次</template>

    <div v-if="concert" class="flex flex-col gap-4 pt-2">
      <v-text-field
        :model-value="formatTag(concert.tag)"
        label="日期"
        variant="solo-filled"
        flat
        readonly
        hide-details="auto"
        hint="建立後不可修改"
        persistent-hint
      />
      <v-text-field
        v-model="name"
        label="名稱"
        variant="solo-filled"
        flat
        hide-details="auto"
      />
      <div>
        <div class="text-sm text-gray-600 mb-1">
          試算表 Webhook：
          <span :class="concert.hasSheetWebhook ? 'text-green-600' : 'text-amber-700'">
            {{ concert.hasSheetWebhook ? '已設定' : '未設定' }}
          </span>
        </div>
        <v-text-field
          v-model="sheetWebhook"
          :label="concert.hasSheetWebhook ? '新的 Webhook（留空表示不修改）' : 'Webhook（留空表示不設定）'"
          :placeholder="SHEET_WEBHOOK_PREFIX"
          :disabled="removeWebhook"
          variant="solo-filled"
          flat
          hide-details="auto"
          :error-messages="webhookError"
        />
        <v-checkbox
          v-if="concert.hasSheetWebhook"
          v-model="removeWebhook"
          label="移除試算表設定"
          density="compact"
          hide-details
        />
      </div>
      <div v-if="submitError" class="text-sm text-red-600">{{ submitError }}</div>
    </div>

    <template #footer-action>
      <div class="flex justify-end gap-2 w-full">
        <Button variant="text" @click="$emit('update:modelValue', false)">取消</Button>
        <Button color="primary" :disabled="!canSave" :loading="submitting" @click="onSubmit">儲存</Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from '@/components/common/dialog.vue'
import Button from '@/components/common/button.vue'
import { useNotification } from '@/composables/useNotification'
import { useConcertApi, SHEET_WEBHOOK_PREFIX, type Concert, type ApiError, type UpdateConcertBody } from '@/composables/useConcerts'
import { formatTag } from '@/utils/concert-tag'

const props = defineProps<{
  modelValue: boolean
  concert: Concert | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
  'not-found': []
}>()

const { updateConcert } = useConcertApi()
const { showNotification } = useNotification()

const name = ref('')
const sheetWebhook = ref('')
const removeWebhook = ref(false)
const submitError = ref('')
const submitting = ref(false)

// The API never returns the webhook URL, so the field starts empty and empty means "no change"
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) return
  name.value = props.concert?.name ?? ''
  sheetWebhook.value = ''
  removeWebhook.value = false
  submitError.value = ''
})

const webhookError = computed(() => {
  const value = sheetWebhook.value.trim()
  if (!removeWebhook.value && value && !value.startsWith(SHEET_WEBHOOK_PREFIX)) {
    return `必須以 ${SHEET_WEBHOOK_PREFIX} 開頭`
  }
  return ''
})

// Only fields that changed are sent
const changes = computed<UpdateConcertBody>(() => {
  const body: UpdateConcertBody = {}
  const trimmedName = name.value.trim()
  if (trimmedName !== (props.concert?.name ?? '')) {
    body.name = trimmedName
  }
  if (removeWebhook.value) {
    body.sheetWebhook = null
  } else if (sheetWebhook.value.trim()) {
    body.sheetWebhook = sheetWebhook.value.trim()
  }
  return body
})

const canSave = computed(() => Object.keys(changes.value).length > 0 && !webhookError.value)

const onSubmit = async () => {
  if (!props.concert || submitting.value) return

  submitting.value = true
  submitError.value = ''
  try {
    await updateConcert(props.concert.tag, changes.value)
    showNotification('已更新場次', 'success')
    emit('updated')
    emit('update:modelValue', false)
  } catch (error) {
    const { status, message } = error as ApiError
    if (status === 404) {
      showNotification('場次不存在', 'error')
      emit('not-found')
      emit('update:modelValue', false)
    } else if (status !== 401) {
      submitError.value = message || '儲存失敗，請稍後再試'
    }
  } finally {
    submitting.value = false
  }
}
</script>
