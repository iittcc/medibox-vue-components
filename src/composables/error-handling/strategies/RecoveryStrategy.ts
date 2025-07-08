import type { ErrorInfo } from '@/utils/errorBoundary';

export interface RecoveryResult {
  success: boolean;
  shouldRetry?: boolean;
  requiresUserInput?: boolean;
}

export interface ErrorRecoveryStrategy {
  canRecover(errorInfo: ErrorInfo): boolean;
  recover(errorInfo: ErrorInfo, context?: any): Promise<RecoveryResult>;
  getRetryDelay(attempt: number): number;
}
