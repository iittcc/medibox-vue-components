import { ErrorType, type ErrorInfo } from '@/utils/errorBoundary';
import type { ErrorRecoveryStrategy, RecoveryResult } from './RecoveryStrategy';

export class ValidationErrorStrategy implements ErrorRecoveryStrategy {
  canRecover(errorInfo: ErrorInfo): boolean {
    return errorInfo.errorType === ErrorType.VALIDATION;
  }

  async recover(_errorInfo: ErrorInfo): Promise<RecoveryResult> {
    // Validation errors require user input, no automatic recovery
    return { success: false, shouldRetry: false, requiresUserInput: true };
  }

  getRetryDelay(): number {
    return 0; // No retry for validation errors
  }
}
