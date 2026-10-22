<template>
  <v-menu
    v-model="isMenuVisible"
    :closeOnContentClick="false"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-bind='activatorProps'
        :model-value='displayValue'
        :label='label'
        :rules='rules'
        :error-messages='errorMessages'
        appendInnerIcon="mdi-calendar"
        variant="solo-filled"
        hide-details="auto"
        flat
        readonly
        @click='onClick'
      >
      </v-text-field>
    </template>
    <v-date-picker
      :model-value='modelValue'
      :min='min'
      hideHeader
      @update:model-value='onUpdate'
    />
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: Date | null
  label: string
  rules?: Array<(value: string) => true | string>
  min?: Date
  errorMessages?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  rules: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: Date]
}>()

const isMenuVisible = ref(false)

const displayValue = computed(() => props.modelValue?.toLocaleDateString() ?? '')

const onClick = () => {
  isMenuVisible.value = true
}

const onUpdate = (value: Date) => {
  isMenuVisible.value = false
  emit('update:modelValue', value)
}
</script>
