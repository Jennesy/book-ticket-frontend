<template>
  <TransferInstructionsPanel @close='onClose'>
    <template #title>
      <div>匯款資訊</div>
    </template>
    <template #content>
      <v-divider class='-my-1'></v-divider>
      <div>
        <div class='text-xl font-bold -translate-x-2 mb-2'>OPENTIX 線上購票</div>
        <div>9/1 (五) 12:00 OPENTIX 開放線上購票 <a href='https://bit.ly/3KOuqT4
  '>購票連結</a></div>
        <div>(開放後才會顯示網頁內容)</div>
        <div>團內親友 輸入折扣碼 <span class='font-bold bg-gray-200 px-2 py-1 rounded-md'>SV2023</span> <v-icon size='16' class='cursor-pointer hover:bg-gray-200 rounded-full' @click='onCopy'>mdi-content-copy</v-icon></div>
      </div>
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

  const onCopy = () => {
    navigator.clipboard.writeText('SV2023')
  }
</script>