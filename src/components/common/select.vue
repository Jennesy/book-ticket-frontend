<template>
  <v-select
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :label="label"
    :placeholder="placeholder"
    :variant="variant"
    :density="density"
    :clearable="clearable"
    :disabled="disabled"
    :readonly="readonly"
    :multiple="multiple"
    :chips="chips"
    :hide-details="hideDetails"
    :class="class"
  >
    <template v-if="$slots.selection" #selection="{ item, index }">
      <slot name="selection" :item="item" :index="index" />
    </template>
    
    <template v-if="$slots.item" #item="{ item, props }">
      <slot name="item" :item="item" :props="props" />
    </template>
    
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </v-select>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: any
  items: any[]
  itemTitle?: string | ((item: any) => string)
  itemValue?: string | ((item: any) => any)
  label?: string
  placeholder?: string
  variant?: 'filled' | 'outlined' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'
  density?: 'default' | 'comfortable' | 'compact'
  clearable?: boolean
  disabled?: boolean
  readonly?: boolean
  multiple?: boolean
  chips?: boolean
  hideDetails?: boolean | 'auto'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemTitle: 'title',
  itemValue: 'value',
  variant: 'outlined',
  density: 'default',
  clearable: false,
  disabled: false,
  readonly: false,
  multiple: false,
  chips: false,
  hideDetails: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>