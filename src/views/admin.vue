<template>
  <div class="admin-page">
    <h1 class="text-6 mb-2">管理員後台</h1>
    
    <!-- Ticketing Status Toggle -->
    <TicketingStatusToggle class="mb-2" />
    
    <!-- Test CommonTabs -->
    <div>
      <Tabs
        v-model="activeTab"
        :tabs="tabItems"
        itemClass="pa-0"
      >
        <template #tab-seatMap>
          <div class="tab-content">
            <SeatMap mode="edit" />
          </div>
        </template>

        <template #tab-orders>
          <div class="tab-content">
            <OrderList />
          </div>
        </template>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tabs from '@/components/common/tabs.vue'
import SeatMap from '@/components/seat-map/index.vue'
import OrderList from '@/components/admin/order-list.vue'
import TicketingStatusToggle from '@/components/admin/ticketing-status-toggle.vue'

const activeTab = ref('seatMap')

const tabItems = [
  {
    title: '座位表管理',
    value: 'seatMap',
    icon: 'mdi-seat-outline'
  },
  {
    title: '訂單清單',
    value: 'orders',
    icon: 'mdi-format-list-bulleted'
  }
]
</script>

<style scoped>
.admin-page {
  padding: 20px;
  min-height: 100vh;
}

.tab-content {
  min-height: 100vh;
}
</style>