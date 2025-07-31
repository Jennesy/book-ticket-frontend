<template>
  <v-app-bar
    :color="color"
    :dark="dark"
    :density="density"
    :height="height"
    :flat="flat"
    :floating="floating"
    :prominent="prominent"
    :collapse="collapse"
    :fade-img-on-scroll="fadeImgOnScroll"
    :elevate-on-scroll="elevateOnScroll"
    :scroll-threshold="scrollThreshold"
    :scroll-behavior="scrollBehavior"
    :location="location"
    :class="appBarClass"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    
    <template v-if="$slots.default">
      <slot />
    </template>
    
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
    
    <template v-if="$slots.title" #title>
      <slot name="title" />
    </template>
    <template v-else-if="title" #title>
      <v-app-bar-title>
        {{ title }}
      </v-app-bar-title>
    </template>
    
    <template v-if="$slots.extension" #extension>
      <slot name="extension" />
    </template>
    
    <template v-if="$slots.image" #image>
      <slot name="image" />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
interface Props {
  color?: string
  dark?: boolean
  density?: 'default' | 'prominent' | 'comfortable' | 'compact'
  height?: string | number
  flat?: boolean
  floating?: boolean
  prominent?: boolean
  collapse?: boolean
  fadeImgOnScroll?: boolean
  elevateOnScroll?: boolean
  scrollThreshold?: number
  scrollBehavior?: string
  location?: 'top' | 'bottom'
  title?: string
  appBarClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  dark: false,
  density: 'default',
  flat: false,
  floating: false,
  prominent: false,
  collapse: false,
  fadeImgOnScroll: false,
  elevateOnScroll: false,
  scrollThreshold: 300,
  location: 'top',
  appBarClass: ''
})
</script>