<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :width="width"
  >
    <v-card>
      <v-card-title>
        <slot name="title" />
      </v-card-title>
      <v-icon :class='$style.icon' size='16' color='black' @click.stop='onClose'>mdi-close</v-icon>
      <v-card-text>
        <slot />
      </v-card-text>
      <template v-if='$slots["footer-action"]'>
        <v-card-actions>
          <slot name='footer-action'></slot>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { VDialog } from 'vuetify/components'

defineProps<{
  modelValue: boolean
  width?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const onClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style lang="scss" module>
.icon {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>