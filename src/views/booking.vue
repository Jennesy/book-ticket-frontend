<template>
  <!-- Ticketing Closed Message -->
  <div v-if="!ticketingStatus.open" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
      <div class="mb-4">
        <v-icon size="48" color="error">mdi-ticket-outline</v-icon>
      </div>
      
      <h2 class="text-xl font-semibold mb-2 text-red-600">售票系統已關閉</h2>
      <p class="text-gray-600 mb-6">
        如有開啟需求，請洽詢管理員。
      </p>
      
      <Button 
        color="primary"
        @click="goToHome"
      >
        返回首頁
      </Button>
    </div>
  </div>

  <!-- Normal Booking View -->
  <template v-else>
    <div class='flex items-center justify-center text-size-5.5 gap-2 translate-x-4 text-gray-600 font-bold mb-4'>
      <div>團內訂票</div>
      <v-icon size='22' class='!text-gray-600 !hover:text-gray-900 cursor-pointer absolute top-0 right-0' @click='onInfoPanelOpen'>mdi-information</v-icon>
    </div>
    <SeatMap mode='book' />
    <InfoPanel v-if="isInfoPanelVisible" @close="onInfoPanelClose" />
  </template>
</template>

<script>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import SeatMap from '@/components/seat-map'
  import InfoPanel from '@/components/info-panel'
  import Button from '@/components/common/button.vue'
  import { useTicketingStatus } from '@/composables/useTicketingStatus'

  export default {
    components: {
      SeatMap,
      InfoPanel,
      Button,
    },
    setup() {
      const router = useRouter()
      const { ticketingStatus } = useTicketingStatus()
      const isInfoPanelVisible = ref(false)

      const onInfoPanelOpen = () => isInfoPanelVisible.value = true
      const onInfoPanelClose = () => isInfoPanelVisible.value = false

      const goToHome = () => {
        router.push('/')
      }

      return {
        ticketingStatus,
        isInfoPanelVisible,
        onInfoPanelOpen,
        onInfoPanelClose,
        goToHome,
      }
    }
  }
</script>