import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { useEventManager } from '@/utils/eventManager'

// Singleton state
let networkStatusInstance: {
  isOnline: ReturnType<typeof ref>
  referenceCount: number
  cleanupFunction?: () => void
} | null = null

/**
 * Network status composable for monitoring online/offline state
 * Provides reactive network status with automatic event handling
 * Uses singleton pattern to prevent duplicate event listeners
 */
export function useNetworkStatus() {
  // Create singleton instance if it doesn't exist
  if (!networkStatusInstance) {
    const isOnline = ref(navigator.onLine)
    const eventManager = useEventManager('network-status')

    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine
    }

    // Subscribe to network events once
    const onlineCleanup = eventManager.subscribe('network:online', updateOnlineStatus)
    const offlineCleanup = eventManager.subscribe('network:offline', updateOnlineStatus)

    networkStatusInstance = {
      isOnline,
      referenceCount: 0,
      cleanupFunction: () => {
        onlineCleanup()
        offlineCleanup()
      }
    }
  }

  // Increment reference count
  networkStatusInstance.referenceCount++

  onMounted(() => {
    // Instance is already set up, no additional setup needed
  })

  onUnmounted(() => {
    if (networkStatusInstance) {
      networkStatusInstance.referenceCount--
      
      // Cleanup only when no more references
      if (networkStatusInstance.referenceCount <= 0) {
        if (networkStatusInstance.cleanupFunction) {
          networkStatusInstance.cleanupFunction()
        }
        networkStatusInstance = null
      }
    }
  })

  return {
    isOnline: readonly(networkStatusInstance.isOnline)
  }
}