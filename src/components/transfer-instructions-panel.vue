<template>
  <Dialog modelValue='true' width='500' :fullscreen='isMobile' @close='onClose'>
    <template #title>
      <slot name='title'></slot>
    </template>
    <div class='flex flex-col gap-6'>
      <div class='flex gap-2 items-start'>
        <div class='w-7 mobile:w-8 aspect-square bg-gray-600 text-white rounded-full flex items-center justify-center text-lg mobile:text-xl font-bold flex-shrink-0 '> 1 </div>
        <div class='mobile:text-lg'>到<a href='https://docs.google.com/spreadsheets/d/1b9FVc7L0r_NvNOFQJsuUSoazTQKjKubuInqlOjRiM0c/edit?usp=sharing' target='_blank'>
            <span class="inline-flex items-center translate-y-1">
              <v-icon>mdi-google-spreadsheet</v-icon>
              <div>訂單列表</div>
            </span>
          </a>
          ，找到自己的
          <span class='font-bold border-b-solid'>訂單號碼</span> 與 <span class='font-bold border-b-solid'>金額</span>
        </div>
      </div>
      <div class='flex gap-2 items-start'>
        <div class='w-7 mobile:w-8 aspect-square bg-gray-600 text-white rounded-full flex items-center justify-center text-lg mobile:text-xl font-bold flex-shrink-0 '> 2 </div>
        <div class='flex flex-col mobile:text-lg'>
          <div class='mb-2'>完成匯款後，請在備註欄位寫上<span class='font-bold border-b-solid'>訂單號碼</span></div>
          <div class='px-6 py-2 bg-gray-100 rounded-lg'>
            <div class='text-base'>銀行代碼：永豐銀行 807</div>
            <div class='text-base'>分行代碼：德惠分行 1583</div>
            <div class='text-base'>銀行帳號：{{ accountNumber }} <v-icon size='16' class='cursor-pointer hover:bg-gray-200 rounded-full' @click='onCopy'>mdi-content-copy</v-icon></div>
            <div class='text-base'>戶名：張雅筑</div>
          </div>
        </div>
      </div>
      <div class='mt-2 text-size-5 mobile:text-size-6 text-center font-bold text-red-400'>待財務組確認匯款即完成購票！</div>
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
  const accountNumber = '08801800387632'

  const onCopy = () => {
    copyToClipboard(accountNumber, '帳號已複製到剪貼簿')
  }
</script>