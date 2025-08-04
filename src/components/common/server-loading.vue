<template>
  <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div class="p-8 max-w-md mx-4 text-center">
      <div class="mb-4">
        <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
      
      <h2 class="text-gray-200 text-xl font-semibold mb-2">正在喚醒伺服器</h2>
      <p class="text-gray-400 mb-4">
        伺服器正在啟動中，請稍候...
      </p>
      
      <div class="text-sm text-gray-300">
        <div>嘗試次數: {{ attempts }}/{{ maxAttempts }}</div>
        <div v-if="attempts > 0" class="mt-2">
          預計還需要 {{ estimatedTime }} 秒
        </div>
      </div>
      
      <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-primary h-2 rounded-full transition-all duration-500" 
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
      
      <div v-if="attempts > 10" class="mt-4 text-xs text-yellow-600">
        ⏰ 伺服器需要較長時間啟動，請耐心等候
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  attempts: number
  maxAttempts: number
}

const props = defineProps<Props>()

const startTime = ref(0)
const currentTime = ref(0)
let intervalId: number | null = null

const progressPercent = computed(() => {
  return Math.min((props.attempts / props.maxAttempts) * 100, 100)
})

const estimatedTime = computed(() => {
  const totalEstimatedTime = props.maxAttempts * 3 // Total time in seconds
  const elapsedTime = currentTime.value - startTime.value // Elapsed time since start
  const remainingTime = Math.max(0, totalEstimatedTime - elapsedTime)
  
  return Math.ceil(remainingTime) // Return as integer seconds
})

onMounted(() => {
  startTime.value = Date.now() / 1000 // Record start time in seconds
  currentTime.value = startTime.value
  
  // Update every second
  intervalId = setInterval(() => {
    currentTime.value = Date.now() / 1000
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>