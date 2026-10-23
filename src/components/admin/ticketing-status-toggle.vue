<template>
  <div>
    <div class="flex items-center flex-col mobile:flex-row gap-4 p-2 mobile:p-4 border rounded-lg bg-white">
      <div class="flex self-start mobile:self-center items-center gap-2">
        <v-icon 
          :color="ticketingStatus.open ? 'success' : 'error'"
          size="24"
        >
          {{ ticketingStatus.open ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
        <div>
          <div class="font-medium">
            售票系統狀態：
            <span :class="ticketingStatus.open ? 'text-green-600' : 'text-red-600'">
              {{ ticketingStatus.open ? '開放中' : '已關閉' }}
            </span>
          </div>
          <div v-if="ticketingStatus.updatedAt" class="text-sm text-gray-500">
            最後更新：{{ formatDateTime(ticketingStatus.updatedAt) }}
          </div>
        </div>
      </div>
      
      <div class="ml-auto flex items-center gap-2">
        <Button
          :color="ticketingStatus.open ? 'error' : 'success'"
          :loading="loading"
          @click="toggleTicketingStatus"
          :prepend-icon="ticketingStatus.open ? 'mdi-close' : 'mdi-check'"
        >
          {{ ticketingStatus.open ? '關閉售票' : '開放售票' }}
        </Button>
      </div>
    </div>
    <div
      v-if="!ticketingStatus.open && missingFields.length"
      class="flex items-center justify-end gap-1 mt-2 text-sm text-amber-700"
    >
      <v-icon size="18">mdi-alert</v-icon>
      <span>
        開放售票前，請先到
        <router-link :to="{ name: 'AdminConcertEdit', params: { tag: activeTag } }" class="underline">場次管理</router-link>
        補上 {{ formatInfoFields(missingFields) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/common/button.vue'
import { useTicketingStatus } from '@/composables/useTicketingStatus'
import { useActiveConcert } from '@/composables/useActiveConcert'
import { formatInfoFields, type ApiError, type ConcertInfo } from '@/composables/useConcerts'

const { ticketingStatus, loading, updateTicketingStatus } = useTicketingStatus()
const { activeTag } = useActiveConcert()

// The backend decides which fields are required to open; we only show what it reports
const missingFields = ref<(keyof ConcertInfo)[]>([])

const toggleTicketingStatus = async () => {
  try {
    const newStatus = !ticketingStatus.value.open
    await updateTicketingStatus(newStatus)
    missingFields.value = []
  } catch (error) {
    const { status, missingFields: fields } = error as ApiError
    // 401 is already reported by adminFetch
    if (status === 401) return
    if (fields?.length) {
      missingFields.value = fields
      return
    }
    alert('更新售票狀態失敗，請稍後再試')
  }
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}
</script>