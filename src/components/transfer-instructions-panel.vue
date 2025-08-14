<template>
  <Dialog modelValue='true' width='600' :fullscreen='isMobile' @close='onClose'>
    <template #title>
      <slot name='title'></slot>
    </template>
    <div class='flex flex-col gap-6'>
      <div class='flex gap-2 items-start'>
        <div class='w-7 mobile:w-8 aspect-square bg-emerald-900 text-white rounded-full flex items-center justify-center text-lg mobile:text-xl font-bold flex-shrink-0 '> 1 </div>
        <div class='mobile:text-lg'>到
          <a :href='orderListUrl' target='_blank'>
            <div class="mx-2 inline-flex items-center translate-y-0.5 px-4 py-1 bg-emerald-700 rounded-lg hover:bg-emerald-800 saturate-50 text-white">
              <v-icon size='18' class='mr-1'>mdi-open-in-new</v-icon>
              <div>訂單列表</div>
            </div>
          </a>
          查看訂單資訊<br>
          找到自己的 <span class='font-bold px-1 bg-emerald-100 saturate-50'>訂單號碼</span> 與 <span class='font-bold px-1 bg-orange-100 saturate-50'>金額</span>
        </div>
      </div>
      <div class='flex gap-2 items-start'>
        <div class='w-7 mobile:w-8 aspect-square bg-orange-900 text-white rounded-full flex items-center justify-center text-lg mobile:text-xl font-bold flex-shrink-0 '> 2 </div>
        <div class='flex flex-col mobile:text-lg flex-grow-1'>
          <div class='mb-2'>完成匯款後，請在備註欄位寫上<span class='font-bold px-1 bg-emerald-100 saturate-50'>訂單號碼</span></div>
          <div class='border border-gray-200 rounded-xl px-6 py-4 bg-orange-50 shadow-sm'>
            <div class='space-y-2'>
              <div class='flex justify-between items-center py-2 border-b border-gray-100'>
                <span class='text-gray-600 font-medium'>銀行代碼</span>
                <span class='font-mono font-semibold text-gray-800'>{{ transferAccount.bank }}</span>
              </div>
              <div class='flex justify-between items-center py-2 border-b border-gray-100'>
                <span class='text-gray-600 font-medium'>分行代碼</span>
                <span class='font-mono font-semibold text-gray-800'>{{ transferAccount.branch }}</span>
              </div>
              <div class='flex justify-between items-center py-2 border-b border-gray-100'>
                <span class='text-gray-600 font-medium'>銀行帳號</span>
                <div class='flex items-center gap-2'>
                  <span class='font-mono font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg'>{{ transferAccount.accountNumber }}</span>
                  <button @click='onCopy' class='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'>
                    <v-icon size='18'>mdi-content-copy</v-icon>
                  </button>
                </div>
              </div>
              <div class='flex justify-between items-center py-2'>
                <span class='text-gray-600 font-medium'>戶名</span>
                <span class='font-semibold text-gray-800'>{{ transferAccount.accountName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class='mt-2 text-size-5 mobile:text-size-6 text-center font-bold text-orange-600 saturate-50'>待財務組確認匯款即完成購票！</div>
      <slot name='content'></slot>
    </div>
  </Dialog> 
</template>

<script setup>
  import Dialog from '@/components/common/dialog.vue'
  import { useWindowSize } from '@/composables/useWindowSize'
  import { useCopyToClipboard } from '@/composables/useCopyToClipboard'

  const { isMobile } = useWindowSize()
  const { copyToClipboard } = useCopyToClipboard()
  const orderListUrl = import.meta.env.VITE_ORDER_LIST_URL
  const transferAccount = {
    bank: import.meta.env.VITE_TRANSFER_BANK_NAME,
    branch: import.meta.env.VITE_TRANSFER_BANK_BRANCH,
    accountNumber: import.meta.env.VITE_TRANSFER_BANK_ACCOUNT_NUMBER,
    accountName: import.meta.env.VITE_TRANSFER_BANK_ACCOUNT_OWNER
  }

  const onCopy = () => {
    copyToClipboard(transferAccount.accountNumber, '帳號已複製到剪貼簿')
  }
</script>