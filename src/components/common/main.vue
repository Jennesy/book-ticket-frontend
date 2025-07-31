<template>
  <v-main
    :class="mainClass"
    :style="mainStyle"
  >
    <slot />
  </v-main>
</template>

<script setup lang="ts">
interface Props {
  mainClass?: string
  mainStyle?: string | Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  mainClass: '',
  mainStyle: ''
})
</script>