<template>
  <div class="order-list pa-4">
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
      <span class="text-sm text-gray-500 flex items-center flex-wrap gap-1">
        <v-icon>mdi-alert-circle</v-icon>
        如果刪除訂單，請手動到<a :href='orderListUrl' target='_blank'>訂單列表</a>備註更新狀態
      </span>
      <Button
        class="shrink-0"
        color="primary"
        @click="refreshOrders"
        :loading="loading"
        prepend-icon="mdi-refresh"
      >
        重新整理
      </Button>
    </div>
    <div class="overflow-x-auto">
      <DataTable
        :headers="headers"
        :items="orders"
        :loading="loading"
        loading-text="載入訂單中..."
        no-data-text="暫無訂單資料"
        :items-per-page="itemsPerPage"
        :items-per-page-options="itemsPerPageOptions"
      >
        <template #item.seatIds="{ item }">
          <div class="flex flex-wrap gap-1 max-w-60">
            <span 
              v-for="seat in item.seatIds"
              :key="seat._id"
              class="bg-blue-50 border border-blue-500 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap min-w-11"
            >
              {{ seat.row }}{{ seat.col }}
            </span>
          </div>
        </template>

        <template #item.totalPrice="{ item }">
          NT${{ item.totalPrice.toLocaleString() }}
        </template>

        <template #item.programBookCount="{ item }">
          {{ item.programBookCount }} 本
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDateTime(item.createdAt) }}
        </template>

        <template #item.status="{ item }">
          <span 
            :class="[
              'px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
              item.isDeleted 
                ? 'bg-red-50 border-red-500 text-red-600' 
                : 'bg-green-50 border-green-500 text-green-600'
            ]"
          >
            {{ item.isDeleted ? '已刪除' : '有效' }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="flex gap-1 flex-nowrap justify-start action-buttons">
            <Button
              prepend-icon="mdi-eye"
              size="small"
              variant="text"
              @click="viewOrder(item)"
            />
            <Button
              v-if="!item.isDeleted"
              prepend-icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteOrder(item)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Order Detail Dialog -->
    <Dialog v-model="detailDialog" max-width="600px">
      <div v-if="selectedOrder" class="pa-4">
        <h3 class="mb-4">訂單詳情 - {{ selectedOrder.userName }}</h3>
        <div class="order-details">
          <div class="detail-row">
            <div class="detail-item">
              <strong>姓名：</strong>{{ selectedOrder.userName }}
            </div>
            <div class="detail-item">
              <strong>總金額：</strong>NT${{ selectedOrder.totalPrice.toLocaleString() }}
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <strong>節目冊數量：</strong>{{ selectedOrder.programBookCount }} 本
            </div>
            <div class="detail-item">
              <strong>狀態：</strong>
              <span 
                :class="[
                  'px-3 py-1 ml-2 rounded-full text-sm font-medium border',
                  selectedOrder.isDeleted 
                    ? 'bg-red-50 border-red-500 text-red-600' 
                    : 'bg-green-50 border-green-500 text-green-600'
                ]"
              >
                {{ selectedOrder.isDeleted ? '已刪除' : '有效' }}
              </span>
            </div>
          </div>
          <div class="detail-row full-width">
            <div class="detail-item">
              <strong>座位：</strong>
              <div class="flex gap-1 flex-wrap mt-2">
                <span 
                  v-for="seat in selectedOrder.seatIds"
                  :key="seat._id"
                  class="bg-blue-50 border border-blue-500 text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ seat.row }}{{ seat.col }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="selectedOrder.isDeleted && selectedOrder.deletedAt" class="detail-row full-width">
            <div class="detail-item">
              <strong>取消時間：</strong>{{ formatDateTime(selectedOrder.deletedAt) }}
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <Button @click="detailDialog = false">關閉</Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '@/components/common/button.vue'
import DataTable from '@/components/common/data-table.vue'
import Dialog from '@/components/common/dialog.vue'

interface Seat {
  _id: string
  row: string
  col: number
  price: number
}

interface Reservation {
  _id: string
  userName: string
  seatIds: Seat[] // populated seat objects
  programBookCount: number
  totalPrice: number
  createdAt: string
  isDeleted: boolean
  deletedAt?: string
  originalReservationId?: string
}
const orderListUrl = import.meta.env.VITE_ORDER_LIST_URL

const loading = ref(false)
const orders = ref<Reservation[]>([])
const detailDialog = ref(false)
const selectedOrder = ref<Reservation | null>(null)

const itemsPerPage = ref(10)
const itemsPerPageOptions = [
  { value: 5, title: '5' },
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: -1, title: '全部' }
]

const headers = [
  { title: '姓名', key: 'userName', sortable: true, width: '100px' },
  { title: '座位', key: 'seatIds', sortable: false },
  { title: '節目冊', key: 'programBookCount', sortable: true, width: '100px' },
  { title: '總金額', key: 'totalPrice', sortable: true, width: '100px' },
  { title: '狀態', key: 'status', sortable: false, width: '80px' },
  { title: '建立時間', key: 'createdAt', sortable: true, width: '140px' },
  { title: '操作', key: 'actions', sortable: false, width: '120px' }
]

const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reserve`)
    if (response.ok) {
      orders.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

const refreshOrders = () => {
  fetchOrders()
}

const viewOrder = (order: Reservation) => {
  selectedOrder.value = order
  detailDialog.value = true
}

const deleteOrder = async (order: Reservation) => {
  if (confirm(`確定要刪除 ${order.userName} 的訂單嗎？`)) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/reserve/${order._id}`,
        { method: 'DELETE' }
      )
      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
  }
}

const restoreOrder = async (order: Reservation) => {
  if (confirm(`確定要恢復 ${order.userName} 的訂單嗎？`)) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/reserve/${order._id}/restore`,
        { method: 'PATCH' }
      )
      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Failed to restore order:', error)
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list {
  height: 100%;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  gap: 24px;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-item {
  flex: 1;
  min-width: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>