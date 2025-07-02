import { type App, createApp, h, ref, type Component } from 'vue'
import { useToast } from 'primevue/usetoast'

export interface ErrorInfo {
  componentName?: string
  errorMessage: string
  errorStack?: string
  timestamp: Date
  userId?: string
  calculatorType?: string
  errorType: ErrorType
  recoverable: boolean
}

export enum ErrorType {
  NETWORK = 'network',
  CALCULATION = 'calculation',
  VALIDATION = 'validation',
  UI = 'ui',
  SECURITY = 'security',
  DATA = 'data',
  UNKNOWN = 'unknown'
}

// Custom error classes for reliable categorization
export class MedicalCalculatorError extends Error {
  public readonly errorType: ErrorType
  public readonly errorCode?: string
  public readonly context?: Record<string, any>

  constructor(message: string, errorType: ErrorType, errorCode?: string, context?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
    this.errorType = errorType
    this.errorCode = errorCode
    this.context = context
  }
}

export class NetworkError extends MedicalCalculatorError {
  constructor(message: string, errorCode?: string, context?: Record<string, any>) {
    super(message, ErrorType.NETWORK, errorCode, context)
  }
}

export class CalculationError extends MedicalCalculatorError {
  constructor(message: string, errorCode?: string, context?: Record<string, any>) {
    super(message, ErrorType.CALCULATION, errorCode, context)
  }
}

export class ValidationError extends MedicalCalculatorError {
  constructor(message: string, errorCode?: string, context?: Record<string, any>) {
    super(message, ErrorType.VALIDATION, errorCode, context)
  }
}

export class UIError extends MedicalCalculatorError {
  constructor(message: string, errorCode?: string, context?: Record<string, any>) {
    super(message, ErrorType.UI, errorCode, context)
  }
}

export class SecurityError extends MedicalCalculatorError {
  constructor(message: string, errorCode?: string, context?: Record<string, any>) {
    super(message, ErrorType.SECURITY, errorCode, context)
  }
}

export class DataError extends MedicalCalculatorError {
  constructor(message: string, errorCode?: string, context?: Record<string, any>) {
    super(message, ErrorType.DATA, errorCode, context)
  }
}

export interface ErrorBoundaryConfig {
  fallbackComponent?: Component
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableAutoRecovery?: boolean
  maxRetries?: number
  showToast?: boolean
}

class ErrorBoundaryManager {
  private errors = ref<ErrorInfo[]>([])
  private retryCount = ref<Map<string, number>>(new Map())
  private config: ErrorBoundaryConfig = {
    enableAutoRecovery: true,
    maxRetries: 3,
    showToast: true
  }

  configure(config: Partial<ErrorBoundaryConfig>) {
    this.config = { ...this.config, ...config }
  }

  categorizeError(error: Error): ErrorType {
    // Check if it's one of our custom error classes first
    if (error instanceof MedicalCalculatorError) {
      return error.errorType
    }

    // Check for specific error types by constructor name
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return ErrorType.NETWORK
    }

    // Check for error codes or properties
    const errorWithCode = error as any
    if (errorWithCode.code) {
      switch (errorWithCode.code) {
        case 'NETWORK_ERROR':
        case 'ENOTFOUND':
        case 'ECONNREFUSED':
        case 'TIMEOUT':
          return ErrorType.NETWORK
        case 'VALIDATION_ERROR':
        case 'INVALID_INPUT':
          return ErrorType.VALIDATION
        case 'CALCULATION_ERROR':
        case 'MATH_ERROR':
          return ErrorType.CALCULATION
        case 'SECURITY_ERROR':
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
          return ErrorType.SECURITY
        case 'DATA_ERROR':
        case 'PARSE_ERROR':
          return ErrorType.DATA
        default:
          break
      }
    }

