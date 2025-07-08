import { ErrorType, type ErrorInfo } from '@/utils/errorBoundary';
import type { ErrorRecoveryStrategy, RecoveryResult } from './RecoveryStrategy';

export class CalculationErrorStrategy implements ErrorRecoveryStrategy {
  canRecover(errorInfo: ErrorInfo): boolean {
    return errorInfo.errorType === ErrorType.CALCULATION;
  }

  async recover(_errorInfo: ErrorInfo): Promise<RecoveryResult> {
    // Calculation errors are not typically auto-recoverable
    return { success: false, shouldRetry: false };
  }

  getRetryDelay(): number {
    return 0;
  }
}
