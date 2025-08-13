<template>
  <div class='flex gap-1'><span class='text-gray-400 decoration-line-through'>NT${{ originalPrice }}</span>NT${{ discountPrice }} </div>
</template>

<script lang="ts">
export default {
  props: {
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
  },
}
</script>