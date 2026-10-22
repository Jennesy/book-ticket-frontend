<template>
  <div class="flex justify-center pt-16">
    <form class="w-full max-w-sm p-6 border rounded-lg bg-white" @submit.prevent="onSubmit">
      <h2 class="text-5 font-medium mb-4">請輸入管理員金鑰</h2>
      <v-text-field
        v-model="key"
        type="password"
        label="管理員金鑰"
        variant="outlined"
        density="comfortable"
        autocomplete="current-password"
        autofocus
        :error-messages="errorMessage"
        @update:model-value="errorMessage = ''"
      />
      <Button
        color="primary"
        block
        :loading="loading"
        :disabled="!key"
        @click="onSubmit"
      >
        登入
      </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/common/button.vue'
import { useAdminAuth } from '@/composables/useAdminAuth'

const { verifyAndLogin } = useAdminAuth()

const key = ref('')
const loading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  if (!key.value || loading.value) return

  try {
    loading.value = true
    const isValid = await verifyAndLogin(key.value)
    if (!isValid) {
      errorMessage.value = '金鑰錯誤'
    }
  } catch (error) {
    console.error('Failed to verify admin key:', error)
    errorMessage.value = '無法連線，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
