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
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/button.vue'
import { useTicketingStatus } from '@/composables/useTicketingStatus'

const { ticketingStatus, loading, updateTicketingStatus } = useTicketingStatus()

const toggleTicketingStatus = async () => {
  try {
    const newStatus = !ticketingStatus.value.open
    await updateTicketingStatus(newStatus)
  } catch (error) {
    alert('更新售票狀態失敗，請稍後再試')
  }
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}
</script>