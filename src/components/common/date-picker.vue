<template>
  <!-- <div class='text-sm text-gray-500'> {{ label }} </div> -->
  <v-menu
    v-model="isMenuVisible"
    :closeOnContentClick="false"
  >
    <template #activator="{ props }">
      <v-text-field 
        v-bind='props' 
        v-model='date' 
        :label='label' 
        :rules='rules'
        appendInnerIcon="mdi-calendar" 
        variant="solo-filled" 
        hide-details="auto"
        flat 
        @click='onClick'
      >
      </v-text-field>
    </template>
    <v-date-picker 
      v-model='date' 
      hideHeader
      @update:model-value='onUpdate' 
    />
  </v-menu>
</template>

<script setup>
import { string, array, object } from 'vue-types';
import { ref } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps({
  label: string.isRequired,
  rules: array().isRequired,
});
const date = ref(new Date().toLocaleDateString());
const isMenuVisible = ref(false);

const onClick = () => {
  isMenuVisible.value = true;
};

const onUpdate = (value) => {
  console.log(value);
  date.value = value.toLocaleDateString();
  isMenuVisible.value = false;
  emit('update', value);
};
</script>