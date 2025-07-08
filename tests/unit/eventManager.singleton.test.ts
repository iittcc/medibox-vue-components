import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEventManager } from '@/utils/eventManager'

describe('EventManager Singleton', () => {
  beforeEach(() => {
    // Clear any existing listeners
    const manager = useEventManager()
    manager.cleanup()
  })

  it('should use the same underlying instance for different components', () => {
    const manager1 = useEventManager('component1')
    const manager2 = useEventManager('component2')
    
    // Both managers should share the same underlying event system
    let received1 = false
    let received2 = false
    
    manager1.subscribe('notification:show-toast', () => {
      received1 = true
    })
    
    manager2.subscribe('notification:show-toast', () => {
      received2 = true
    })
    
    // Emit from manager1 - both should receive it
    manager1.emit('notification:show-toast', {
      severity: 'info',
      summary: 'Test',
      detail: 'Singleton test'
    })
    
    // Trigger the window event manually since we're in test environment
    window.dispatchEvent(new CustomEvent('showErrorToast', {
      detail: {
        severity: 'info',
        summary: 'Test',
        detail: 'Singleton test'
      }
    }))
    
    expect(received1).toBe(true)
    expect(received2).toBe(true)
  })

  it('should allow component-specific cleanup without affecting other components', () => {
    const manager1 = useEventManager('component1')
    const manager2 = useEventManager('component2')
    
    let received1 = false
    let received2 = false
    
    manager1.subscribe('notification:show-toast', () => {
      received1 = true
    })
    
    manager2.subscribe('notification:show-toast', () => {
      received2 = true
    })
    
    // Cleanup only component1
    manager1.cleanup()
    
    // Emit event
    manager2.emit('notification:show-toast', {
      severity: 'info',
      summary: 'Test',
      detail: 'After cleanup test'
    })
    
    // Trigger the window event manually
    window.dispatchEvent(new CustomEvent('showErrorToast', {
      detail: {
        severity: 'info',
        summary: 'Test',
        detail: 'After cleanup test'
      }
    }))
    
    // Only manager2 should receive the event
    expect(received1).toBe(false)
    expect(received2).toBe(true)
  })

  it('should prevent duplicate window event listeners', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    
    const manager1 = useEventManager('component1')
    const manager2 = useEventManager('component2')
    
    // Subscribe to the same event from both managers
    manager1.subscribe('notification:show-toast', () => {})
    manager2.subscribe('notification:show-toast', () => {})
    
    // Should only have one window event listener for 'showErrorToast'
    const showErrorToastCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'showErrorToast'
    )
    
    expect(showErrorToastCalls.length).toBe(1) // Only one window listener should be added
    
    addEventListenerSpy.mockRestore()
  })
})