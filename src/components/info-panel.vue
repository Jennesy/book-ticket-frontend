<template>
  <TransferInstructionsPanel @close='onClose'>
    <template #title>
      <div>匯款資訊</div>
    </template>
    <template #content>
      <div>
        <v-divider class='-my-1 mb-6'></v-divider>
        <div class='text-xl font-bold mb-2'>OPENTIX 線上購票</div>
        <div class='bg-indigo-50 border border-indigo-200 rounded-xl p-6'>
          <div class='space-y-4'>
            <!-- Open time and link are shown together; one without the other is not usable -->
            <template v-if='opentixOpenAt && opentixUrl'>
              <div class='bg-white rounded-lg p-4 border border-indigo-100'>
                <div class='flex items-center gap-2 mb-2'>
                  <v-icon size='18'>mdi-calendar-clock</v-icon>
                  <span class='font-semibold text-gray-800'>開放時間</span>
                </div>
                <div class='mobile:text-lg font-medium text-gray-700'>{{ formatTaipeiShort(opentixOpenAt) }} OPENTIX 開放線上購票</div>
                <div class='text-sm text-gray-500 mt-1'>(開放後才會顯示網頁內容)</div>
              </div>
              <div class='bg-white rounded-lg p-4 border border-indigo-100'>
                <div class='flex items-center gap-2 mb-3'>
                  <v-icon size='18'>mdi-link</v-icon>
                  <span class='font-semibold text-gray-800'>購票連結</span>
                </div>
                <a :href='opentixUrl' target='_blank' class='inline-flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-950 transition-colors font-medium text-sm mobile:text-base'>
                  <v-icon size='18'>mdi-open-in-new</v-icon>
                  前往 OPENTIX 購票
                </a>
              </div>
            </template>
            <div v-else class='bg-white rounded-lg p-4 border border-indigo-100'>
              <div class='flex items-center gap-2'>
                <v-icon size='18'>mdi-calendar-clock</v-icon>
                <span class='font-medium text-gray-700 mobile:text-lg'>線上購票資訊尚未公布</span>
              </div>
            </div>
            <div class='bg-light-50 rounded-lg p-4 border'>
              <div class='flex items-center gap-2 mb-3'>
                <v-icon size='18'>mdi-tag-outline</v-icon>
                <span class='font-semibold text-gray-800'>團內親友優惠</span>
              </div>
              <div v-if='discountCode' class='flex items-center gap-3'>
                <span class='text-gray-700'>輸入折扣碼</span>
                <div class='flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-orange-200'>
                  <span class='font-bold text-orange-700 font-mono mobile:text-lg'>{{ discountCode }}</span>
                  <button @click='onCopy' class='p-1 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors'>
                    <v-icon size='16'>mdi-content-copy</v-icon>
                  </button>
                </div>
              </div>
              <div v-else class='text-gray-700'>折扣碼尚未公布</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </TransferInstructionsPanel>
</template>

<script setup>
  import { computed } from 'vue'
  import TransferInstructionsPanel from './transfer-instructions-panel.vue'
  import { useCopyToClipboard } from '@/composables/useCopyToClipboard'
  import { useActiveConcert } from '@/composables/useActiveConcert'
  import { formatTaipeiShort } from '@/utils/date'

  const emit = defineEmits(['close'])
  const { copyToClipboard } = useCopyToClipboard()
  const { activeConcert } = useActiveConcert()

  const onClose = () => {
    emit('close')
  }

  const opentixUrl = computed(() => activeConcert.value?.opentixUrl)
  const opentixOpenAt = computed(() => activeConcert.value?.opentixOpenAt)
  const discountCode = computed(() => activeConcert.value?.discountCode)

  const onCopy = () => {
    copyToClipboard(discountCode.value, '折扣碼已複製到剪貼簿')
  }
</script>