    // Fallback to message-based categorization for third-party errors
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    // Network errors
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('timeout') || message.includes('connection') ||
        message.includes('cors') || message.includes('xhr')) {
      return ErrorType.NETWORK
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || 
        message.includes('required') || message.includes('format') ||
        message.includes('schema') || message.includes('constraint')) {
      return ErrorType.VALIDATION
    }

    // Calculation errors
    if (message.includes('calculation') || message.includes('score') || 
        message.includes('math') || message.includes('division') ||
        message.includes('nan') || message.includes('infinity')) {
      return ErrorType.CALCULATION
    }

    // UI errors
    if (message.includes('render') || message.includes('component') || 
        stack.includes('vue') || stack.includes('render') ||
        message.includes('template') || message.includes('directive')) {
      return ErrorType.UI
    }

    // Security errors
    if (message.includes('unauthorized') || message.includes('forbidden') || 
        message.includes('security') || message.includes('permission') ||
        message.includes('csrf') || message.includes('xss')) {
      return ErrorType.SECURITY
    }

    // Data errors
    if (message.includes('data') || message.includes('parse') || 
        message.includes('json') || message.includes('corrupt') ||
        message.includes('serialize') || message.includes('deserialize')) {
      return ErrorType.DATA
    }

    return ErrorType.UNKNOWN
  }

  getUserFriendlyMessage(errorType: ErrorType, error: Error): string {
    switch (errorType) {
      case ErrorType.NETWORK:
        return 'Der opstod en netværksfejl. Tjek din internetforbindelse og prøv igen.'
      case ErrorType.CALCULATION:
        return 'Der opstod en fejl under beregningen. Kontrollér dine indtastninger og prøv igen.'
      case ErrorType.VALIDATION:
        return 'Nogle af de indtastede oplysninger er ikke gyldige. Ret fejlene og prøv igen.'
      default:
        return 'Der opstod en uventet fejl. Prøv at genindlæse siden eller kontakt support.'
    }
  }

  isRecoverable(errorType: ErrorType): boolean {
    return errorType === ErrorType.NETWORK || errorType === ErrorType.VALIDATION
  }

  async handleError(error: Error, componentName?: string, calculatorType?: string, context?: Record<string, any>): Promise<void> {
    const errorType = this.categorizeError(error)
    // Create a more robust error key to prevent collisions
    const errorKey = `${context?.component || componentName || 'unknown'}-${errorType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const retryKey = `${context?.component || componentName || 'unknown'}-${errorType}` // Keep simpler key for retry logic
    const currentRetries = this.retryCount.value.get(retryKey) || 0
    
    const errorInfo: ErrorInfo = {
      componentName,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date(),
      calculatorType,
      errorType,
      recoverable: this.isRecoverable(errorType) && currentRetries < this.config.maxRetries!
    }

    this.errors.value.push(errorInfo)

    // Emit error event for logging
    this.emitErrorEvent(errorInfo)

    // Show user notification if enabled
    if (this.config.showToast) {
      this.showErrorToast(errorInfo)
    }

    // Call custom error handler if provided
    if (this.config.onError) {
      this.config.onError(error, errorInfo)
    }

    // Handle auto-recovery
    if (this.config.enableAutoRecovery && errorInfo.recoverable) {
      this.retryCount.value.set(retryKey, currentRetries + 1)
      
      if (errorType === ErrorType.NETWORK) {
        // Exponential backoff for network errors
        const delay = Math.min(1000 * Math.pow(2, currentRetries), 10000)
        setTimeout(() => {
          this.emitRecoveryEvent(errorInfo)
        }, delay)
      }
    }
  }

  private emitErrorEvent(errorInfo: ErrorInfo) {
    window.dispatchEvent(new CustomEvent('medicalCalculatorError', {
      detail: errorInfo
    }))
  }

  private emitRecoveryEvent(errorInfo: ErrorInfo) {
    window.dispatchEvent(new CustomEvent('medicalCalculatorRecovery', {
      detail: { ...errorInfo, action: 'retry' }
    }))
  }

  private showErrorToast(errorInfo: ErrorInfo) {
    // This will be handled by the component using the error boundary
    window.dispatchEvent(new CustomEvent('showErrorToast', {
      detail: {
        severity: errorInfo.errorType === ErrorType.NETWORK ? 'warn' : 'error',
        summary: 'Fejl',
        detail: this.getUserFriendlyMessage(errorInfo.errorType, { message: errorInfo.errorMessage } as Error),
        life: errorInfo.recoverable ? 5000 : 10000
      }
    }))
  }

  clearErrors() {
    this.errors.value = []
    this.retryCount.value.clear()
  }

  getErrors() {
    return this.errors.value
  }

  reportError(error: Error, context?: Record<string, any>) {
    this.handleError(error, context?.componentName, context?.calculatorType, context)
  }
}

export const errorBoundaryManager = new ErrorBoundaryManager()

// Vue 3 Error Boundary Component
export const ErrorBoundary = {
  name: 'ErrorBoundary',
  props: {
    fallback: {
      type: Object,
      default: null
    },
    onError: {
      type: Function,
      default: null
    }
  },
  setup(props: any, { slots }: any) {
    const hasError = ref(false)
    const error = ref<Error | null>(null)

    const resetError = () => {
      hasError.value = false
      error.value = null
    }

    return {
      hasError,
      error,
      resetError,
      render: () => {
        if (hasError.value && props.fallback) {
          return h(props.fallback, {
            error: error.value,
            resetError
          })
        }
        
        if (hasError.value) {
          return h('div', {
            class: 'medical-calculator-container p-4 text-center'
          }, [
            h('div', {
              class: 'bg-red-50 border border-red-200 rounded-md p-4'
            }, [
              h('h3', {
                class: 'text-lg font-medium text-red-800 mb-2'
              }, 'Der opstod en fejl'),
              h('p', {
                class: 'text-red-700 mb-4'
              }, 'Prøv at genindlæse siden eller kontakt support hvis problemet fortsætter.'),
              h('button', {
                class: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700',
                onClick: resetError
              }, 'Prøv igen')
            ])
          ])
        }

        return slots.default?.()
      }
    }
  },
  errorCaptured(error: Error, instance: any) {
    const componentName = instance?.$options?.name || 'Unknown'
    const context = { component: componentName, vueInstance: true }
    
    errorBoundaryManager.handleError(error, componentName, undefined, context)
    
    this.hasError = true
    this.error = error
    
    if (this.onError) {
      this.onError(error, { componentName })
    }
    
    return false
  },
  render() {
    return this.render()
  }
}

// Wrapper function for wrapping Vue apps with error boundary
export function withErrorBoundary(app: App, config?: ErrorBoundaryConfig) {
  if (config) {
    errorBoundaryManager.configure(config)
  }

  app.config.errorHandler = (error: Error, instance: any, info: string) => {
    const componentName = instance?.$options?.name || 'Unknown'
    const context = { component: componentName, vueInfo: info, globalHandler: true }
    errorBoundaryManager.handleError(error, componentName, undefined, context)
  }

  // Store global event handler for proper cleanup
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const context = { component: 'Global', promiseRejection: true, reason: event.reason }
    errorBoundaryManager.handleError(
      new Error(event.reason?.message || 'Unhandled Promise Rejection'),
      'Global',
      'Promise',
      context
    )
  }

  // Global error handler for unhandled promises
  window.addEventListener('unhandledrejection', handleUnhandledRejection)

  // Store cleanup function on the app instance for later use
  ;(app as any).__errorBoundaryCleanup = () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }

  return app
}

// Cleanup function for removing global event listeners
export const cleanupErrorBoundary = () => {
  const apps = document.querySelectorAll('[data-v-app]') as NodeListOf<any>
  apps.forEach(app => {
    if (app.__errorBoundaryCleanup) {
      app.__errorBoundaryCleanup()
    }
  })
}