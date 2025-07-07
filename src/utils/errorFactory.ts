import type { ErrorInfo, ErrorType } from './errorBoundary'

export interface ErrorContext {
  component?: string
  calculator?: string
  action?: string
  vueInstance?: boolean
  vueInfo?: string
  globalHandler?: boolean
  promiseRejection?: boolean
  reason?: any
  data?: any
}

/**
 * Shared error factory for consistent error processing
 * Eliminates duplication between useErrorHandler and errorBoundaryManager
 */
export class ErrorFactory {
  /**
   * Create a standardized ErrorInfo object from an error and context
   */
  static createErrorInfo(
    error: Error,
    errorType: ErrorType,
    context: ErrorContext = {},
    recoverable: boolean = false
  ): ErrorInfo {
    return {
      componentName: context.component,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date(),
      calculatorType: context.calculator,
      errorType,
      recoverable
    }
  }

  /**
   * Create a unique error key for retry tracking
   */
  static createErrorKey(errorInfo: ErrorInfo, context?: ErrorContext): string {
    const component = context?.component || errorInfo.componentName || 'unknown'
    const action = context?.action || 'unknown'
    return `${component}-${action}-${errorInfo.errorType}`
  }

  /**
   * Create a unique error ID for tracking individual errors
   */
  static createErrorId(errorInfo: ErrorInfo): string {
    const component = errorInfo.componentName || 'unknown'
    return `${component}-${errorInfo.errorType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}