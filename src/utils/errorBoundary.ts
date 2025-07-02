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
  UNKNOWN = 'unknown'
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
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch') || message.includes('cors')) {
      return ErrorType.NETWORK
    }
    
    if (message.includes('calculation') || message.includes('score') || message.includes('invalid result')) {
      return ErrorType.CALCULATION
    }
    
    if (message.includes('validation') || message.includes('required') || message.includes('invalid input')) {
      return ErrorType.VALIDATION
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

  async handleError(error: Error, componentName?: string, calculatorType?: string): Promise<void> {
    const errorType = this.categorizeError(error)
    const errorKey = `${componentName}-${errorType}`
    const currentRetries = this.retryCount.value.get(errorKey) || 0
    
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
      this.retryCount.value.set(errorKey, currentRetries + 1)
      
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
    this.handleError(error, context?.componentName, context?.calculatorType)
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
    
    errorBoundaryManager.handleError(error, componentName)
    
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
    errorBoundaryManager.handleError(error, componentName)
  }

  // Global error handler for unhandled promises
  window.addEventListener('unhandledrejection', (event) => {
    errorBoundaryManager.handleError(
      new Error(event.reason?.message || 'Unhandled Promise Rejection'),
      'Global',
      'Promise'
    )
  })

  return app
}