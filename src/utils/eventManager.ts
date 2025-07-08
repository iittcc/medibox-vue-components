import type { ErrorInfo } from './errorBoundary'

/**
 * Type-safe event map for medical calculator events
 */
export interface MedicalCalculatorEventMap {
  'network:online': void
  'network:offline': void
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
  private listeners = new Map<keyof MedicalCalculatorEventMap, Set<(data: any) => void>>()
  private cleanupFunctions = new Map<(data: any) => void, () => void>()
  private componentCleanupFunctions = new Map<string, Set<() => void>>()
  private windowListeners = new Map<string, (e: Event) => void>()
  
  /**
   * Subscribe to an event with type safety
   * @returns Cleanup function that removes the event listener
   */
  subscribe<K extends keyof MedicalCalculatorEventMap>(
    event: K,
    callback: (data: MedicalCalculatorEventMap[K]) => void,
    componentId?: string
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const listeners = this.listeners.get(event)!
    listeners.add(callback)
    // Map event names to window event names
    const windowEventName = this.getWindowEventName(event)
    
    // Create or reuse window event handler
    if (!this.windowListeners.has(windowEventName)) {
      const handler = (e: Event) => {
        // Find the internal event name from the window event name
        const internalEvent = Object.entries(this.getEventMap()).find(
          ([, windowName]) => windowName === windowEventName
        )?.[0] as keyof MedicalCalculatorEventMap | undefined
        
        if (internalEvent) {
          const eventListeners = this.listeners.get(internalEvent)
          if (eventListeners) {
            eventListeners.forEach(listener => {
              if (internalEvent === 'network:online' || internalEvent === 'network:offline') {
                listener(undefined as any)
              } else if (e instanceof CustomEvent) {
                listener(e.detail)
              }
            })
          }
        }
      }
      
      this.windowListeners.set(windowEventName, handler)
      window.addEventListener(windowEventName, handler)
    }

    // Store cleanup function
    const cleanup = () => {
      listeners.delete(callback)
      this.cleanupFunctions.delete(callback)
      
      // Remove window listener only if no more listeners for this event
      if (listeners.size === 0) {
        const windowHandler = this.windowListeners.get(windowEventName)
        if (windowHandler) {
          window.removeEventListener(windowEventName, windowHandler)
          this.windowListeners.delete(windowEventName)
        }
      }
    }

    this.cleanupFunctions.set(callback, cleanup)

    // Track component-specific cleanup if componentId provided
    if (componentId) {
      if (!this.componentCleanupFunctions.has(componentId)) {
        this.componentCleanupFunctions.set(componentId, new Set())
      }
      this.componentCleanupFunctions.get(componentId)!.add(cleanup)
    }

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
   * Clean up event listeners for a specific component
   */
  cleanupComponent(componentId: string): void {
    const componentCleanups = this.componentCleanupFunctions.get(componentId)
    if (componentCleanups) {
      componentCleanups.forEach(cleanup => cleanup())
      this.componentCleanupFunctions.delete(componentId)
    }
  }

  /**
   * Clean up all event listeners (use with caution in shared singleton)
   */
  cleanup(): void {
    // Remove all window event listeners
    this.windowListeners.forEach((handler, eventName) => {
      window.removeEventListener(eventName, handler)
    })
    
    this.listeners.clear()
    this.cleanupFunctions.clear()
    this.componentCleanupFunctions.clear()
    this.windowListeners.clear()
  }

  /**
   * Get the event mapping object
   */
  private getEventMap(): Record<keyof MedicalCalculatorEventMap, string> {
    return {
      'network:online': 'online',
      'network:offline': 'offline',
      'error:medical-calculator': 'medicalCalculatorError',
      'error:recovery': 'medicalCalculatorRecovery',
      'notification:show-toast': 'showErrorToast'
    }
  }

  /**
   * Map internal event names to window event names for backward compatibility
   */
  private getWindowEventName(event: keyof MedicalCalculatorEventMap): string {
    return this.getEventMap()[event]
  }
}

// Global singleton instance
let globalEventManager: TypeSafeEventManager | null = null

/**
 * Get or create the global event manager singleton
 */
function getGlobalEventManager(): TypeSafeEventManager {
  if (!globalEventManager) {
    globalEventManager = new TypeSafeEventManager()
  }
  return globalEventManager
}

/**
 * Get the shared event manager instance for Vue components
 * Uses singleton pattern to prevent duplicate event listeners
 */
export function useEventManager(componentId?: string) {
  const manager = getGlobalEventManager()

  // Create component-specific subscribe function
  const subscribe = componentId 
    ? <K extends keyof MedicalCalculatorEventMap>(
        event: K,
        callback: (data: MedicalCalculatorEventMap[K]) => void
      ) => manager.subscribe(event, callback, componentId)
    : manager.subscribe.bind(manager)

  // Create component-specific cleanup function
  const cleanup = componentId
    ? () => manager.cleanupComponent(componentId)
    : manager.cleanup.bind(manager)

  // Return manager with component-aware methods
  return {
    subscribe,
    emit: manager.emit.bind(manager),
    cleanup
  }
}