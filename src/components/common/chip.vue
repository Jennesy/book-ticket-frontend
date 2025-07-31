<template>
  <v-chip
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :color="color"
    :variant="variant"
    :size="size"
    :label="label"
    :closable="closable"
    :disabled="disabled"
    :link="link"
    :pill="pill"
    :ripple="ripple"
    :text="text"
    :value="value"
    :class="chipClass"
    @click="$emit('click', $event)"
    @click:close="$emit('click:close', $event)"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-else-if="text">
      {{ text }}
    </template>
    
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
    
    <template v-if="$slots.close" #close>
      <slot name="close" />
    </template>
  </v-chip>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
  color?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  label?: boolean
  closable?: boolean
  disabled?: boolean
  link?: boolean
  pill?: boolean
  ripple?: boolean
  text?: string
  value?: any
  chipClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'flat',
  size: 'default',
  label: false,
  closable: false,
  disabled: false,
  link: false,
  pill: false,
  ripple: true,
  chipClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'click': [event: Event]
  'click:close': [event: Event]
}>()
</script>