import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { errorBoundaryManager, type ErrorInfo, ErrorType } from '@/utils/errorBoundary'

export interface ErrorHandlerOptions {
  showToasts?: boolean
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  onError?: (error: ErrorInfo) => void
  onRecovery?: (error: ErrorInfo) => void
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const toast = useToast()
  const errors = ref<ErrorInfo[]>([])
  const isOnline = ref(navigator.onLine)
  const retryAttempts = ref<Map<string, number>>(new Map())

  const {
    showToasts = true,
    autoRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRecovery
  } = options

  // Computed properties
  const hasErrors = computed(() => errors.value.length > 0)
  const networkErrors = computed(() => 
    errors.value.filter(error => error.errorType === ErrorType.NETWORK)
  )
  const validationErrors = computed(() => 
    errors.value.filter(error => error.errorType === ErrorType.VALIDATION)
  )
  const calculationErrors = computed(() => 
    errors.value.filter(error => error.errorType === ErrorType.CALCULATION)
  )

  // Error categorization helpers
  const categorizeError = (error: Error): ErrorType => {
    return errorBoundaryManager.categorizeError(error)
  }

  const getUserFriendlyMessage = (errorType: ErrorType, error: Error): string => {
    return errorBoundaryManager.getUserFriendlyMessage(errorType, error)
  }

  // Error handling methods
  const handleError = async (
    error: Error, 
    context?: { 
      component?: string
      calculator?: string
      action?: string
      data?: any
    }
  ) => {
    const errorType = categorizeError(error)
    const errorKey = `${context?.component || 'unknown'}-${context?.action || 'unknown'}`
    
    const errorInfo: ErrorInfo = {
      componentName: context?.component,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date(),
      calculatorType: context?.calculator,
      errorType,
      recoverable: isRecoverable(errorType)
    }

    errors.value.push(errorInfo)

    // Show toast notification
    if (showToasts) {
      showErrorToast(errorInfo)
    }

    // Handle auto-retry logic
    if (autoRetry && errorInfo.recoverable) {
      const currentAttempts = retryAttempts.value.get(errorKey) || 0
      if (currentAttempts < maxRetries) {
        retryAttempts.value.set(errorKey, currentAttempts + 1)
        await attemptRecovery(errorInfo, context)
      }
    }

    // Call custom error handler
    if (onError) {
      onError(errorInfo)
    }

    // Report to error boundary manager
    errorBoundaryManager.reportError(error, context)
  }

  const isRecoverable = (errorType: ErrorType): boolean => {
    return errorType === ErrorType.NETWORK || errorType === ErrorType.VALIDATION
  }

  const attemptRecovery = async (
    errorInfo: ErrorInfo, 
    context?: any
  ): Promise<boolean> => {
    try {
      if (errorInfo.errorType === ErrorType.NETWORK) {
        // Wait for network recovery
        if (!isOnline.value) {
          await waitForOnline()
        }
        
        // Exponential backoff
        const attempt = retryAttempts.value.get(`${context?.component}-${context?.action}`) || 1
        const delay = retryDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        if (onRecovery) {
          onRecovery(errorInfo)
        }
        
        return true
      }
      
      if (errorInfo.errorType === ErrorType.VALIDATION) {
        // Validation errors require user input, no automatic recovery
        return false
      }
      
      return false
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError)
      return false
    }
  }

  const waitForOnline = (): Promise<void> => {
    return new Promise((resolve) => {
      if (isOnline.value) {
        resolve()
        return
      }
      
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline)
        resolve()
      }
      
      window.addEventListener('online', handleOnline)
    })
  }

  const showErrorToast = (errorInfo: ErrorInfo) => {
    const severity = getSeverity(errorInfo.errorType)
    const message = getUserFriendlyMessage(errorInfo.errorType, { message: errorInfo.errorMessage } as Error)
    
    toast.add({
      severity,
      summary: getToastSummary(errorInfo.errorType),
      detail: message,
      life: errorInfo.recoverable ? 5000 : 10000,
      closable: true
    })
  }

  const getSeverity = (errorType: ErrorType): 'success' | 'info' | 'warn' | 'error' => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return 'warn'
      case ErrorType.VALIDATION:
        return 'info'
      case ErrorType.CALCULATION:
      case ErrorType.UNKNOWN:
      default:
        return 'error'
    }
  }

  const getToastSummary = (errorType: ErrorType): string => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return 'Netværksfejl'
      case ErrorType.VALIDATION:
        return 'Valideringsfejl'
      case ErrorType.CALCULATION:
        return 'Beregningsfejl'
      case ErrorType.UNKNOWN:
      default:
        return 'Systemfejl'
    }
  }

  // User notification methods
  const showSuccess = (message: string, detail?: string) => {
    toast.add({
      severity: 'success',
      summary: message,
      detail,
      life: 3000
    })
  }

  const showInfo = (message: string, detail?: string) => {
    toast.add({
      severity: 'info',
      summary: message,
      detail,
      life: 5000
    })
  }

  const showWarning = (message: string, detail?: string) => {
    toast.add({
      severity: 'warn',
      summary: message,
      detail,
      life: 7000
    })
  }

  // Error management
  const clearErrors = () => {
    errors.value = []
    retryAttempts.value.clear()
  }

  const clearError = (index: number) => {
    if (index >= 0 && index < errors.value.length) {
      errors.value.splice(index, 1)
    }
  }

  const clearErrorsByType = (errorType: ErrorType) => {
    errors.value = errors.value.filter(error => error.errorType !== errorType)
  }

  // Network status handling
  const handleOnlineStatusChange = () => {
    isOnline.value = navigator.onLine
    
    if (isOnline.value && networkErrors.value.length > 0) {
      showInfo('Internetforbindelse genoprettet', 'Forsøger at gensende data...')
      
      // Trigger recovery for network errors
      networkErrors.value.forEach(error => {
        if (onRecovery) {
          onRecovery(error)
        }
      })
    } else if (!isOnline.value) {
      showWarning('Ingen internetforbindelse', 'Data gemmes lokalt indtil forbindelsen er genoprettet.')
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)
    
    // Listen for error boundary events
    window.addEventListener('medicalCalculatorError', ((event: CustomEvent) => {
      const errorInfo = event.detail as ErrorInfo
      errors.value.push(errorInfo)
      
      if (showToasts) {
        showErrorToast(errorInfo)
      }
    }) as EventListener)
    
    // Listen for recovery events
    window.addEventListener('medicalCalculatorRecovery', ((event: CustomEvent) => {
      const errorInfo = event.detail as ErrorInfo
      if (onRecovery) {
        onRecovery(errorInfo)
      }
    }) as EventListener)
    
    // Listen for toast events from error boundary
    window.addEventListener('showErrorToast', ((event: CustomEvent) => {
      const toastOptions = event.detail
      toast.add(toastOptions)
    }) as EventListener)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnlineStatusChange)
    window.removeEventListener('offline', handleOnlineStatusChange)
    window.removeEventListener('medicalCalculatorError', handleOnlineStatusChange)
    window.removeEventListener('medicalCalculatorRecovery', handleOnlineStatusChange)
    window.removeEventListener('showErrorToast', handleOnlineStatusChange)
  })

  return {
    // State
    errors: readonly(errors),
    hasErrors,
    isOnline: readonly(isOnline),
    networkErrors,
    validationErrors,
    calculationErrors,
    
    // Methods
    handleError,
    clearErrors,
    clearError,
    clearErrorsByType,
    showSuccess,
    showInfo,
    showWarning,
    
    // Utilities
    categorizeError,
    getUserFriendlyMessage,
    isRecoverable
  }
}