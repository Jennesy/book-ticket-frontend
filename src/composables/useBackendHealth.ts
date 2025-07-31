import { ref, reactive } from 'vue'

interface HealthState {
  isConnected: boolean
  isWakingUp: boolean
  attempts: number
  error: string | null
}

const healthState = reactive<HealthState>({
  isConnected: false,
  isWakingUp: false,
  attempts: 0,
  error: null
})

const MAX_ATTEMPTS = 40
const RETRY_DELAY = 3000 // 3 seconds (40 attempts × 3s = 120 seconds total)

export function useBackendHealth() {
  const checkHealth = async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/seats`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        healthState.isConnected = true
        healthState.isWakingUp = false
        healthState.error = null
        console.log('✅ Backend is healthy')
        return true
      }
      
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      console.log(`❌ Backend health check failed:`, error)
      healthState.isConnected = false
      healthState.error = error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  const wakeUpBackend = async (): Promise<boolean> => {
    if (healthState.isConnected) return true
    
    healthState.isWakingUp = true
    healthState.attempts = 0
    healthState.error = null

    console.log('🚀 Starting backend wake-up process...')

    while (healthState.attempts < MAX_ATTEMPTS && !healthState.isConnected) {
      healthState.attempts++
      console.log(`⏳ Wake-up attempt ${healthState.attempts}/${MAX_ATTEMPTS}`)

      const isHealthy = await checkHealth()
      
      if (isHealthy) {
        healthState.isWakingUp = false
        console.log('🎉 Backend successfully awakened!')
        return true
      }

      if (healthState.attempts < MAX_ATTEMPTS) {
        console.log(`⏰ Waiting ${RETRY_DELAY}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      }
    }

    healthState.isWakingUp = false
    healthState.error = 'Server failed to respond after 2 minutes. Please try again later.'
    console.log('💀 Failed to wake up backend after 120 seconds')
    return false
  }

  const reset = () => {
    healthState.isConnected = false
    healthState.isWakingUp = false
    healthState.attempts = 0
    healthState.error = null
  }

  return {
    healthState,
    checkHealth,
    wakeUpBackend,
    reset
  }
}