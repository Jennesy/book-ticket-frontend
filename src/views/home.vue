<template>
  <div class='flex items-center justify-center text-size-5.5 gap-2 translate-x-4 text-gray-600 font-bold mb-4'>
    <div>座位圖</div>
    <v-icon size='22' class='!text-gray-600 !hover:text-gray-900 cursor-pointer absolute top-0 right-0' @click='onInfoPanelOpen'>mdi-information</v-icon>
  </div>
  <SeatMap />
  <InfoPanel v-if="isInfoPanelVisible" @close="onInfoPanelClose" />
</template>

<script>
  import { ref } from 'vue'
  import SeatMap from '@/components/seat-map'
  import InfoPanel from '@/components/info-panel'

  export default {
    components: {
      SeatMap,
      InfoPanel,
    },
    setup() {
      const isInfoPanelVisible = ref(false)

      const onInfoPanelOpen = () => isInfoPanelVisible.value = true
      const onInfoPanelClose = () => isInfoPanelVisible.value = false

      return {
        isInfoPanelVisible,
        onInfoPanelOpen,
        onInfoPanelClose,
      }
    }
  }
</script>