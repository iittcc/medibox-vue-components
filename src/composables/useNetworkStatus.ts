import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { useEventManager } from '@/utils/eventManager'

/**
 * Network status composable for monitoring online/offline state
 * Provides reactive network status with automatic event handling
 */
export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const eventManager = useEventManager()

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    // Subscribe to network status changes
    eventManager.subscribe('network:online', updateOnlineStatus)
    eventManager.subscribe('network:offline', updateOnlineStatus)
  })

  onUnmounted(() => {
    // Cleanup event listeners
    eventManager.cleanup()
  })

  return {
    isOnline: readonly(isOnline)
  }
}