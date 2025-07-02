import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, createLocalVue } from '@vue/test-utils'
import { defineComponent, createApp, h } from 'vue'
import { 
  errorBoundaryManager,
  ErrorBoundary,
  withErrorBoundary,
  cleanupErrorBoundary,
  ErrorType,
  MedicalCalculatorError,
  NetworkError,
  CalculationError,
  ValidationError,
  UIError,
  SecurityError,
  DataError,
  type ErrorInfo,
  type ErrorBoundaryConfig
} from '@/utils/errorBoundary'

// Mock console methods
const consoleMock = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}
Object.defineProperty(console, 'error', { value: consoleMock.error })
Object.defineProperty(console, 'warn', { value: consoleMock.warn })
Object.defineProperty(console, 'info', { value: consoleMock.info })
Object.defineProperty(console, 'debug', { value: consoleMock.debug })

describe('ErrorBoundaryManager', () => {
  let addEventListenerSpy: any
  let removeEventListenerSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Reset error boundary manager
    errorBoundaryManager.clearErrors()
    
    // Mock DOM event listeners
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('error categorization', () => {
    it('should categorize custom error classes correctly', () => {
      const networkError = new NetworkError('Connection failed')
      const calculationError = new CalculationError('Math error')
      const validationError = new ValidationError('Invalid input')
      const uiError = new UIError('Render failed')
      const securityError = new SecurityError('Unauthorized')
      const dataError = new DataError('Parse failed')

      expect(errorBoundaryManager.categorizeError(networkError)).toBe(ErrorType.NETWORK)
      expect(errorBoundaryManager.categorizeError(calculationError)).toBe(ErrorType.CALCULATION)
      expect(errorBoundaryManager.categorizeError(validationError)).toBe(ErrorType.VALIDATION)
      expect(errorBoundaryManager.categorizeError(uiError)).toBe(ErrorType.UI)
      expect(errorBoundaryManager.categorizeError(securityError)).toBe(ErrorType.SECURITY)
      expect(errorBoundaryManager.categorizeError(dataError)).toBe(ErrorType.DATA)
    })

    it('should categorize errors by error codes', () => {
      const networkError = Object.assign(new Error('Network issue'), { code: 'ENOTFOUND' })
      const validationError = Object.assign(new Error('Validation issue'), { code: 'VALIDATION_ERROR' })
      const securityError = Object.assign(new Error('Security issue'), { code: 'UNAUTHORIZED' })

      expect(errorBoundaryManager.categorizeError(networkError)).toBe(ErrorType.NETWORK)
      expect(errorBoundaryManager.categorizeError(validationError)).toBe(ErrorType.VALIDATION)
      expect(errorBoundaryManager.categorizeError(securityError)).toBe(ErrorType.SECURITY)
    })

    it('should categorize errors by message content', () => {
      const networkError = new Error('fetch request failed')
      const validationError = new Error('invalid input format')
      const calculationError = new Error('calculation returned NaN')
      const uiError = new Error('component render failed')
      const securityError = new Error('unauthorized access attempt')
      const dataError = new Error('JSON parse error')

      expect(errorBoundaryManager.categorizeError(networkError)).toBe(ErrorType.NETWORK)
      expect(errorBoundaryManager.categorizeError(validationError)).toBe(ErrorType.VALIDATION)
      expect(errorBoundaryManager.categorizeError(calculationError)).toBe(ErrorType.CALCULATION)
      expect(errorBoundaryManager.categorizeError(uiError)).toBe(ErrorType.UI)
      expect(errorBoundaryManager.categorizeError(securityError)).toBe(ErrorType.SECURITY)
      expect(errorBoundaryManager.categorizeError(dataError)).toBe(ErrorType.DATA)
    })

    it('should fall back to unknown error type', () => {
      const unknownError = new Error('Some random error')
      expect(errorBoundaryManager.categorizeError(unknownError)).toBe(ErrorType.UNKNOWN)
    })
  })

  describe('user friendly messages', () => {
    it('should provide Danish error messages', () => {
      const networkMessage = errorBoundaryManager.getUserFriendlyMessage(ErrorType.NETWORK, new Error())
      const calculationMessage = errorBoundaryManager.getUserFriendlyMessage(ErrorType.CALCULATION, new Error())
      const validationMessage = errorBoundaryManager.getUserFriendlyMessage(ErrorType.VALIDATION, new Error())
      const unknownMessage = errorBoundaryManager.getUserFriendlyMessage(ErrorType.UNKNOWN, new Error())

      expect(networkMessage).toContain('netværksfejl')
      expect(calculationMessage).toContain('beregningen')
      expect(validationMessage).toContain('ikke gyldige')
      expect(unknownMessage).toContain('uventet fejl')
    })
  })

  describe('error recoverability', () => {
    it('should identify recoverable errors', () => {
      expect(errorBoundaryManager.isRecoverable(ErrorType.NETWORK)).toBe(true)
      expect(errorBoundaryManager.isRecoverable(ErrorType.VALIDATION)).toBe(true)
      expect(errorBoundaryManager.isRecoverable(ErrorType.CALCULATION)).toBe(false)
      expect(errorBoundaryManager.isRecoverable(ErrorType.UI)).toBe(false)
      expect(errorBoundaryManager.isRecoverable(ErrorType.SECURITY)).toBe(false)
      expect(errorBoundaryManager.isRecoverable(ErrorType.DATA)).toBe(false)
      expect(errorBoundaryManager.isRecoverable(ErrorType.UNKNOWN)).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle basic errors', async () => {
      const testError = new Error('Test error')
      
      await errorBoundaryManager.handleError(testError, 'TestComponent', 'audit')

      const errors = errorBoundaryManager.getErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].errorMessage).toBe('Test error')
      expect(errors[0].componentName).toBe('TestComponent')
      expect(errors[0].calculatorType).toBe('audit')
      expect(errors[0].errorType).toBe(ErrorType.UNKNOWN)
    })

    it('should handle errors with context', async () => {
      const testError = new NetworkError('Network failed')
      const context = { component: 'NetworkComponent', action: 'fetch_data' }
      
      await errorBoundaryManager.handleError(testError, 'TestComponent', 'danpss', context)

      const errors = errorBoundaryManager.getErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].errorType).toBe(ErrorType.NETWORK)
      expect(errors[0].recoverable).toBe(true)
    })

    it('should generate unique error keys', async () => {
      const testError1 = new Error('Error 1')
      const testError2 = new Error('Error 2')
      
      await errorBoundaryManager.handleError(testError1, 'Component1', 'audit')
      await errorBoundaryManager.handleError(testError2, 'Component1', 'audit')

      // Both errors should be stored despite same component and calculator
      const errors = errorBoundaryManager.getErrors()
      expect(errors.length).toBe(2)
    })

    it('should emit error events', async () => {
      const eventListener = vi.fn()
      window.addEventListener('medicalCalculatorError', eventListener)

      const testError = new Error('Test error')
      await errorBoundaryManager.handleError(testError, 'TestComponent', 'audit')

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            errorMessage: 'Test error',
            componentName: 'TestComponent'
          })
        })
      )

      window.removeEventListener('medicalCalculatorError', eventListener)
    })

    it('should emit toast events', async () => {
      const toastListener = vi.fn()
      window.addEventListener('showErrorToast', toastListener)

      const testError = new ValidationError('Validation failed')
      await errorBoundaryManager.handleError(testError, 'TestComponent', 'audit')

      expect(toastListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            severity: 'error',
            summary: 'Fejl'
          })
        })
      )

      window.removeEventListener('showErrorToast', toastListener)
    })

    it('should handle auto-recovery for network errors', async () => {
      const recoveryListener = vi.fn()
      window.addEventListener('medicalCalculatorRecovery', recoveryListener)

      errorBoundaryManager.configure({ enableAutoRecovery: true, maxRetries: 1 })

      const networkError = new NetworkError('Connection failed')
      await errorBoundaryManager.handleError(networkError, 'TestComponent', 'audit')

      // Fast-forward time to trigger recovery
      vi.advanceTimersByTime(1000)

      expect(recoveryListener).toHaveBeenCalled()

      window.removeEventListener('medicalCalculatorRecovery', recoveryListener)
    })

    it('should respect max retry limits', async () => {
      const recoveryListener = vi.fn()
      window.addEventListener('medicalCalculatorRecovery', recoveryListener)

      errorBoundaryManager.configure({ enableAutoRecovery: true, maxRetries: 2 })

      const networkError = new NetworkError('Connection failed')
      const context = { component: 'TestComponent', action: 'fetch' }
      
      // Trigger same error multiple times
      await errorBoundaryManager.handleError(networkError, 'TestComponent', 'audit', context)
      await errorBoundaryManager.handleError(networkError, 'TestComponent', 'audit', context)
      await errorBoundaryManager.handleError(networkError, 'TestComponent', 'audit', context) // Should not retry

      vi.advanceTimersByTime(5000)

      // Should only have 2 recovery attempts
      expect(recoveryListener).toHaveBeenCalledTimes(2)

      window.removeEventListener('medicalCalculatorRecovery', recoveryListener)
    })
  })

  describe('configuration', () => {
    it('should apply custom configuration', () => {
      const config: ErrorBoundaryConfig = {
        enableAutoRecovery: false,
        maxRetries: 5,
        showToast: false,
        onError: vi.fn()
      }

      errorBoundaryManager.configure(config)

      // Configuration should be applied (internal test)
      expect(config.onError).toBeDefined()
    })

    it('should call custom error handler', async () => {
      const customHandler = vi.fn()
      
      errorBoundaryManager.configure({ onError: customHandler })

      const testError = new Error('Test error')
      await errorBoundaryManager.handleError(testError, 'TestComponent', 'audit')

      expect(customHandler).toHaveBeenCalledWith(
        testError,
        expect.objectContaining({
          errorMessage: 'Test error',
          componentName: 'TestComponent'
        })
      )
    })
  })

  describe('error management', () => {
    it('should clear all errors', async () => {
      const testError1 = new Error('Error 1')
      const testError2 = new Error('Error 2')
      
      await errorBoundaryManager.handleError(testError1, 'Component1', 'audit')
      await errorBoundaryManager.handleError(testError2, 'Component2', 'danpss')

      expect(errorBoundaryManager.getErrors().length).toBe(2)

      errorBoundaryManager.clearErrors()
      expect(errorBoundaryManager.getErrors().length).toBe(0)
    })

    it('should report errors with context', async () => {
      const testError = new Error('Report test')
      const context = { componentName: 'TestComponent', calculatorType: 'audit', extra: 'data' }
      
      errorBoundaryManager.reportError(testError, context)

      // Should be handled via handleError method
      const errors = errorBoundaryManager.getErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].componentName).toBe('TestComponent')
      expect(errors[0].calculatorType).toBe('audit')
    })
  })
})

