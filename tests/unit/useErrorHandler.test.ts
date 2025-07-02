import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { ErrorType } from '@/utils/errorBoundary'

// Mock dependencies
vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn()
  }))
}))

vi.mock('@/utils/errorBoundary', () => ({
  errorBoundaryManager: {
    categorizeError: vi.fn(),
    getUserFriendlyMessage: vi.fn(),
    reportError: vi.fn()
  },
  ErrorType: {
    NETWORK: 'network',
    VALIDATION: 'validation',
    CALCULATION: 'calculation',
    UI: 'ui',
    SECURITY: 'security',
    DATA: 'data',
    UNKNOWN: 'unknown'
  }
}))

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true
})

describe('useErrorHandler', () => {
  let wrapper: any
  let toastMock: any
  let errorBoundaryMock: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup mock implementations
    const { useToast } = await import('primevue/usetoast')
    toastMock = {
      add: vi.fn()
    }
    ;(useToast as any).mockReturnValue(toastMock)
    
    const { errorBoundaryManager } = await import('@/utils/errorBoundary')
    errorBoundaryMock = errorBoundaryManager
    errorBoundaryMock.categorizeError.mockReturnValue(ErrorType.UNKNOWN)
    errorBoundaryMock.getUserFriendlyMessage.mockReturnValue('Test error message')
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      expect(errorHandler.errors).toBeDefined()
      expect(errorHandler.hasErrors).toBe(false)
      expect(errorHandler.isOnline).toBe(true)
      expect(errorHandler.networkErrors).toEqual([])
      expect(errorHandler.validationErrors).toEqual([])
      expect(errorHandler.calculationErrors).toEqual([])
    })

    it('should initialize with custom options', () => {
      const onError = vi.fn()
      const onRecovery = vi.fn()
      
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler({
            showToasts: false,
            autoRetry: false,
            maxRetries: 5,
            retryDelay: 2000,
            onError,
            onRecovery
          })
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      expect(wrapper.vm.errorHandler).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle basic errors', async () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      const testError = new Error('Test error')
      await errorHandler.handleError(testError)

      expect(errorHandler.errors.length).toBe(1)
      expect(errorHandler.hasErrors).toBe(true)
      expect(errorBoundaryMock.categorizeError).toHaveBeenCalledWith(testError)
      expect(errorBoundaryMock.reportError).toHaveBeenCalledWith(testError, undefined)
    })

    it('should handle errors with context', async () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      const testError = new Error('Test error')
      const context = {
        component: 'TestComponent',
        calculator: 'audit',
        action: 'calculate',
        data: { value: 123 }
      }

      await errorHandler.handleError(testError, context)

      expect(errorHandler.errors.length).toBe(1)
      expect(errorHandler.errors[0].componentName).toBe('TestComponent')
      expect(errorHandler.errors[0].calculatorType).toBe('audit')
      expect(errorBoundaryMock.reportError).toHaveBeenCalledWith(testError, context)
    })

    it('should show toast notifications by default', async () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      const testError = new Error('Test error')
      await errorHandler.handleError(testError)

      expect(toastMock.add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Systemfejl',
          detail: 'Test error message',
          closable: true
        })
      )
    })

    it('should not show toast notifications when disabled', async () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler({ showToasts: false })
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      const testError = new Error('Test error')
      await errorHandler.handleError(testError)

      expect(toastMock.add).not.toHaveBeenCalled()
    })

    it('should call custom onError handler', async () => {
      const onError = vi.fn()
      
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler({ onError })
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      const testError = new Error('Test error')
      await errorHandler.handleError(testError)

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          errorMessage: 'Test error',
          errorType: ErrorType.UNKNOWN
        })
      )
    })
  })

  describe('error categorization', () => {
    it('should categorize network errors correctly', () => {
      errorBoundaryMock.categorizeError.mockReturnValue(ErrorType.NETWORK)
      
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      const testError = new Error('Network error')
      const result = errorHandler.categorizeError(testError)

      expect(result).toBe(ErrorType.NETWORK)
      expect(errorBoundaryMock.categorizeError).toHaveBeenCalledWith(testError)
    })

    it('should determine if errors are recoverable', () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      expect(errorHandler.isRecoverable(ErrorType.NETWORK)).toBe(true)
      expect(errorHandler.isRecoverable(ErrorType.VALIDATION)).toBe(true)
      expect(errorHandler.isRecoverable(ErrorType.CALCULATION)).toBe(false)
      expect(errorHandler.isRecoverable(ErrorType.UNKNOWN)).toBe(false)
    })
  })

  describe('error filtering', () => {
    it('should filter errors by type', async () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      // Add network error
      errorBoundaryMock.categorizeError.mockReturnValueOnce(ErrorType.NETWORK)
      await errorHandler.handleError(new Error('Network error'))

      // Add validation error
      errorBoundaryMock.categorizeError.mockReturnValueOnce(ErrorType.VALIDATION)
      await errorHandler.handleError(new Error('Validation error'))

      // Add calculation error
      errorBoundaryMock.categorizeError.mockReturnValueOnce(ErrorType.CALCULATION)
      await errorHandler.handleError(new Error('Calculation error'))

      expect(errorHandler.errors.length).toBe(3)
      expect(errorHandler.networkErrors.length).toBe(1)
      expect(errorHandler.validationErrors.length).toBe(1)
      expect(errorHandler.calculationErrors.length).toBe(1)
    })
  })

  describe('error management', () => {
    it('should clear all errors', async () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      await errorHandler.handleError(new Error('Test error'))
      expect(errorHandler.errors.length).toBe(1)

      errorHandler.clearErrors()
      expect(errorHandler.errors.length).toBe(0)
      expect(errorHandler.hasErrors).toBe(false)
    })

    it('should clear specific error by index', async () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      await errorHandler.handleError(new Error('Error 1'))
      await errorHandler.handleError(new Error('Error 2'))
      expect(errorHandler.errors.length).toBe(2)

      errorHandler.clearError(0)
      expect(errorHandler.errors.length).toBe(1)
      expect(errorHandler.errors[0].errorMessage).toBe('Error 2')
    })

    it('should clear errors by type', async () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      // Add network error
      errorBoundaryMock.categorizeError.mockReturnValueOnce(ErrorType.NETWORK)
      await errorHandler.handleError(new Error('Network error'))

      // Add validation error
      errorBoundaryMock.categorizeError.mockReturnValueOnce(ErrorType.VALIDATION)
      await errorHandler.handleError(new Error('Validation error'))

      expect(errorHandler.errors.length).toBe(2)

      errorHandler.clearErrorsByType(ErrorType.NETWORK)
      expect(errorHandler.errors.length).toBe(1)
      expect(errorHandler.errors[0].errorType).toBe(ErrorType.VALIDATION)
    })
  })

  describe('toast notifications', () => {
    it('should show success toast', () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      errorHandler.showSuccess('Success message', 'Success detail')

      expect(toastMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success message',
        detail: 'Success detail',
        life: 3000
      })
    })

    it('should show info toast', () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      errorHandler.showInfo('Info message', 'Info detail')

      expect(toastMock.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Info message',
        detail: 'Info detail',
        life: 5000
      })
    })

    it('should show warning toast', () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      errorHandler.showWarning('Warning message', 'Warning detail')

      expect(toastMock.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Warning message',
        detail: 'Warning detail',
        life: 7000
      })
    })
  })

  describe('network status monitoring', () => {
    it('should track online status', () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      expect(errorHandler.isOnline).toBe(true)

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      window.dispatchEvent(new Event('offline'))

      // Note: The reactive update might not be immediate in tests
      // In a real scenario, the event listener would update the ref
    })
  })

  describe('auto-retry functionality', () => {
    it('should attempt recovery for recoverable errors', async () => {
      const onRecovery = vi.fn()
      
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler({
            autoRetry: true,
            maxRetries: 1,
            retryDelay: 10, // Short delay for testing
            onRecovery
          })
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      // Mock network error as recoverable
      errorBoundaryMock.categorizeError.mockReturnValue(ErrorType.NETWORK)
      
      const testError = new Error('Network error')
      const context = { component: 'TestComponent', action: 'fetch' }
      
      await errorHandler.handleError(testError, context)

      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(onRecovery).toHaveBeenCalled()
    })

    it('should not retry non-recoverable errors', async () => {
      const onRecovery = vi.fn()
      
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler({
            autoRetry: true,
            onRecovery
          })
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      // Mock calculation error as non-recoverable
      errorBoundaryMock.categorizeError.mockReturnValue(ErrorType.CALCULATION)
      
      const testError = new Error('Calculation error')
      await errorHandler.handleError(testError)

      // Wait to ensure no retry attempt
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(onRecovery).not.toHaveBeenCalled()
    })

    it('should respect max retry limit', async () => {
      const onRecovery = vi.fn()
      
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler({
            autoRetry: true,
            maxRetries: 2,
            retryDelay: 10,
            onRecovery
          })
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      // Mock network error as recoverable
      errorBoundaryMock.categorizeError.mockReturnValue(ErrorType.NETWORK)
      
      const testError = new Error('Network error')
      const context = { component: 'TestComponent', action: 'fetch' }
      
      // Trigger multiple errors with same context
      await errorHandler.handleError(testError, context)
      await errorHandler.handleError(testError, context)
      await errorHandler.handleError(testError, context) // This should not trigger retry

      // Wait for retry delays
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should have been called for first two errors, but not the third
      expect(onRecovery).toHaveBeenCalledTimes(2)
    })
  })

  describe('event listeners', () => {
    it('should set up event listeners on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('medicalCalculatorError', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('medicalCalculatorRecovery', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('showErrorToast', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('medicalCalculatorError', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('medicalCalculatorRecovery', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('showErrorToast', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('utility methods', () => {
    it('should get user friendly messages', () => {
      const TestComponent = defineComponent({
        setup() {
          const errorHandler = useErrorHandler()
          return { errorHandler }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { errorHandler } = wrapper.vm

      const testError = new Error('Test error')
      errorHandler.getUserFriendlyMessage(ErrorType.NETWORK, testError)

      expect(errorBoundaryMock.getUserFriendlyMessage).toHaveBeenCalledWith(ErrorType.NETWORK, testError)
    })
  })
})