import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { errorBoundaryManager, type ErrorInfo, ErrorType } from '@/utils/errorBoundary'
import { useEventManager } from '@/utils/eventManager'
import { useNetworkStatus } from './useNetworkStatus'
import { useNotifications } from './useNotifications'
import { RecoveryManager } from './error-handling/RecoveryManager'
import { useErrorState } from './error-handling/useErrorState'
import { ErrorFactory, type ErrorContext } from '@/utils/errorFactory'

export interface ErrorHandlerOptions {
  showToasts?: boolean
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
   
  onError?: (error: ErrorInfo) => void
   
  onRecovery?: (error: ErrorInfo) => void
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { showErrorToast, showSuccess, showInfo, showWarning } = useNotifications()
  const eventManager = useEventManager()
  const recoveryManager = new RecoveryManager()
  const { 
    errors, 
    hasErrors, 
    networkErrors, 
    validationErrors, 
    calculationErrors, 
    addError, 
    clearErrors, 
    clearError, 
    clearErrorsByType 
  } = useErrorState()
  const { isOnline } = useNetworkStatus()
  const retryAttempts = ref<Map<string, number>>(new Map())

  const {
    showToasts = true,
    autoRetry = true,
    maxRetries = 3,
    // retryDelay = 1000,
    onError,
    onRecovery
  } = options

  

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
    context?: ErrorContext
  ) => {
    const errorType = categorizeError(error)
    const errorInfo = ErrorFactory.createErrorInfo(
      error,
      errorType,
      context,
      isRecoverable(errorType)
    )
    const errorKey = ErrorFactory.createErrorKey(errorInfo, context)

    addError(errorInfo)

    // Show toast notification
    if (showToasts) {
      const message = getUserFriendlyMessage(errorInfo.errorType, { message: errorInfo.errorMessage } as Error)
      showErrorToast(errorInfo.errorType, message, errorInfo.recoverable)
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
    const result = await recoveryManager.attemptRecovery(errorInfo, context)
    return result.success
  }

  

  

  // Network status handling
  const handleOnlineStatusChange = () => {
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


  // Lifecycle hooks with type-safe event management
  onMounted(() => {
    // Network status events
    eventManager.subscribe('network:online', () => {
      handleOnlineStatusChange()
    })
    
    eventManager.subscribe('network:offline', () => {
      handleOnlineStatusChange()
    })
    
    // Error events
    eventManager.subscribe('error:medical-calculator', (errorInfo) => {
      addError(errorInfo)
      if (showToasts) {
        const message = getUserFriendlyMessage(errorInfo.errorType, { message: errorInfo.errorMessage } as Error)
        showErrorToast(errorInfo.errorType, message, errorInfo.recoverable)
      }
    })
    
    // Recovery events
    eventManager.subscribe('error:recovery', (errorInfo) => {
      if (onRecovery) {
        onRecovery(errorInfo)
      }
    })
    
    // Toast events
    eventManager.subscribe('notification:show-toast', (toastOptions) => {
      if (toastOptions.severity === 'success') {
        showSuccess(toastOptions.summary, toastOptions.detail)
      } else if (toastOptions.severity === 'info') {
        showInfo(toastOptions.summary, toastOptions.detail)
      } else if (toastOptions.severity === 'warn') {
        showWarning(toastOptions.summary, toastOptions.detail)
      } else if (toastOptions.severity === 'error') {
        // We need an error type to call showErrorToast, but the event doesn't provide one.
        // We'll default to UNKNOWN. A better solution would be to refactor the event
        // to include the error type.
        showErrorToast(ErrorType.UNKNOWN, toastOptions.detail ?? '', false)
      }
    })
  })

  onUnmounted(() => {
    // Cleanup all event listeners automatically
    eventManager.cleanup()
  })

  return {
    // State
    errors,
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