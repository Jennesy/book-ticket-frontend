<template>
  <Dialog modelValue='true' width='500' @close='onClose'>
    <template #title>
      <slot name='title'></slot>
    </template>
    <div class='flex flex-col gap-6'>
      <div class='flex gap-2 items-center'>
        <div class='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xl font-bold'> 1 </div>
        <div class='text-lg'>前往<a href='https://docs.google.com/spreadsheets/d/1b9FVc7L0r_NvNOFQJsuUSoazTQKjKubuInqlOjRiM0c/edit?usp=sharing' target='_blank'>
            <span class="inline-flex items-center translate-y-1">
              <v-icon>mdi-google-spreadsheet</v-icon>
              <div>訂單列表</div>
            </span>
          </a>
          ，確認 
          <span class='font-bold border-b-solid'>訂單編碼</span> 與 
          <span class='font-bold border-b-solid'>金額</span>
        </div>
      </div>
      <div class='flex gap-2 items-start'>
        <div class='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xl font-bold'> 2 </div>
        <div class='flex flex-col text-lg'>
          <div class='mb-2'>匯款，並在備著寫上<span class='font-bold border-b-solid'>訂單編碼</span></div>
          <div class='px-6 py-2 bg-gray-100 rounded-xl'>
            <div class='text-base'>銀行代碼：004</div>
            <div class='text-base'>分行代碼：民生 0808</div>
            <div class='text-base'>銀行帳號：080008007602</div>
            <div class='text-base'>戶名：許敬雅</div>
          </div>
        </div>
      </div>
      <div class='mt-2 text-size-6 text-center font-bold text-red-400'>待財務組確認匯款即完成購票！</div>
      <slot name='content'></slot>
    </div>
  </Dialog> 
</template>

<script setup>
  import Dialog from '@/components/common/dialog.vue'
</script>