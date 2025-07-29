<template>
  <TransferInstructionsPanel @close='onClose'>
    <template #title>
      <div>請前往匯款</div>
    </template>
  </TransferInstructionsPanel>
</template>

<script setup>
  import TransferInstructionsPanel from './transfer-instructions-panel.vue'
  import Dialog from '@/components/common/dialog.vue'

  const emit = defineEmits(['close'])

  const onClose = () => {
    emit('close')
  }
</script>