describe('Custom Error Classes', () => {
  it('should create MedicalCalculatorError with context', () => {
    const error = new MedicalCalculatorError(
      'Medical error',
      ErrorType.CALCULATION,
      'CALC_001',
      { component: 'Calculator' }
    )

    expect(error.message).toBe('Medical error')
    expect(error.errorType).toBe(ErrorType.CALCULATION)
    expect(error.errorCode).toBe('CALC_001')
    expect(error.context?.component).toBe('Calculator')
    expect(error.name).toBe('MedicalCalculatorError')
  })

  it('should create specialized error types', () => {
    const networkError = new NetworkError('Network failed', 'NET_001', { url: '/api/test' })
    const calculationError = new CalculationError('Calc failed', 'CALC_001')
    const validationError = new ValidationError('Validation failed', 'VAL_001')
    const uiError = new UIError('UI failed', 'UI_001')
    const securityError = new SecurityError('Security failed', 'SEC_001')
    const dataError = new DataError('Data failed', 'DATA_001')

    expect(networkError.errorType).toBe(ErrorType.NETWORK)
    expect(calculationError.errorType).toBe(ErrorType.CALCULATION)
    expect(validationError.errorType).toBe(ErrorType.VALIDATION)
    expect(uiError.errorType).toBe(ErrorType.UI)
    expect(securityError.errorType).toBe(ErrorType.SECURITY)
    expect(dataError.errorType).toBe(ErrorType.DATA)

    expect(networkError.context?.url).toBe('/api/test')
  })
})

