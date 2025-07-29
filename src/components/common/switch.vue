<template>
  <v-switch
    v-model="enabled"
    label="開關範例"
  />
</template>

<script setup>
import { ref } from 'vue'
const enabled = ref(false)
</script>
