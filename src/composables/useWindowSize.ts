import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useWindowSize() {
  const width = ref(0)
  const height = ref(0)

  const updateSize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  // Computed breakpoints for convenience
  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)
  const isLarge = computed(() => width.value >= 1280)
  const isXLarge = computed(() => width.value >= 1536)

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    isXLarge
  }
}