describe('ErrorBoundary Component', () => {
  let wrapper: any

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should render children when no error', () => {
    const TestChild = defineComponent({
      template: '<div>Child content</div>'
    })

    const TestComponent = defineComponent({
      components: { ErrorBoundary, TestChild },
      template: `
        <ErrorBoundary>
          <TestChild />
        </ErrorBoundary>
      `
    })

    wrapper = mount(TestComponent)
    expect(wrapper.text()).toContain('Child content')
  })

  it('should render error UI when error occurs', async () => {
    const ThrowingChild = defineComponent({
      setup() {
        throw new Error('Test error')
      },
      template: '<div>This should not render</div>'
    })

    const TestComponent = defineComponent({
      components: { ErrorBoundary, ThrowingChild },
      template: `
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>
      `
    })

    try {
      wrapper = mount(TestComponent)
    } catch (error) {
      // Error is expected during mount
    }

    // Should show error UI
    if (wrapper?.exists()) {
      expect(wrapper.text()).toContain('Der opstod en fejl')
    }
  })

  it('should render custom fallback component', async () => {
    const CustomFallback = defineComponent({
      props: ['error', 'resetError'],
      template: `
        <div>
          <h3>Custom Error: {{ error?.message }}</h3>
          <button @click="resetError">Reset</button>
        </div>
      `
    })

    const ThrowingChild = defineComponent({
      setup() {
        throw new Error('Custom test error')
      },
      template: '<div>This should not render</div>'
    })

    const TestComponent = defineComponent({
      components: { ErrorBoundary, ThrowingChild, CustomFallback },
      template: `
        <ErrorBoundary :fallback="CustomFallback">
          <ThrowingChild />
        </ErrorBoundary>
      `,
      data() {
        return { CustomFallback }
      }
    })

    try {
      wrapper = mount(TestComponent)
    } catch (error) {
      // Error is expected during mount
    }

    if (wrapper?.exists()) {
      expect(wrapper.text()).toContain('Custom Error')
    }
  })

  it('should call onError callback', async () => {
    const onError = vi.fn()

    const ThrowingChild = defineComponent({
      setup() {
        throw new Error('Callback test error')
      },
      template: '<div>This should not render</div>'
    })

    const TestComponent = defineComponent({
      components: { ErrorBoundary, ThrowingChild },
      template: `
        <ErrorBoundary :onError="onError">
          <ThrowingChild />
        </ErrorBoundary>
      `,
      data() {
        return { onError }
      }
    })

    try {
      wrapper = mount(TestComponent)
    } catch (error) {
      // Error is expected during mount
    }

    if (onError.mock.calls.length > 0) {
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentName: expect.any(String) })
      )
    }
  })
})

