<template>
  <div class="data-table">
    <v-data-table
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :headers="headers"
      :items="items"
      :loading="loading"
      :loading-text="loadingText"
      :no-data-text="noDataText"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      :search="search"
      :sort-by="sortBy"
      :group-by="groupBy"
      :expand-on-click="expandOnClick"
      :show-expand="showExpand"
      :show-select="showSelect"
      :return-object="returnObject"
      :density="density"
      :height="height"
      :fixed-header="fixedHeader"
      :fixed-footer="fixedFooter"
      :hover="hover"
      :class="tableClass"
    >
      <!-- Dynamic slots -->
      <template
        v-for="(_, slot) in $slots"
        #[slot]="scope"
        :key="slot"
      >
        <slot :name="slot" v-bind="scope" />
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
interface Header {
  key: string
  title: string
  sortable?: boolean
  width?: string | number
  align?: 'start' | 'end' | 'center'
}

interface Props {
  modelValue?: any[]
  headers: Header[]
  items: any[]
  loading?: boolean
  loadingText?: string
  noDataText?: string
  itemsPerPage?: number
  itemsPerPageOptions?: Array<{ value: number; title: string }>
  search?: string
  sortBy?: any[]
  groupBy?: any[]
  expandOnClick?: boolean
  showExpand?: boolean
  showSelect?: boolean
  returnObject?: boolean
  density?: 'default' | 'comfortable' | 'compact'
  height?: string | number
  fixedHeader?: boolean
  fixedFooter?: boolean
  hover?: boolean
  tableClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: '載入中...',
  noDataText: '暫無資料',
  itemsPerPage: 10,
  itemsPerPageOptions: () => [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: '全部' }
  ],
  expandOnClick: false,
  showExpand: false,
  showSelect: false,
  returnObject: false,
  density: 'default',
  fixedHeader: false,
  fixedFooter: false,
  hover: true,
  tableClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()
</script>