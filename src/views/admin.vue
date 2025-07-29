<template>
  <div class='flex items-center justify-center text-size-5.5 gap-2 translate-x-4 text-gray-600 font-bold mb-4'>
    <div>管理後台</div>
  </div>
  <SeatMap mode='edit' />
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