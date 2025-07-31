<template>
  <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
      <div class="mb-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
      
      <h2 class="text-xl font-semibold mb-2 text-red-600">伺服器連接失敗</h2>
      <p class="text-gray-600 mb-6">
        伺服器在 2 分鐘內未能回應，請稍後再試。
      </p>
      
      <button 
        @click="onRetry"
        class="w-full px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
      >
        重新嘗試
      </button>
      
      <div class="mt-4 text-xs text-gray-500">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  error: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()

const onRetry = () => {
  emit('retry')
}
</script>