<template>
  <div>
    <div class="flex justify-end mb-4">
      <Button color="primary" prepend-icon="mdi-plus" @click="isCreateDialogOpen = true">
        建立新場次
      </Button>
    </div>

    <div class="overflow-x-auto">
      <DataTable
        :headers="headers"
        :items="concerts"
        :loading="loading"
        loading-text="載入場次中..."
        no-data-text="目前沒有場次"
      >
        <template #item.tag="{ item }">
          <div class="flex items-center gap-2 whitespace-nowrap">
            {{ formatTag(item.tag) }}
            <span
              v-if="item.tag === activeTag"
              class="px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 border-blue-500 text-blue-600"
            >
              當前
            </span>
          </div>
        </template>

        <template #item.name="{ item }">
          {{ item.name || '—' }}
        </template>

        <template #item.missing="{ item }">
          <span
            :class="[
              'px-2 py-0.5 rounded-full text-xs font-medium border',
              missingLabels(item).length
                ? 'bg-amber-50 border-amber-500 text-amber-700'
                : 'bg-green-50 border-green-500 text-green-600'
            ]"
          >
            {{ missingLabels(item).length ? `未完成：${missingLabels(item).join('、')}` : '已完成' }}
          </span>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDateTime(item.createdAt) }}
        </template>

        <template #item.actions="{ item }">
          <Button
            prepend-icon="mdi-pencil"
            size="small"
            variant="text"
            :to="{ name: 'AdminConcertEdit', params: { tag: item.tag } }"
          />
        </template>
      </DataTable>
    </div>

    <ConcertCreateDialog
      v-model="isCreateDialogOpen"
      :concerts="concerts"
      :active-tag="activeTag"
      @created="onCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/common/button.vue'
import DataTable from '@/components/common/data-table.vue'
import ConcertCreateDialog from '@/components/admin/concert-create-dialog.vue'
import { useConcerts, type Concert } from '@/composables/useConcerts'
import { useNotification } from '@/composables/useNotification'
import { formatTag } from '@/utils/concert-tag'

const router = useRouter()
const { showNotification } = useNotification()
const { concerts, activeTag, loading } = useConcerts()

const isCreateDialogOpen = ref(false)

const headers = [
  { title: '日期', key: 'tag', sortable: false, width: '160px' },
  { title: '名稱', key: 'name', sortable: false },
  { title: '設定狀態', key: 'missing', sortable: false },
  { title: '建立時間', key: 'createdAt', sortable: false, width: '180px' },
  { title: '操作', key: 'actions', sortable: false, width: '80px' }
]

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

// Fields left blank on purpose (e.g. no group discount) still show, as a reminder to double-check
const missingLabels = (concert: Concert) => [
  !concert.hasSheetWebhook && '訂單列表 Webhook',
  !(concert.opentixUrl && concert.opentixOpenAt) && 'OPENTIX',
  !concert.discountCode && '折扣碼',
  !concert.groupDiscountDeadline && '團購截止',
  !concert.orderListUrl && '訂單列表連結',
  !(concert.transferBankName && concert.transferBankCode && concert.transferBranchName && concert.transferBranchCode && concert.transferAccountNumber && concert.transferAccountName) && '匯款帳戶'
].filter((label): label is string => !!label)

const onCreated = () => {
  showNotification('已建立場次，訂票已關閉。請檢查座位配置，並在場次管理補上 OPENTIX 等資訊後再開放訂票', 'success', 'long')
  router.push({ name: 'Admin' })
}
</script>
