import type { ErrorInfo } from './errorBoundary'

/**
 * Type-safe event map for medical calculator events
 */
export interface MedicalCalculatorEventMap {
  'network:online': undefined
  'network:offline': undefined
  'error:medical-calculator': ErrorInfo
  'error:recovery': ErrorInfo & { action?: string }
  'notification:show-toast': {
    severity: 'success' | 'info' | 'warn' | 'error'
    summary: string
    detail?: string
    life?: number
    closable?: boolean
  }
}

/**
 * Type-safe event manager for medical calculator events
 * Provides automatic cleanup and proper TypeScript support
 */
export class TypeSafeEventManager {
  private listeners = new Map<keyof MedicalCalculatorEventMap, Set<Function>>()
  private cleanupFunctions = new Map<Function, () => void>()

  /**
   * Subscribe to an event with type safety
   * @returns Cleanup function that removes the event listener
   */
  subscribe<K extends keyof MedicalCalculatorEventMap>(
    event: K,
    callback: (data: MedicalCalculatorEventMap[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const listeners = this.listeners.get(event)!
    listeners.add(callback)

    // Map event names to window event names
    const windowEventName = this.getWindowEventName(event)
    
    // Create typed event handler
    const handler = (e: Event) => {
    const handler = (e: Event) => {
      if (event === 'network:online' || event === 'network:offline') {
        // These events have no data, pass undefined
        callback(undefined as MedicalCalculatorEventMap[K])
      } else if (e instanceof CustomEvent) {
        callback(e.detail as MedicalCalculatorEventMap[K])
      }
    }

    // Add event listener
    window.addEventListener(windowEventName, handler)

    // Store cleanup function
    const cleanup = () => {
      window.removeEventListener(windowEventName, handler)
      listeners.delete(callback)
      this.cleanupFunctions.delete(callback)
    }

    this.cleanupFunctions.set(callback, cleanup)

    return cleanup
  }

  /**
   * Emit an event with type safety
   */
  emit<K extends keyof MedicalCalculatorEventMap>(
    event: K,
    data: MedicalCalculatorEventMap[K]
  ): void {
    const windowEventName = this.getWindowEventName(event)
    
    if (event === 'network:online' || event === 'network:offline') {
      window.dispatchEvent(new Event(windowEventName))
    } else {
      window.dispatchEvent(new CustomEvent(windowEventName, { detail: data }))
    }
  }

  /**
   * Clean up all event listeners
   */
  cleanup(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup())
    this.listeners.clear()
    this.cleanupFunctions.clear()
  }

  /**
   * Map internal event names to window event names for backward compatibility
   */
  private getWindowEventName(event: keyof MedicalCalculatorEventMap): string {
    const eventMap: Record<keyof MedicalCalculatorEventMap, string> = {
      'network:online': 'online',
      'network:offline': 'offline',
      'error:medical-calculator': 'medicalCalculatorError',
      'error:recovery': 'medicalCalculatorRecovery',
      'notification:show-toast': 'showErrorToast'
    }
    return eventMap[event]
  }
}

/**
 * Create a new event manager instance with Vue lifecycle integration
 */
export function useEventManager() {
  const manager = new TypeSafeEventManager()

  // Return manager with cleanup method for Vue components
  return {
    subscribe: manager.subscribe.bind(manager),
    emit: manager.emit.bind(manager),
    cleanup: manager.cleanup.bind(manager)
  }
}