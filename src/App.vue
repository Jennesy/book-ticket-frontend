<template>
  <!-- Server Loading Overlay - Show during wake up process -->
  <ServerLoading 
    v-if="healthState.isWakingUp" 
    :attempts="healthState.attempts" 
    :max-attempts="40"
  />

  <!-- Server Error - Show when connection fails -->
  <ServerError 
    v-else-if="!healthState.isConnected && healthState.error"
    :error="healthState.error"
    @retry="onRetryConnection"
  />

  <!-- Main App - Only show after backend is ready -->
  <div v-else class='max-w-[1500px] mx-auto'>
    <div class='flex items-center justify-center pt-4'>
      <img src="/shimmering_vocals.png" class="h-15" alt="logo" />
      <span class='mobile:text-2xl text-xl font-bold'>
        <span v-if='concertName'> {{ concertName }} </span>
        <span v-else>煦豐蒔光音樂會</span>
        票務系統
      </span>
    </div>
    <router-view />
  </div>
</template>

<script>
import 'virtual:uno.css'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SeatMap from './components/seat-map'
import InfoPanel from './components/info-panel'
import ServerLoading from './components/common/server-loading.vue'
import ServerError from './components/common/server-error.vue'
import { useBackendHealth } from './composables/useBackendHealth'
import { useActiveConcert } from './composables/useActiveConcert'

export default {
  components: {
    SeatMap,
    InfoPanel,
    ServerLoading,
    ServerError,
  },
  setup() {
    const enabled = ref(false)
    const isInfoPanelVisible = ref(false)
    const { healthState, wakeUpBackend, reset } = useBackendHealth()
    const route = useRoute()
    const { activeConcert } = useActiveConcert()
    // Admin pages have their own titles and may show other concerts
    const concertName = computed(() => route.path.startsWith('/admin') ? null : activeConcert.value?.name)

    const onInfoPanelOpen = () => isInfoPanelVisible.value = true
    const onInfoPanelClose = () => isInfoPanelVisible.value = false

    const onRetryConnection = async () => {
      reset()
      await wakeUpBackend()
    }

    // Start backend wake-up process when app mounts
    onMounted(async () => {
      await wakeUpBackend()
    })

    return {
      enabled,
      isInfoPanelVisible,
      healthState,
      concertName,
      onInfoPanelOpen,
      onInfoPanelClose,
      onRetryConnection,
    }
  },
}

</script>
