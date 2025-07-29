<template>
  <div class='max-w-[1500px] mx-auto'>
    <div class='flex items-center justify-center pt-4'>
      <img src="/shimmering_vocals.png" class="h-15" alt="logo" />
      <span class='mobile:text-2xl text-xl font-bold'>煦豐蒔光 2025 年度音樂會</span>
    </div>
    <router-view />
  </div>
</template>

<script>
import 'virtual:uno.css'
import { ref } from 'vue'
import SeatMap from './components/seat-map'
import InfoPanel from './components/info-panel'

export default {
  components: {
    SeatMap,
    InfoPanel,
  },
  setup() {
    const enabled = ref(false)
    const isInfoPanelVisible = ref(false)

    const onInfoPanelOpen = () => isInfoPanelVisible.value = true
    const onInfoPanelClose = () => isInfoPanelVisible.value = false

    return {
      enabled,
      isInfoPanelVisible,
      onInfoPanelOpen,
      onInfoPanelClose,
    }
  },
}

</script>
