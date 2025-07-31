<template>
  <v-btn
    :color="color"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :icon="icon"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    :block="block"
    :rounded="rounded"
    :density="density"
    :class="buttonClass"
    @click="$emit('click', $event)"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    
    <slot />
    
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </v-btn>
</template>

<script setup lang="ts">
interface Props {
  color?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  disabled?: boolean
  loading?: boolean
  icon?: string
  prependIcon?: string
  appendIcon?: string
  block?: boolean
  rounded?: boolean | string
  density?: 'default' | 'comfortable' | 'compact'
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'flat',
  size: 'default',
  disabled: false,
  loading: false,
  block: false,
  rounded: false,
  density: 'default',
  buttonClass: ''
})

const emit = defineEmits<{
  'click': [event: Event]
}>()
</script>
