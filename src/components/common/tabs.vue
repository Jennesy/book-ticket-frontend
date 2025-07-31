<template>
  <div>
    <v-tabs
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :color="color"
      :bg-color="bgColor"
      :grow="grow"
      :fixed-tabs="fixedTabs"
      :center-active="centerActive"
      :show-arrows="showArrows"
      :slider-color="sliderColor"
      :density="density"
      :height="height"
      :class="tabsClass"
    >
      <v-tab
        v-for="(tab, index) in tabs"
        :key="tab.value || index"
        :value="tab.value"
        :disabled="tab.disabled"
        :class="tabClass"
      >
        <template v-if="tab.icon">
          <v-icon :icon="tab.icon" class="mr-2" />
        </template>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <v-tabs-window
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :class="windowClass"
    >
      <v-tabs-window-item
        v-for="(tab, index) in tabs"
        :key="tab.value || index"
        :value="tab.value"
      >
        <div :class="itemClass">
          <slot :name="`tab-${tab.value}`" :tab="tab" :index="index">
            <component
              v-if="tab.component"
              :is="tab.component"
              v-bind="tab.props || {}"
            />
          </slot>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  title: string
  value: string | number
  icon?: string
  disabled?: boolean
  component?: any
  props?: Record<string, any>
}

interface Props {
  modelValue?: string | number
  tabs: Tab[]
  color?: string
  bgColor?: string
  sliderColor?: string
  grow?: boolean
  fixedTabs?: boolean
  centerActive?: boolean
  showArrows?: boolean
  density?: 'default' | 'comfortable' | 'compact'
  height?: string | number
  tabsClass?: string
  tabClass?: string
  windowClass?: string
  itemClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  grow: false,
  fixedTabs: false,
  centerActive: false,
  showArrows: false,
  density: 'default',
  tabsClass: '',
  tabClass: '',
  windowClass: '',
  itemClass: 'pa-4',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>()
</script>