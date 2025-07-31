<template>
  <v-chip-group
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :color="color"
    :disabled="disabled"
    :filter="filter"
    :mandatory="mandatory"
    :max="max"
    :multiple="multiple"
    :selected-class="selectedClass"
    :variant="variant"
    :class="groupClass"
  >
    <slot />
  </v-chip-group>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: any
  color?: string
  disabled?: boolean
  filter?: boolean
  mandatory?: boolean | 'force'
  max?: number
  multiple?: boolean
  selectedClass?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  groupClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  filter: false,
  mandatory: false,
  multiple: false,
  variant: 'flat',
  groupClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>