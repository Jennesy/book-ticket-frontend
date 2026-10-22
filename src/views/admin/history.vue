<template>
  <div>
    <div v-if="loading && !archivedConcerts.length" class="text-gray-500 py-8 text-center">
      載入場次中...
    </div>

    <div v-else-if="!archivedConcerts.length" class="text-gray-500 py-8 text-center">
      目前沒有歷史場次
    </div>

    <template v-else-if="selectedTag">
      <Select
        :model-value="selectedTag"
        :items="concertOptions"
        label="場次"
        density="comfortable"
        hide-details
        class="mb-4 max-w-sm"
        @update:model-value="onSelectTag"
      />

      <Tabs
        v-model="activeTab"
        :tabs="tabItems"
        itemClass="pa-0"
      >
        <template #tab-seatMap>
          <div class="tab-content">
            <SeatMap mode="view" :tag="selectedTag" />
          </div>
        </template>

        <template #tab-orders>
          <div class="tab-content">
            <OrderList :tag="selectedTag" readonly />
          </div>
        </template>
      </Tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Select from '@/components/common/select.vue'
import Tabs from '@/components/common/tabs.vue'
import SeatMap from '@/components/seat-map/index.vue'
import OrderList from '@/components/admin/order-list.vue'
import { useConcerts } from '@/composables/useConcerts'
import { formatTag } from '@/utils/concert-tag'

const route = useRoute()
const router = useRouter()
const { concerts, activeTag, loading } = useConcerts()

const activeTab = ref('seatMap')

const tabItems = [
  { title: '座位表', value: 'seatMap', icon: 'mdi-seat-outline' },
  { title: '訂單清單', value: 'orders', icon: 'mdi-format-list-bulleted' }
]

// Newest first, as returned by the API
const archivedConcerts = computed(() =>
  concerts.value.filter(concert => concert.tag !== activeTag.value)
)

const concertOptions = computed(() =>
  archivedConcerts.value.map(concert => ({
    title: concert.name ? `${concert.name}（${formatTag(concert.tag)}）` : formatTag(concert.tag),
    value: concert.tag
  }))
)

const queryTag = computed(() => typeof route.query.tag === 'string' ? route.query.tag : undefined)

// The URL is the source of truth; fall back to the newest archived concert
const selectedTag = computed(() => {
  if (queryTag.value && archivedConcerts.value.some(concert => concert.tag === queryTag.value)) {
    return queryTag.value
  }
  return archivedConcerts.value[0]?.tag
})

// Keep the URL in sync when it has no tag or one that is not archived
watch(selectedTag, (tag) => {
  if (tag && tag !== queryTag.value) {
    router.replace({ query: { ...route.query, tag } })
  }
}, { immediate: true })

const onSelectTag = (tag: string) => {
  router.push({ query: { ...route.query, tag } })
}
</script>

<style scoped>
.tab-content {
  min-height: 100vh;
}
</style>
