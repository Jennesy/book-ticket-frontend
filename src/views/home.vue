<template>
  <div class='flex items-center justify-center text-size-5.5 gap-2 translate-x-4 text-gray-600 font-bold -mb-3'>
    <div>座位圖</div>
    <v-icon size='22' class='!text-gray-600 !hover:text-gray-900 cursor-pointer absolute top-0 right-0' @click='onInfoPanelOpen'>mdi-information</v-icon>
  </div>
  <div class='flex items-center justify-end text-indigo-600 hover:text-indigo-900 cursor-pointer -translate-x-2 translate-y-1 text-sm' @click='onToBookingClick'>前往購票
    <v-icon size='18'>mdi-arrow-right</v-icon>
  </div>
  <SeatMap />
  <InfoPanel v-if="isInfoPanelVisible" @close="onInfoPanelClose" />
</template>

<script>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import SeatMap from '@/components/seat-map'
  import InfoPanel from '@/components/info-panel'

  export default {
    components: {
      SeatMap,
      InfoPanel,
    },
    setup() {
      const isInfoPanelVisible = ref(false)
      const router = useRouter()
      const onInfoPanelOpen = () => isInfoPanelVisible.value = true
      const onInfoPanelClose = () => isInfoPanelVisible.value = false

      const onToBookingClick = () => router.push('/booking')

      return {
        isInfoPanelVisible,
        onInfoPanelOpen,
        onInfoPanelClose,
        onToBookingClick,
      }
    }
  }
</script>