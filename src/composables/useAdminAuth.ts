import { ref, computed } from 'vue'
import { useNotification } from '@/composables/useNotification'

const STORAGE_KEY = 'adminKey'
const LEGACY_STORAGE_KEY = 'adminAuth'

const readStoredKey = (): string | null => {
  try {
    // Old password-based auth stored the (now public) password here
    sessionStorage.removeItem(LEGACY_STORAGE_KEY)
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

const adminKey = ref<string | null>(readStoredKey())

export function useAdminAuth() {
  const { showNotification } = useNotification()

  const isAuthenticated = computed(() => !!adminKey.value)

  const setKey = (key: string | null) => {
    adminKey.value = key
    try {
      if (key) sessionStorage.setItem(STORAGE_KEY, key)
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage unavailable: key stays in memory for this page only
    }
  }

  const verifyAndLogin = async (key: string): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/verify`, {
      headers: { 'X-Admin-Key': key }
    })

    if (response.status === 204) {
      setKey(key)
      return true
    }
    if (response.status === 401) {
      return false
    }
    throw new Error(`HTTP ${response.status}`)
  }

  const logout = () => {
    setKey(null)
  }

  // Use for every request made from the admin page
  const adminFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(init.headers)
    if (adminKey.value) headers.set('X-Admin-Key', adminKey.value)

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, { ...init, headers })

    if (response.status === 401) {
      logout()
      showNotification('金鑰已失效，請重新輸入', 'error', 'long')
    } else if (response.status === 403) {
      showNotification('目前未開放訂票，金鑰可能錯誤', 'error', 'long')
    }

    return response
  }

  return {
    isAuthenticated,
    verifyAndLogin,
    logout,
    adminFetch
  }
}
