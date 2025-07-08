import { ErrorType, type ErrorInfo } from '@/utils/errorBoundary';
import type { ErrorRecoveryStrategy, RecoveryResult } from './RecoveryStrategy';

export class NetworkErrorStrategy implements ErrorRecoveryStrategy {
  canRecover(errorInfo: ErrorInfo): boolean {
    return errorInfo.errorType === ErrorType.NETWORK;
  }

  async recover(errorInfo: ErrorInfo, context?: any): Promise<RecoveryResult> {
    if (!navigator.onLine) {
      await this.waitForOnline();
    }

    const delay = this.getRetryDelay(context?.attempt || 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    return { success: true, shouldRetry: true };
  }

  getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
  }

  private waitForOnline = (): Promise<void> => {
    return new Promise((resolve) => {
      if (navigator.onLine) {
        resolve();
        return;
      }

      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };

      window.addEventListener('online', handleOnline);
    });
  };
}