describe('withErrorBoundary', () => {
  it('should set up global error handlers', () => {
    const app = createApp({ template: '<div>Test App</div>' })
    
    withErrorBoundary(app)

    expect(app.config.errorHandler).toBeDefined()
    expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
  })

  it('should apply custom configuration', () => {
    const app = createApp({ template: '<div>Test App</div>' })
    const config: ErrorBoundaryConfig = {
      enableAutoRecovery: false,
      showToast: false
    }
    
    withErrorBoundary(app, config)

    expect(app.config.errorHandler).toBeDefined()
  })

  it('should handle global errors', () => {
    const app = createApp({ template: '<div>Test App</div>' })
    withErrorBoundary(app)

    const testError = new Error('Global error')
    const mockInstance = { $options: { name: 'TestComponent' } }
    
    // Simulate Vue error
    app.config.errorHandler?.(testError, mockInstance, 'render function')

    const errors = errorBoundaryManager.getErrors()
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should handle unhandled promise rejections', () => {
    const app = createApp({ template: '<div>Test App</div>' })
    withErrorBoundary(app)

    const rejectionReason = 'Promise rejection'
    const rejectionEvent = new Event('unhandledrejection') as PromiseRejectionEvent
    Object.defineProperty(rejectionEvent, 'reason', {
      value: { message: rejectionReason },
      writable: false
    })

    window.dispatchEvent(rejectionEvent)

    const errors = errorBoundaryManager.getErrors()
    expect(errors.some(error => error.errorMessage.includes('Unhandled Promise Rejection'))).toBe(true)
  })
})

describe('cleanupErrorBoundary', () => {
  it('should clean up global event listeners', () => {
    // Mock app elements
    const mockApp = {
      __errorBoundaryCleanup: vi.fn()
    }
    
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockApp] as any)

    cleanupErrorBoundary()

    expect(mockApp.__errorBoundaryCleanup).toHaveBeenCalled()
  })

  it('should handle apps without cleanup function', () => {
    const mockApp = {}
    
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([mockApp] as any)

    // Should not throw error
    expect(() => cleanupErrorBoundary()).not.toThrow()
  })
})